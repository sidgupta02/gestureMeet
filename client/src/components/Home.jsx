import React from "react";
import { useNavigate } from "react-router-dom";
import { Hand } from "lucide-react";
// import { useAgoraStream } from "../hooks/agora";

function Home() {
  const navigate = useNavigate();
  // const { joinStream } = useAgoraStream(); // custom hook

  const createMeeting = async () => {
    try {
      navigate("/meeting");
    } catch (err) {
      console.error("Navigation failed", err);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-900 flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(to right, #2C5364, #203A43, #0F2027)",
      }}
    >
      <div className="flex flex-col items-center space-y-6 w-full max-w-md">
        <div className="flex items-center space-x-2 text-white">
          <Hand className="text-blue-400" size={32} />
          <h1 className="text-3xl font-bold">Gesture Meet</h1>
        </div>
        <button
          onClick={createMeeting}
          className="w-3/4 bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors mb-4"
          style={{ backgroundColor: "cadetblue" }}
        >
          Join Stream
        </button>
      </div>
    </div>
  );
}

export default Home;