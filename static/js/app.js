// Configure Socket.IO with reconnection settings
const socket = io({
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
});

// Connection status handling
socket.on('connect', () => {
    console.log('Connected to server');
    document.body.classList.remove('disconnected');
    loadFolders();
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    document.body.classList.add('disconnected');
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    alert('Connection lost. Trying to reconnect...');
});

// Timer state
const timers = {
    luu: {
        timeLeft: 0,
        interval: null,
        isRunning: false
    },
    ken: {
        timeLeft: 0,
        interval: null,
        isRunning: false
    }
};

// DOM Elements
const elements = {
    luu: {
        timer: document.getElementById('luu-timer'),
        start: document.getElementById('luu-start'),
        pause: document.getElementById('luu-pause'),
        reset: document.getElementById('luu-reset'),
        animalSelect: document.getElementById('luu-animal-select'),
        taskInput: document.getElementById('luu-task-input'),
        barkSelect: document.getElementById('luu-bark-select'),
        newBarkBtn: document.getElementById('luu-new-bark'),
        currentAnimal: document.getElementById('luu-current-animal'),
        currentTask: document.getElementById('luu-current-task'),
        currentBark: document.getElementById('luu-current-bark'),
        partnerAnimal: document.getElementById('luu-partner-animal'),
        partnerTask: document.getElementById('luu-partner-task'),
        partnerBark: document.getElementById('luu-partner-bark'),
        inventory: document.getElementById('luu-inventory'),
        cash: document.getElementById('luu-cash')
    },
    ken: {
        timer: document.getElementById('ken-timer'),
        start: document.getElementById('ken-start'),
        pause: document.getElementById('ken-pause'),
        reset: document.getElementById('ken-reset'),
        animalSelect: document.getElementById('ken-animal-select'),
        taskInput: document.getElementById('ken-task-input'),
        barkSelect: document.getElementById('ken-bark-select'),
        newBarkBtn: document.getElementById('ken-new-bark'),
        currentAnimal: document.getElementById('ken-current-animal'),
        currentTask: document.getElementById('ken-current-task'),
        currentBark: document.getElementById('ken-current-bark'),
        partnerAnimal: document.getElementById('ken-partner-animal'),
        partnerTask: document.getElementById('ken-partner-task'),
        partnerBark: document.getElementById('ken-partner-bark'),
        inventory: document.getElementById('ken-inventory'),
        cash: document.getElementById('ken-cash')
    }
};

// Format time as MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Update timer display
function updateTimer(user) {
    elements[user].timer.textContent = formatTime(timers[user].timeLeft);
}

// Load folders from server
function loadFolders() {
    socket.emit('get_folders');
}

// Create new folder
function createNewFolder(user) {
    const folderName = prompt('Enter folder name:');
    if (folderName && folderName.trim()) {
        socket.emit('create_folder', { user, name: folderName.trim() });
    }
}

// Update folder select options
function updateFolderSelect(user, folders) {
    const select = elements[user].barkSelect;
    select.innerHTML = '<option value="">Select Folder</option>';
    folders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder;
        option.textContent = folder;
        select.appendChild(option);
    });
}

// Start timer
function startTimer(user) {
    if (timers[user].isRunning) return;
    
    const animal = elements[user].animalSelect.value;
    const task = elements[user].taskInput.value.trim();
    const bark = elements[user].barkSelect.value;
    
    if (!task) {
        alert('Please enter a task name');
        return;
    }
    
    if (!bark) {
        alert('Please select a folder');
        return;
    }

    // Get duration from the selected animal
    const duration = {
        'chicken': 15,
        'goat': 25,
        'sheep': 35,
        'pig': 45,
        'cow': 60,
        'horse': 90
    }[animal];

    // Start timer immediately
    timers[user].timeLeft = duration * 60;
    timers[user].isRunning = true;
    elements[user].currentAnimal.textContent = animal;
    elements[user].currentTask.textContent = task;
    elements[user].currentBark.textContent = bark;
    
    // Start the interval
    timers[user].interval = setInterval(() => {
        timers[user].timeLeft--;
        updateTimer(user);
        
        if (timers[user].timeLeft <= 0) {
            clearInterval(timers[user].interval);
            timers[user].isRunning = false;
            socket.emit('complete_session', { user });
        }
    }, 1000);
    
    // Emit to server
    socket.emit('start_session', { user, animal, task, bark });
}

// Pause timer
function pauseTimer(user) {
    if (!timers[user].isRunning) return;
    
    clearInterval(timers[user].interval);
    timers[user].isRunning = false;
}

// Reset timer
function resetTimer(user) {
    pauseTimer(user);
    timers[user].timeLeft = 0;
    updateTimer(user);
    elements[user].currentAnimal.textContent = 'None';
    elements[user].currentTask.textContent = 'No task';
    elements[user].currentBark.textContent = 'No folder';
    elements[user].taskInput.value = '';
}

// Event Listeners
elements.luu.start.addEventListener('click', () => startTimer('luu'));
elements.luu.pause.addEventListener('click', () => pauseTimer('luu'));
elements.luu.reset.addEventListener('click', () => resetTimer('luu'));
elements.luu.newBarkBtn.addEventListener('click', () => createNewFolder('luu'));

elements.ken.start.addEventListener('click', () => startTimer('ken'));
elements.ken.pause.addEventListener('click', () => pauseTimer('ken'));
elements.ken.reset.addEventListener('click', () => resetTimer('ken'));
elements.ken.newBarkBtn.addEventListener('click', () => createNewFolder('ken'));

// Socket.IO Events
socket.on('session_started', (data) => {
    const { user, animal, task, bark } = data;
    const otherUser = user === 'luu' ? 'ken' : 'luu';
    
    // Only update partner's view
    elements[otherUser].partnerAnimal.textContent = animal;
    elements[otherUser].partnerTask.textContent = task;
    elements[otherUser].partnerBark.textContent = bark;
});

socket.on('session_completed', (data) => {
    const { user, animal, task, bark, reward } = data;
    const otherUser = user === 'luu' ? 'ken' : 'luu';
    
    // Update cash
    const currentCash = parseInt(elements[user].cash.textContent);
    elements[user].cash.textContent = currentCash + reward;
    
    // Add to inventory
    const inventoryItem = document.createElement('div');
    inventoryItem.className = 'inventory-item';
    inventoryItem.innerHTML = `
        <div class="task-name">${task}</div>
        <div class="animal-type">${animal}</div>
        <div class="bark-name">${bark}</div>
    `;
    elements[user].inventory.appendChild(inventoryItem);
    
    // Reset display
    elements[user].currentAnimal.textContent = 'None';
    elements[user].currentTask.textContent = 'No task';
    elements[user].currentBark.textContent = 'No folder';
    elements[otherUser].partnerAnimal.textContent = 'None';
    elements[otherUser].partnerTask.textContent = 'No task';
    elements[otherUser].partnerBark.textContent = 'No folder';
    elements[user].taskInput.value = '';
});

socket.on('folders_updated', (data) => {
    const { user, folders } = data;
    updateFolderSelect(user, folders);
});

socket.on('error', (data) => {
    alert(data.message);
}); 