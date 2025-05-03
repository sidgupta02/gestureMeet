import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Create socket instance with correct path (very important!)
const socket = io("http://localhost:8000/", {
  transports: ["websocket", "polling"],
  reconnectionDelayMax: 10000,
  reconnectionAttempts: 10,
});

// For debugging
console.log("Socket.IO initialization with path:", "/socket.io");

const ChatBox = ({ clientId, isChatOpen }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false); // Start as not connected
  const messagesEndRef = useRef(null);
  
  // Generate a unique user ID if not provided
  const userId = useRef(clientId || `user_${Math.random().toString(36).substr(2, 9)}`);

  // Scroll to bottom when new message comes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Connection events
    const onConnect = () => {
      console.log("Connected to socket server with ID:", socket.id);
      setIsConnected(true);
    };
    
    const onDisconnect = (reason) => {
      console.log("Disconnected from socket server. Reason:", reason);
      setIsConnected(false);
    };
    
    const onConnectError = (error) => {
      console.error("Connection error:", error);
      setIsConnected(false);
    };

    // Chat events
    const onJoin = (data) => {
      console.log("Join event received:", data);
      setMessages((prev) => [...prev, { ...data, type: "join" }]);
    };

    const onLeave = (data) => {
      console.log("Leave event received:", data);
      setMessages((prev) => [...prev, { ...data, type: "leave" }]);
    };

    const onChat = (data) => {
      console.log("Chat event received:", data);
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          isMe: data.sid === socket.id,
        },
      ]);
    };

    // Set up event listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("join", onJoin);
    socket.on("leave", onLeave);
    socket.on("chat", onChat);

    // Make sure we're connected
    if (!socket.connected) {
      console.log("Socket not connected, connecting...");
      socket.connect();
    } else {
      console.log("Socket already connected with ID:", socket.id);
      setIsConnected(true);
    }

    // Cleanup function
    return () => {
      console.log("Removing socket event listeners");
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("join", onJoin);
      socket.off("leave", onLeave);
      socket.off("chat", onChat);
    };
  }, []);

  const sendMessage = () => {
    if (newMessage.trim() && isConnected) {
      console.log("Sending message:", newMessage);
      socket.emit("chat", newMessage);
      setNewMessage("");
    } else if (!isConnected) {
      console.warn("Cannot send message: not connected to server");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div
      className={`bg-gray-800 text-white transition-all duration-300 ${
        isChatOpen ? "w-1/4" : "w-0"
      } overflow-hidden`}
    >
      {isChatOpen && (
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-700 font-semibold text-lg">
            Chat ({isConnected ? "Online" : "Offline"})
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2" id="chat-messages">
            {messages.length === 0 ? (
              <div className="text-gray-500 text-center italic">No messages yet</div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg mb-2 ${
                    msg.isMe || msg.sid === socket.id
                      ? "bg-blue-600 ml-auto text-right"
                      : msg.type === "join" || msg.type === "leave"
                      ? "bg-gray-600 mx-auto text-center italic text-sm"
                      : "bg-gray-700"
                  } max-w-[80%] break-words`}
                >
                  {msg.message}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-gray-700">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
              autoComplete="off"
              disabled={!isConnected}
            />
            <button
              onClick={sendMessage}
              className={`w-full p-2 rounded mt-2 text-white transition-colors ${
                isConnected ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-500 cursor-not-allowed"
              }`}
              disabled={!isConnected}
            >
              {isConnected ? "Send" : "Connecting..."}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;