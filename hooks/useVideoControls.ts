import { useCallback, useRef, useState } from "react";

export type VideoState = {
  isPlaying: boolean;
  isMuted: boolean;
  isPaused: boolean;
  showThumbnail: boolean;
};

export default function useVideoControls() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoState, setVideoState] = useState<VideoState>({
    isPlaying: false,
    isMuted: true,
    isPaused: false,
    showThumbnail: true,
  });

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setVideoState((prev) => ({
          ...prev,
          isPlaying: true,
          isPaused: false,
          showThumbnail: false,
        }));
      } else {
        videoRef.current.pause();
        setVideoState((prev) => ({
          ...prev,
          isPlaying: false,
          isPaused: true,
        }));
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setVideoState((prev) => ({
        ...prev,
        isMuted: !prev.isMuted,
      }));
    }
  }, []);

  const togglePauseEndVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setVideoState((prev) => ({
        ...prev,
        isPlaying: false,
        isPaused: true,
      }));
    }
  }, []);

  const divPauseVideo = useCallback((e: React.MouseEvent) => {
    // Prevent if clicking on play button or mute button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }

    if (videoRef.current) {
      if (!videoRef.current.paused) {
        videoRef.current.pause();
        setVideoState((prev) => ({
          ...prev,
          isPlaying: false,
          isPaused: true,
        }));
      } else {
        videoRef.current.play();
        setVideoState((prev) => ({
          ...prev,
          isPlaying: true,
          isPaused: false,
          showThumbnail: false,
        }));
      }
    }
  }, []);

  return {
    videoRef,
    videoState,
    togglePlay,
    toggleMute,
    togglePauseEndVideo,
    divPauseVideo,
  };
}
