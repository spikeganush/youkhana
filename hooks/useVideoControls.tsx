import { useState, useRef } from 'react';

function useVideoControls() {
  const [videoState, setVideoState] = useState({
    playing: false,
    paused: false,
    muted: true,
    showThumbnail: true,
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current && (!videoState.playing || videoState.paused)) {
      setVideoState({
        ...videoState,
        playing: true,
        paused: false,
        showThumbnail: false,
      });
      videoRef.current.play();
    }
  };

  const toggleMute = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoState.muted) {
        setVideoState({
          ...videoState,
          muted: false,
        });
        videoRef.current.muted = false;
      } else {
        setVideoState({
          ...videoState,
          muted: true,
        });
        videoRef.current.muted = true;
      }
    }
  };

  const togglePauseEndVideo = () => {
    if (videoRef.current) {
      setVideoState({
        ...videoState,
        playing: false,
        paused: false,
      });
      videoRef.current.currentTime = 0;
    }
  };

  const divPauseVideo = () => {
    if (videoState.playing && videoRef.current) {
      setVideoState({
        ...videoState,
        playing: false,
        paused: true,
      });
      videoRef.current.pause();
    }
  };

  return {
    videoRef,
    videoState,
    toggleMute,
    togglePlay,
    togglePauseEndVideo,
    divPauseVideo,
  };
}

export default useVideoControls;
