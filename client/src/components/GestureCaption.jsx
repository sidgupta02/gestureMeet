import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

// Create socket instance outside component to avoid reconnections
const socket = io("http://localhost:8000/", {
  path: "/socket.io/",
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000
});

const GestureCaption = ({ videoRef }) => {
  const [gesture, setGesture] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [socketStatus, setSocketStatus] = useState("connecting");
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));

  // Listen for gesture detection results
  useEffect(() => {
    console.log("Setting up gesture_result listener");
    
    socket.on("gesture_result", (data) => {
      console.log("Received gesture result:", data);
      setGesture(data.gesture);
      
      if (data.confidence) {
        setConfidence(data.confidence);
      }
      
      if (data.error) {
        setError(data.gesture);
      } else {
        setError(null);
      }
    });

    // Connection status logging
    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket.id);
      setSocketStatus("connected");
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setSocketStatus("error");
      setError("Connection failed");
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketStatus("disconnected");
    });

    return () => {
      console.log("Cleaning up gesture_result listener");
      socket.off("gesture_result");
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
    };
  }, []);

  // Set up frame capture from video element
  useEffect(() => {
    if (!videoRef || !videoRef.current) {
      console.log("Video reference is not available");
      return;
    }
    
    // Access the video element in the DOM
    const findVideoElement = () => {
      const container = videoRef.current;
      
      // First try to find an actual video element inside the container
      let videoElement = container.querySelector('video');
      
      if (videoElement) {
        console.log("Found video element inside container");
        setupCapture(videoElement);
      } else {
        console.log("No video element found in container, trying again in 1 second");
        // If no video element exists yet, try again in a second
        setTimeout(findVideoElement, 1000);
      }
    };

    const setupCapture = (videoElement) => {
      console.log("Setting up video capture", 
        "Ready state:", videoElement.readyState,
        "Dimensions:", videoElement.videoWidth, "x", videoElement.videoHeight);
      
      setIsCapturing(true);
      
      // Prepare canvas for frame capture
      const canvas = canvasRef.current;
      
      const sendFrame = () => {
        try {
          // Update canvas dimensions if video size has changed
          if (canvas.width !== videoElement.videoWidth || 
              canvas.height !== videoElement.videoHeight) {
            canvas.width = videoElement.videoWidth || 640;
            canvas.height = videoElement.videoHeight || 480;
          }
          
          // Check if video is actually playing and has content
          if (videoElement.readyState >= 2 && 
              videoElement.videoWidth > 0 && 
              videoElement.videoHeight > 0) {
            
            const ctx = canvas.getContext("2d");
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            
            const base64Image = canvas.toDataURL("image/jpeg", 0.7); // Use 70% quality to reduce size
            console.log("Sending frame to server, length:", base64Image.length);
            socket.emit("frame", { image: base64Image });
          } else {
            console.log("Video not ready for capture, state:", videoElement.readyState);
          }
        } catch (err) {
          console.error("Frame capture error:", err);
          setError(`Capture error: ${err.message}`);
        }
      };
      
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Start sending frames every 2 seconds
      console.log("Starting frame capture interval");
      intervalRef.current = setInterval(sendFrame, 2000);
      
      // Send first frame immediately
      sendFrame();
    };

    // Start the process
    findVideoElement();
    
    return () => {
      console.log("Cleaning up video capture");
      setIsCapturing(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [videoRef]);
  
  // Determine status color based on different states
  const getStatusColor = () => {
    if (error) return "bg-red-500";
    if (gesture && gesture !== "No gesture detected") return "bg-green-500";
    if (isCapturing) return "bg-blue-500";
    return "bg-gray-500";
  };

  return (
    <div className="absolute top-0 left-0 w-full">
      {/* Status indicators */}
      <div className="flex justify-between p-2">
        <div className={`${getStatusColor()} text-white text-xs px-2 py-1 rounded-full flex items-center`}>
          <div className="h-2 w-2 bg-white rounded-full mr-1"></div>
          {error ? "Error" : (isCapturing ? "Capturing" : "Not capturing")}
        </div>
        
        {/* Gesture result display */}
        {gesture && gesture !== "No gesture detected" && (
          <div className="bg-blue-600 text-white text-sm px-3 py-1 rounded shadow-lg">
            Gesture: {gesture} {confidence && `(${confidence})`}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="absolute top-10 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default GestureCaption;