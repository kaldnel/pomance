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
        currentAnimal: document.getElementById('luu-current-animal'),
        currentTask: document.getElementById('luu-current-task'),
        partnerAnimal: document.getElementById('luu-partner-animal'),
        partnerTask: document.getElementById('luu-partner-task'),
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
        currentAnimal: document.getElementById('ken-current-animal'),
        currentTask: document.getElementById('ken-current-task'),
        partnerAnimal: document.getElementById('ken-partner-animal'),
        partnerTask: document.getElementById('ken-partner-task'),
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

// Start timer
function startTimer(user) {
    if (timers[user].isRunning) return;
    
    const animal = elements[user].animalSelect.value;
    const task = elements[user].taskInput.value.trim();
    
    if (!task) {
        alert('Please enter a task name');
        return;
    }
    
    socket.emit('start_session', { user, animal, task });
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
    elements[user].taskInput.value = '';
}

// Event Listeners
elements.luu.start.addEventListener('click', () => startTimer('luu'));
elements.luu.pause.addEventListener('click', () => pauseTimer('luu'));
elements.luu.reset.addEventListener('click', () => resetTimer('luu'));

elements.ken.start.addEventListener('click', () => startTimer('ken'));
elements.ken.pause.addEventListener('click', () => pauseTimer('ken'));
elements.ken.reset.addEventListener('click', () => resetTimer('ken'));

// Socket.IO Events
socket.on('session_started', (data) => {
    const { user, animal, task, duration } = data;
    const otherUser = user === 'luu' ? 'ken' : 'luu';
    
    timers[user].timeLeft = duration * 60;
    timers[user].isRunning = true;
    elements[user].currentAnimal.textContent = animal;
    elements[user].currentTask.textContent = task;
    elements[otherUser].partnerAnimal.textContent = animal;
    elements[otherUser].partnerTask.textContent = task;
    
    updateTimer(user);
    
    timers[user].interval = setInterval(() => {
        timers[user].timeLeft--;
        updateTimer(user);
        
        if (timers[user].timeLeft <= 0) {
            clearInterval(timers[user].interval);
            timers[user].isRunning = false;
            socket.emit('complete_session', { user });
        }
    }, 1000);
});

socket.on('session_completed', (data) => {
    const { user, animal, task, reward } = data;
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
    `;
    elements[user].inventory.appendChild(inventoryItem);
    
    // Reset display
    elements[user].currentAnimal.textContent = 'None';
    elements[user].currentTask.textContent = 'No task';
    elements[otherUser].partnerAnimal.textContent = 'None';
    elements[otherUser].partnerTask.textContent = 'No task';
    elements[user].taskInput.value = '';
});

socket.on('error', (data) => {
    alert(data.message);
}); 