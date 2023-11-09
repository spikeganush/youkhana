import {
  PauseCircleIcon,
  PlayCircleIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useRef, useState } from 'react';

type instagramMediaProps = {
  mediaType: 'VIDEO' | 'IMAGE' | 'CAROUSEL_ALBUM';
  mediaUrl: string;
  thumbnail_url?: string;
};
export function InstagramMedia({
  mediaType,
  mediaUrl,
  thumbnail_url,
}: instagramMediaProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [videoControls, setVideoControls] = useState({
    playing: false,
    paused: false,
    muted: true,
    showThumbnail: true,
  });

  const togglePlay = () => {
    console.log(mediaUrl);
    if (ref.current) {
      if (!videoControls.playing) {
        setVideoControls({
          ...videoControls,
          playing: true,
          paused: false,
          showThumbnail: false,
        });
        ref.current.play();
      }

      if (videoControls.paused) {
        setVideoControls({
          ...videoControls,
          playing: true,
          paused: false,
          showThumbnail: false,
        });
        ref.current.play();
      }
    }
  };

  const toggleMute = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (ref.current) {
      if (videoControls.muted) {
        setVideoControls({
          ...videoControls,
          muted: false,
        });
        ref.current.muted = false;
      } else {
        setVideoControls({
          ...videoControls,
          muted: true,
        });
        ref.current.muted = true;
      }
    }
  };

  const togglePauseEndVideo = () => {
    if (ref.current) {
      setVideoControls({
        ...videoControls,
        playing: false,
        paused: false,
      });
      ref.current.currentTime = 0;
    }
  };

  const divPauseVideo = () => {
    if (videoControls.playing && ref.current) {
      setVideoControls({
        ...videoControls,
        playing: false,
        paused: true,
      });
      ref.current.pause();
    }
  };

  return (
    <>
      {mediaType === 'IMAGE' || mediaType === 'CAROUSEL_ALBUM' ? (
        <Image
          src={mediaUrl}
          alt={'Instagram media'}
          width={640}
          height={640}
          className="object-contain w-full h-[382.4px]"
          draggable={false}
        />
      ) : (
        <div className="relative" onClick={divPauseVideo}>
          {thumbnail_url && videoControls.showThumbnail ? (
            <div className="absolute flex justify-center w-full h-[382.4px] bg-white">
              <Image
                src={thumbnail_url}
                alt={'Instagram media'}
                width={640}
                height={640}
                className="absolute object-contain h-[382.4px] mx-auto"
                draggable={false}
              />
            </div>
          ) : null}
          <video
            ref={ref}
            className="w-full h-[382.4px]"
            src={mediaUrl}
            draggable={false}
            muted={videoControls.muted}
            onEnded={togglePauseEndVideo}
          />
          <div className="absolute flex justify-center items-center inset-0">
            {!videoControls.playing ? (
              <div
                className="flex justify-center items-center w-10 h-10 bg-black/30 rounded-full hover:cursor-pointer"
                onClick={togglePlay}
              >
                {!videoControls.paused ? (
                  <PlayCircleIcon className="w-10 h-10 text-white" />
                ) : null}
                {videoControls.paused ? (
                  <PauseCircleIcon className="w-10 h-10 text-white" />
                ) : null}
              </div>
            ) : null}
            <div className="absolute flex justify-center items-center bottom-2 right-2 z-10">
              {videoControls.playing ? (
                <div
                  className="flex justify-center items-center w-6 h-6 bg-black/60 rounded-full hover:cursor-pointer"
                  onClick={toggleMute}
                >
                  {videoControls.muted ? (
                    <SpeakerXMarkIcon className="w-4 h-4 text-white" />
                  ) : (
                    <SpeakerWaveIcon className="w-4 h-4 text-white" />
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
