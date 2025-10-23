"use client";

import { useState } from "react";
import { InstagramImage } from "./instagram-image";
import useVideoControls from "@/hooks/useVideoControls";
import { InstagramMediaProps } from "@/types/instagram";
import { cn } from "@/lib/utils";
import InstagramVideoControl from "./instagam-video_control";

export function InstagramMedia({
  mediaType,
  mediaUrl,
  thumbnail_url,
  priority = false,
}: InstagramMediaProps) {
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
      {mediaType === "IMAGE" || mediaType === "CAROUSEL_ALBUM" ? (
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
            muted={videoState.isMuted}
            playsInline
            preload="metadata"
            onEnded={togglePauseEndVideo}
          />
          <div
            className={cn("absolute flex justify-center items-center ", {
              "z-10 bottom-2 right-2": videoState.isPlaying,
              "inset-0": !videoState.isPlaying,
            })}
          >
            <InstagramVideoControl
              videoState={videoState}
              toggleMute={toggleMute}
              togglePlay={togglePlay}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default InstagramMedia;
