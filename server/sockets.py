import socketio
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Initialize the AsyncSocketIO server with explicit CORS settings
sio_server = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=['http://localhost:5173'],  # Explicitly allow your frontend origin
    logger=True,
    engineio_logger=True
)

# Create the ASGI application for Socket.IO
sio_app = socketio.ASGIApp(
    socketio_server=sio_server,
    socketio_path='socket.io',  # Use default Socket.IO path
)

# Event handlers for socket connections
@sio_server.event
async def connect(sid, environ):
    print(f'{sid}: connected')
    await sio_server.emit('join', {'sid': sid, 'message': f'User {sid} joined the chat'})

@sio_server.event
async def chat(sid, data):
    print(f"Received chat message from {sid}: {data}")
    # Handle both string messages and object messages
    if isinstance(data, dict) and 'message' in data:
        message = data['message']
    else:
        message = data
    
    # Broadcast the message to all clients
    await sio_server.emit('chat', {'sid': sid, 'message': message})

@sio_server.event
async def disconnect(sid):
    print(f'{sid}: disconnected')
    await sio_server.emit('leave', {'sid': sid, 'message': f'User {sid} left the chat'})