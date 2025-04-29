import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Hand, Mic, MicOff, Video, VideoOff, Phone, MessageSquare } from "lucide-react";
import { useAgoraStream } from "../hooks/agora";
import ChatBox from './ChatBox';

function MeetingRoom() {
  const navigate = useNavigate();
  const {
    isJoined,
    isMicMuted,
    isVideoMuted,
    localTracks,
    remoteUsers,
    localUid,
    joinStream,
    leaveStream,
    toggleMic,
    toggleVideo,
  } = useAgoraStream();

  const [isGestureOpen, setIsGestureOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const localVideoRef = useRef(null);
  const [clientId] = useState(`user-${Math.random().toString(36).substr(2, 9)}`);

  const getGridLayout = useCallback((count) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-3";
    if (count === 4) return "grid-cols-2 grid-rows-2";
    if (count <= 6) return "grid-cols-3 grid-rows-2";
    if (count <= 9) return "grid-cols-3 grid-rows-3";
    return "grid-cols-4 grid-rows-3";
  }, []);

  const totalParticipants = 1 + Object.keys(remoteUsers).length;
  const gridLayout = getGridLayout(totalParticipants);

  useEffect(() => {
    (async () => {
      await joinStream();
    })();
    return () => {
      leaveStream();
    };
  }, []);

  useEffect(() => {
    if (isJoined && localTracks.length > 1 && localTracks[1] && localVideoRef.current) {
      localTracks[1].play(localVideoRef.current);
    }
  }, [isJoined, localTracks]);

  const handleLeave = async () => {
    await leaveStream();
    navigate("/");
  };

  const toggleGesture = () => setIsGestureOpen(!isGestureOpen);
  const toggleChat = () => setIsChatOpen(!isChatOpen);

  return (
    <div className="h-screen w-full bg-gray-900 flex flex-col overflow-hidden">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Streams */}
        <div className={`flex-1 transition-all duration-300 ${isChatOpen ? 'w-3/4' : 'w-full'} p-2`}>
          <div className={`grid ${gridLayout} gap-2 h-full`} id="video-streams">
            {isJoined && localUid && (
              <div className="video-container bg-gray-800 rounded-lg overflow-hidden relative">
                {/* ref is pin localVideoRef variable here till the component unmounts */}
                <div ref={localVideoRef} className="video-player"></div>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
                  You
                </div>
              </div>
            )}

            
            {Object.entries(remoteUsers).map(([uid, user]) => (
              <div key={uid} className="video-container bg-gray-800 rounded-lg overflow-hidden relative">
                <div id={`user-${uid}`} className="video-player"></div>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
                  Remote
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ChatBox */}
        <ChatBox clientId={clientId} isChatOpen={isChatOpen} />
      </div>

      {/* Control Buttons */}
      <div className="p-3 bg-gray-800 flex justify-center space-x-4" id="stream-controls">
        <button onClick={toggleMic} className={`p-3 rounded-full ${isMicMuted ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
          {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <button onClick={toggleVideo} className={`p-3 rounded-full ${isVideoMuted ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
          {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
        </button>
        <button onClick={toggleGesture} className="p-3 rounded-full bg-blue-500 text-white">
          <Hand size={20} />
        </button>
        <button onClick={toggleChat} className="p-3 rounded-full bg-blue-500 text-white">
          <MessageSquare size={20} />
        </button>
        <button onClick={handleLeave} className="p-3 rounded-full bg-red-500 text-white">
          <Phone size={20} />
        </button>
      </div>
    </div>
  );
}

export default MeetingRoom;
