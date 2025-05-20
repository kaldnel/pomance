from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO, emit
import json
import os
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev')

# Configure CORS for production
socketio = SocketIO(app, 
                   cors_allowed_origins="*",
                   async_mode='eventlet',
                   logger=True,
                   engineio_logger=True)

# Load animal data
def load_animals():
    try:
        with open('data/animals.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "chicken": {"duration": 15, "reward": 10, "price": 50},
            "goat": {"duration": 25, "reward": 20, "price": 100},
            "sheep": {"duration": 35, "reward": 30, "price": 150},
            "pig": {"duration": 45, "reward": 40, "price": 200},
            "cow": {"duration": 60, "reward": 50, "price": 250},
            "horse": {"duration": 90, "reward": 75, "price": 350}
        }

# Load user data
def load_user_data():
    try:
        with open('data/data.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "luu": {
                "cash": 100,
                "inventory": [],
                "sessions_today": 0,
                "last_session": None,
                "folders": []
            },
            "4keni": {
                "cash": 100,
                "inventory": [],
                "sessions_today": 0,
                "last_session": None,
                "folders": []
            }
        }

# Save user data
def save_user_data(data):
    os.makedirs('data', exist_ok=True)
    with open('data/data.json', 'w') as f:
        json.dump(data, f, indent=4)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/available_animals')
def available_animals():
    return jsonify(load_animals())

@app.route('/status')
def status():
    return jsonify({"status": "healthy"})

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('get_folders')
def handle_get_folders():
    user_data = load_user_data()
    emit('folders_updated', {
        'user': 'luu',
        'folders': user_data['luu']['folders']
    })
    emit('folders_updated', {
        'user': 'ken',
        'folders': user_data['4keni']['folders']
    })

@socketio.on('create_folder')
def handle_create_folder(data):
    user = data.get('user')
    folder_name = data.get('name')
    
    if not folder_name:
        emit('error', {'message': 'Folder name cannot be empty'})
        return
    
    user_data = load_user_data()
    user_key = '4keni' if user == 'ken' else user
    
    if folder_name in user_data[user_key]['folders']:
        emit('error', {'message': 'Folder already exists'})
        return
    
    user_data[user_key]['folders'].append(folder_name)
    save_user_data(user_data)
    
    emit('folders_updated', {
        'user': user,
        'folders': user_data[user_key]['folders']
    })

@socketio.on('start_session')
def handle_start_session(data):
    user = data.get('user')
    animal = data.get('animal')
    task = data.get('task', '').strip()
    bark = data.get('bark', '').strip()
    
    if not task:
        emit('error', {'message': 'Please enter a task name'})
        return
    
    if not bark:
        emit('error', {'message': 'Please select a folder'})
        return
    
    user_data = load_user_data()
    user_key = '4keni' if user == 'ken' else user
    
    if user_data[user_key]['sessions_today'] >= 5:
        emit('error', {'message': 'Daily session limit reached'})
        return
    
    if bark not in user_data[user_key]['folders']:
        emit('error', {'message': 'Invalid folder selected'})
        return
    
    animals = load_animals()
    if animal not in animals:
        emit('error', {'message': 'Invalid animal selected'})
        return
    
    user_data[user_key]['last_session'] = {
        'animal': animal,
        'task': task,
        'bark': bark,
        'start_time': datetime.now().isoformat(),
        'duration': animals[animal]['duration']
    }
    save_user_data(user_data)
    
    emit('session_started', {
        'user': user,
        'animal': animal,
        'task': task,
        'bark': bark,
        'duration': animals[animal]['duration']
    }, broadcast=True)

@socketio.on('complete_session')
def handle_complete_session(data):
    user = data.get('user')
    user_data = load_user_data()
    user_key = '4keni' if user == 'ken' else user
    animals = load_animals()
    
    if not user_data[user_key]['last_session']:
        emit('error', {'message': 'No active session found'})
        return
    
    session = user_data[user_key]['last_session']
    animal = session['animal']
    task = session['task']
    bark = session['bark']
    reward = animals[animal]['reward']
    
    user_data[user_key]['cash'] += reward
    user_data[user_key]['inventory'].append({
        'animal': animal,
        'task': task,
        'bark': bark,
        'completed_at': datetime.now().isoformat()
    })
    user_data[user_key]['sessions_today'] += 1
    user_data[user_key]['last_session'] = None
    
    save_user_data(user_data)
    
    emit('session_completed', {
        'user': user,
        'animal': animal,
        'task': task,
        'bark': bark,
        'reward': reward
    }, broadcast=True)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=False) 