# 🤟 Gesture Meet — Real-time Gesture Detection in Video Calls

Gesture Meet is a full-stack video calling web application powered by **React**, **FastAPI**, and **Agora SDK**, integrated with **real-time gesture recognition** using **YOLOv8**. Users can join video calls and automatically detect hand gestures like _OK_, _Thanks_, _Sorry_, etc., with meanings displayed live during the call.

---

## 🚀 Features

- 🧠 Real-time hand gesture recognition (YOLOv8)
- 🎥 Video calling using Agora SDK
- 💬 Live chat using Socket.IO
- 🧩 Full-stack architecture: React frontend + FastAPI backend
- ⚡ Frame capture every second from video stream
- 🔌 Fast WebSocket-based communication between frontend and backend
- 🌐 Access from mobile and desktop on same Wi-Fi

---

## 🛠️ Tech Stack

### Frontend:
- React + Vite
- Tailwind CSS
- Agora Web SDK
- Socket.IO (for chat and gesture results)

### Backend:
- FastAPI
- Python-SocketIO (async)
- YOLOv8 (via Ultralytics)
- OpenCV, NumPy, Pillow
- FastAPI-CORS, Uvicorn
- WebSockets for real-time gesture streaming

---

## 📦 Installation Guide

### 🔧 Prerequisites:
- Node.js (v16+)
- Python (3.9+ recommended)
- Pipenv (`pip install pipenv`)
- Agora App ID (for video calls)
- Git

---

### ✅ Clone the Repository

```bash
git clone https://github.com/sidgupta02/gestrueMeet
cd gestureMeet
```

---

### 🖥️ CLIENT SETUP (React + Vite)

```bash
cd client
npm install
npm run dev
```

> This will start the frontend at `http://localhost:5173`

---

### 🧠 SERVER SETUP (FastAPI + YOLOv8)

```bash
cd server
pip install pipenv
pipenv install
pipenv install fastapi uvicorn "python-socketio[asyncio]" aiofiles ultralytics opencv-python numpy pillow python-multipart fastapi-cors websockets
pipenv shell
uvicorn main:app --reload
```

> This starts the backend server on `http://localhost:8000`

---

## 📱 Accessing on Mobile

- Make sure your **PC and phone are on the same Wi-Fi network**.
- Open the app in your phone’s browser using your PC’s local IP address:
  
  ```
  http://<your-ip>:5173
  ```

  Example:
  ```
  http://192.168.1.7:5173
  ```

- Your firewall should allow inbound connections on port 5173 (for React) and 8000 (for FastAPI).

---

## 🧩 Workflow Summary

1. **User joins the video call** using Agora.
2. Agora stream is rendered in browser — frontend captures 1 frame every second.
3. Frame is sent to FastAPI backend via **Socket.IO**.
4. YOLOv8 model processes the image, detects gestures.
5. Detected gesture is sent back and displayed in the frontend live.

---

## 📚 Why This Stack?

- **React + Vite**: Lightning-fast frontend dev experience.
- **Tailwind CSS**: Utility-first styling with responsive design.
- **Agora SDK**: Reliable and scalable video calling infrastructure.
- **FastAPI**: High-performance Python API for real-time ML tasks.
- **YOLOv8**: State-of-the-art object detection.
- **Socket.IO**: Bi-directional real-time communication.

---

## 👨‍💻 Author

Made by [Siddhant Kumar Gupta]([https://github.com/sidgupta02])

---
