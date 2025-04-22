import subprocess
import time
import signal
import sys
import os
import flask
from flask import Flask, redirect

# Create Flask app
app = Flask(__name__)

# Global variable to hold the Node.js process
node_process = None

@app.route('/')
def index():
    return redirect('http://0.0.0.0:5004/')

@app.route('/<path:path>')
def catch_all(path):
    return redirect(f'http://0.0.0.0:5004/{path}')

# Start Node.js server when this module is imported
print('Starting Node.js server on port 5004')
node_process = subprocess.Popen(['node', 'server.js'], 
                               stdout=subprocess.PIPE, 
                               stderr=subprocess.PIPE)

# Keep process reference for cleanup
if node_process:
    node_process_pid = node_process.pid
    print(f'Node.js server started with PID: {node_process_pid}')
else:
    print('Failed to start Node.js server')

# Handler for clean shutdown
def cleanup():
    print('Shutting down Node.js server')
    if node_process:
        node_process.terminate()

# Register cleanup handler
import atexit
atexit.register(cleanup)