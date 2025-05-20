import multiprocessing
import os

# Gunicorn config
bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "eventlet"
timeout = 120
keepalive = 5
errorlog = "-"
accesslog = "-"
loglevel = "info" 