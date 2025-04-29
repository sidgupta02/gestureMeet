import asyncio
import socketio
import logging

# Setup logging
logging.basicConfig(level=logging.DEBUG)

# Initialize the AsyncClient for Socket.IO
sio_client = socketio.AsyncClient(logger=True, engineio_logger=True)

# Event when the client connects to the server
@sio_client.event
async def connect():
    print("🟢 Connected to server!")

# Event when the client disconnects from the server
@sio_client.event
async def disconnect():
    print("🔴 Disconnected from server!")

# Event to handle the 'chat' event from the server
@sio_client.event
async def chat(data):
    print(f"📩 Received chat message: {data}")

# Event to handle the 'join' event from the server
@sio_client.event
async def join(data):
    print(f"👋 Join event: {data}")

# Event to handle connection error
@sio_client.event
async def connect_error(data):
    print(f"⚠️ Connection error: {data}")

async def main():
    try:
        # Install required packages if needed
        try:
            import aiohttp
        except ImportError:
            print("⚠️ aiohttp not installed. Installing now...")
            import subprocess
            import sys
            subprocess.check_call([sys.executable, "-m", "pip", "install", "aiohttp"])
            print("✅ aiohttp installed successfully!")
            import aiohttp
        
        # Connect to the backend (FastAPI) running on port 8000
        print("🔄 Connecting to server...")
        await sio_client.connect(
            'http://localhost:8000',
            socketio_path='socket.io',
            transports=['websocket', 'polling'],
            wait_timeout=10
        )
        
        if sio_client.connected:
            # Send a test message
            print("✉️ Sending test message...")
            await sio_client.emit('chat', 'Hello from the Python client!')
            
            # Wait for server responses
            print("⏳ Waiting for responses...")
            await asyncio.sleep(10)  # Wait longer to see responses
        else:
            print("❌ Failed to connect to server")
            
    except Exception as e:
        print(f"❌ Error occurred: {e}")
    finally:
        # Disconnect if connected
        if sio_client.connected:
            print("👋 Disconnecting...")
            await sio_client.disconnect()

# Run the client in an async loop
if __name__ == "__main__":
    asyncio.run(main())