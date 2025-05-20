# Pomance - Focus Tracker

A collaborative productivity and focus tracking application built with Flask and Socket.IO. Pomance helps users stay focused and motivated through gamification elements and a livestock theme.

## Features

- Split-screen layout for two users
- Real-time synchronization using Socket.IO
- Task labeling and tracking
- Gamification with virtual currency and rewards
- Different duration options (animals) for focus sessions
- Session history and inventory tracking
- Responsive design

## Tech Stack

- Backend: Flask, Socket.IO
- Frontend: HTML, CSS, JavaScript
- Deployment: Render.com

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pomance.git
cd pomance
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
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

## Project Structure

```
pomance/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── static/            # Static files
│   ├── css/          # Stylesheets
│   └── js/           # JavaScript files
├── templates/         # HTML templates
└── data/             # Data storage
```

## Deployment

The application is configured for deployment on Render.com. The deployment settings are defined in `render.yaml`.

## License

MIT License 