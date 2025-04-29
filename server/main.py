import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Import the ASGI app from sockets.py
from sockets import sio_app

app = FastAPI()

# Add CORS middleware with explicit origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Explicitly allow only your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# A simple route to test if the server is running
@app.get('/')
async def home():
    return {'message': 'Hello👋 Developers💻'}

# Mount the SocketIO ASGI app at the root path
app.mount("/", sio_app)

if __name__ == '__main__':
    uvicorn.run('main:app', host="0.0.0.0", port=8000, reload=True, log_level="debug")