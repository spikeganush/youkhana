import {
  PauseCircleIcon,
  PlayCircleIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect } from "react";
import { type VideoState } from "@/hooks/useVideoControls";

type InstagramVideoControlProps = {
  videoState: VideoState;
  toggleMute: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  togglePlay: () => void;
};

const InstagramVideoControl = ({
  videoState,
  toggleMute,
  togglePlay,
}: InstagramVideoControlProps) => {
  return (
    <>
      {videoState.isPlaying ? (
        <button
          aria-label={videoState.isMuted ? "Unmute" : "Mute"}
          className="flex justify-center items-center w-6 h-6 bg-black/60 rounded-full hover:cursor-pointer"
          onClick={(e) => {
            toggleMute(e);
          }}
        >
          {videoState.isMuted ? (
            <SpeakerXMarkIcon className="w-4 h-4 text-white" />
          ) : (
            <SpeakerWaveIcon className="w-4 h-4 text-white" />
          )}
        </button>
      ) : (
        <button
          aria-label={videoState.isPaused ? "Play" : "Pause"}
          className="flex justify-center items-center w-10 h-10 bg-black/30 rounded-full hover:cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        >
          {!videoState.isPaused && !videoState.isPlaying ? (
            <PlayCircleIcon className="w-10 h-10 text-white" />
          ) : (
            <PauseCircleIcon className="w-10 h-10 text-white" />
          )}
        </button>
      )}
    </>
  );
};

export default InstagramVideoControl;
