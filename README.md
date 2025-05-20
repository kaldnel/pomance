# Pomance - Focus Tracker

A split-screen productivity app for two users to track focus sessions with a fun livestock theme.

## Features

- Split-screen interface for two users (luu and 4keni)
- Unique themes for each user
- Animal-based focus sessions with different durations
- Real-time updates between users
- Cash rewards and inventory system
- Daily session limits
- Partner view of current sessions

## Setup

1. Create a virtual environment:
```bash
python -m venv .venv
```

2. Activate the virtual environment:
- Windows:
```bash
.venv\Scripts\activate
```
- Unix/MacOS:
```bash
source .venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
python app.py
```

The application will be available at `http://localhost:5000`

## Animal Durations and Rewards

- Chicken: 15 minutes (10 cash)
- Goat: 25 minutes (20 cash)
- Sheep: 35 minutes (30 cash)
- Pig: 45 minutes (40 cash)
- Cow: 60 minutes (50 cash)
- Horse: 90 minutes (75 cash)

## Development

The project uses:
- Flask for the backend
- Flask-SocketIO for real-time updates
- HTML/CSS/JS for the frontend
- JSON for data storage

## Data Storage

User data is stored in `data/data.json` and includes:
- Cash balance
- Inventory
- Session history
- Daily session count

## Contributing

Feel free to submit issues and enhancement requests! 