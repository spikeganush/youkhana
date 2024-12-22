'use client';

import {
  PauseCircleIcon,
  PlayCircleIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/outline';
import { useState, memo } from 'react';
import { InstagramImage } from './instagram-image';
import useVideoControls from '@/hooks/useVideoControls';

type instagramMediaProps = {
  mediaType: 'VIDEO' | 'IMAGE' | 'CAROUSEL_ALBUM';
  mediaUrl: string;
  thumbnail_url?: string;
  priority?: boolean;
};

const InstagramMedia = ({
  mediaType,
  mediaUrl,
  thumbnail_url,
  priority = false,
}: instagramMediaProps) => {
  const {
    videoRef,
    videoState,
    divPauseVideo,
    toggleMute,
    togglePauseEndVideo,
    togglePlay,
  } = useVideoControls();
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <>
      {mediaType === 'IMAGE' || mediaType === 'CAROUSEL_ALBUM' ? (
        <InstagramImage
          url={mediaUrl}
          imageLoading={imageLoading}
          setImageLoading={setImageLoading}
        />
      ) : (
        <div className="relative" onClick={divPauseVideo}>
          {thumbnail_url && videoState.showThumbnail ? (
            <div className="absolute flex justify-center w-full h-[382.4px] bg-white">
              <InstagramImage
                url={thumbnail_url}
                imageLoading={imageLoading}
                setImageLoading={setImageLoading}
                priority
              />
            </div>
          ) : null}
          <video
            ref={videoRef}
            className="w-full h-[382.4px]"
            src={mediaUrl}
            draggable={false}
            muted={videoState.muted}
            onEnded={togglePauseEndVideo}
          />
          <div className="absolute flex justify-center items-center inset-0">
            {!videoState.playing ? (
              <button
                aria-label={videoState.paused ? 'Play' : 'Pause'}
                className="flex justify-center items-center w-10 h-10 bg-black/30 rounded-full hover:cursor-pointer"
                onClick={togglePlay}
              >
                {!videoState.paused ? (
                  <PlayCircleIcon className="w-10 h-10 text-white" />
                ) : null}
                {videoState.paused ? (
                  <PauseCircleIcon className="w-10 h-10 text-white" />
                ) : null}
              </button>
            ) : null}
            <div className="absolute flex justify-center items-center bottom-2 right-2 z-10">
              {videoState.playing ? (
                <button
                  aria-label={videoState.muted ? 'Unmute' : 'Mute'}
                  className="flex justify-center items-center w-6 h-6 bg-black/60 rounded-full hover:cursor-pointer"
                  onClick={toggleMute}
                >
                  {videoState.muted ? (
                    <SpeakerXMarkIcon className="w-4 h-4 text-white" />
                  ) : (
                    <SpeakerWaveIcon className="w-4 h-4 text-white" />
                  )}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(InstagramMedia);
