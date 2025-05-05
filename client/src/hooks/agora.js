import { useEffect, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";


const APP_ID = import.meta.env.VITE_APP_ID;
const TOKEN = import.meta.env.VITE_TOKEN;
const CHANNEL = import.meta.env.VITE_CHANNEL;

const client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});

export const useAgoraStream = () => {
  const [localTracks, setLocalTracks] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [localUid, setLocalUid] = useState(null);

  useEffect(() => {
    const handleUserPublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      setRemoteUsers((prev) => ({
        ...prev,
        [user.uid]: user,
      }));

      if (mediaType === "audio" && user.audioTrack) user.audioTrack.play();
      if (mediaType === "video" && user.videoTrack) {
        setTimeout(() => {
          const container = document.getElementById(`user-${user.uid}`);
          if (container) user.videoTrack.play(container);
        }, 200);
      }
    };

    const handleUserUnpublished = (user, mediaType) => {
      if (mediaType === "video" && user.videoTrack) user.videoTrack.stop();
      if (mediaType === "audio" && user.audioTrack) user.audioTrack.stop();
      setRemoteUsers((prev) => {
        const updated = { ...prev };
        delete updated[user.uid];
        return updated;
      });
    };

    const handleUserLeft = (user) => {
      setRemoteUsers((prev) => {
        const updated = { ...prev };
        delete updated[user.uid];
        return updated;
      });
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-left", handleUserLeft);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-left", handleUserLeft);
    };
  }, []);

  const joinStream = async () => {
    if (isJoined) return;

    try {
      const uid = await client.join(APP_ID, CHANNEL, TOKEN, null);
      const [microphoneTrack, cameraTrack] =
        await AgoraRTC.createMicrophoneAndCameraTracks();

      await client.publish([microphoneTrack, cameraTrack]);

      setLocalTracks([microphoneTrack, cameraTrack]);
      setIsMicMuted(false);
      setIsVideoMuted(false);
      setIsJoined(true);
      setLocalUid(uid);

      return uid;
    } catch (error) {
      console.error("Error joining stream:", error);
    }
  };

  const leaveStream = async () => {
    if (!isJoined) return;

    try {
      await client.unpublish(localTracks);

      localTracks.forEach((track) => {
        if (track) {
          track.stop();
          track.close();
        }
      });

      await client.leave();

      setLocalTracks([]);
      setRemoteUsers({});
      setIsJoined(false);
      setLocalUid(null);
    } catch (error) {
      console.error("Error leaving stream:", error);
    }
  };

  const toggleMic = async () => {
    if (localTracks[0]) {
      await localTracks[0].setMuted(!isMicMuted);
      setIsMicMuted((prev) => !prev);
    }
  };

  const toggleVideo = async () => {
    if (localTracks[1]) {
      await localTracks[1].setMuted(!isVideoMuted);
      setIsVideoMuted((prev) => !prev);
    }
  };

  return {
    client,
    localTracks,
    remoteUsers,
    isJoined,
    isMicMuted,
    isVideoMuted,
    localUid,
    joinStream,
    leaveStream,
    toggleMic,
    toggleVideo,
  };
};
