import { useState, useRef, useCallback } from 'react';

function useVideoControls() {
  const [videoState, setVideoState] = useState({
    playing: false,
    paused: false,
    muted: true,
    showThumbnail: true,
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = useCallback(() => {
    if (videoRef.current && (!videoState.playing || videoState.paused)) {
      setVideoState({
        ...videoState,
        playing: true,
        paused: false,
        showThumbnail: false,
      });
      videoRef.current.play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoState.playing]);

  const toggleMute = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [videoState.muted]
  );

  const togglePauseEndVideo = useCallback(() => {
    if (videoRef.current) {
      setVideoState({
        ...videoState,
        playing: false,
        paused: false,
      });
      videoRef.current.currentTime = 0;
    }
  }, [videoState]);

  const divPauseVideo = useCallback(() => {
    if (videoState.playing && videoRef.current) {
      setVideoState({
        ...videoState,
        playing: false,
        paused: true,
      });
      videoRef.current.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoState.playing]);

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
