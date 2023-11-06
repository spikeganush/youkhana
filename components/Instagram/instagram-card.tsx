'use client';

import { formateDate } from '@/lib/utils';
import Image from 'next/image';
import { useRef, useState } from 'react';

type InstagramCardProps = {
  id: string;
  caption: string;
  mediaType: 'VIDEO' | 'IMAGE';
  mediaUrl: string;
  userName: string;
  timestamp: string;
  permalink: string;
  thumbnail_url?: string;
};

export function InstagramCard({
  id,
  caption,
  mediaType,
  mediaUrl,
  userName,
  timestamp,
  permalink,
  thumbnail_url,
}: InstagramCardProps) {
  const formatedDate = formateDate(timestamp);
  const ref = useRef<HTMLVideoElement>(null);
  const [clickOnPlay, setClickOnPlay] = useState(false);
  const [clickOnPause, setClickOnPause] = useState(false);
  const [showVideoThumbnail, setShowVideoThumbnail] = useState(true);
  const [mute, setMute] = useState(true);

  return (
    <div className="bg-white border-gray-300 w-80 mx-auto md:w-96 border rounded-lg">
      <header className="grid grid-cols-6 items-center p-3 border-b border-b-gray-300">
        <div className="">
          <Image
            src="https://instagram.fsyd5-1.fna.fbcdn.net/v/t51.2885-19/315353411_209610284791397_7692960964948794448_n.jpg?stp=dst-jpg_s320x320&_nc_ht=instagram.fsyd5-1.fna.fbcdn.net&_nc_cat=105&_nc_ohc=ZVOOSCYcFeAAX_lLGvF&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfD5GlDt04cNYfkHzKCFbMTd3ee94mC8iUpuPhGmpM_F8Q&oe=654D8E9F&_nc_sid=8b3546"
            width={50}
            height={50}
            className="rounded-full w-10 h-10"
            alt="Youkhana Instagram Profile Picture"
            draggable={false}
          />
        </div>

        <div className="col-span-4 text-sm font-semibold">{userName}</div>

        <div className="">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        </div>
      </header>

      {mediaType === 'IMAGE' ? (
        <Image
          src={mediaUrl}
          alt={caption}
          width={640}
          height={640}
          className="object-contain w-full h-[382.4px]"
          draggable={false}
        />
      ) : (
        <div
          className="relative"
          onClick={(e) => {
            if (clickOnPlay && ref.current) {
              setClickOnPause(true);
              setClickOnPlay(false);
              ref.current.pause();
            }
          }}
        >
          {thumbnail_url && showVideoThumbnail ? (
            <Image
              src={thumbnail_url}
              alt={caption}
              width={640}
              height={640}
              className="absolute object-contain h-[382.4px] mx-auto"
              draggable={false}
            />
          ) : null}
          <video
            ref={ref}
            className="w-full h-[382.4px]"
            src={mediaUrl}
            draggable={false}
            muted={mute}
            onEnded={() => {
              if (ref.current) {
                setClickOnPlay(false);
                setClickOnPause(false);
                ref.current.currentTime = 0;
              }
            }}
          />
          <div className="absolute flex justify-center items-center inset-0">
            {!clickOnPlay ? (
              <div
                className="flex justify-center items-center w-10 h-10 bg-black/30 rounded-full hover:cursor-pointer"
                onClick={() => {
                  if (ref.current) {
                    if (!clickOnPlay) {
                      setShowVideoThumbnail(false);
                      setClickOnPlay(true);
                      setClickOnPause(false);
                      ref.current.play();
                    }

                    if (clickOnPause) {
                      setClickOnPlay(true);
                      setClickOnPause(false);
                      ref.current.play();
                    }
                  }
                }}
              >
                {!clickOnPause ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="white"
                    className="w-10 h-10"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
                    />
                  </svg>
                ) : null}
                {clickOnPause ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="white"
                    className="w-10 h-10"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : null}
              </div>
            ) : null}
            <div className="absolute flex justify-center items-center bottom-2 right-2 z-10">
              {clickOnPlay ? (
                <div
                  className="w-10 h-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (ref.current) {
                      if (mute) {
                        setMute(false);
                        ref.current.muted = false;
                      } else {
                        setMute(true);
                        ref.current.muted = true;
                      }
                    }
                  }}
                >
                  {mute ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z"
                      />
                    </svg>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <section className="flex flex-col p-4 gap-3">
        <div className="text-sm min-h-[60px]">
          {caption
            ? caption.length > 100
              ? caption.slice(0, 100) + '...'
              : caption
            : null}
        </div>

        <div className="flex justify-between">
          <div className="text-gray-400 text-xs">{formatedDate}</div>
          <div className="text-gray-400 text-xs">
            <a href={permalink} target="_blank" rel="noopener noreferrer">
              Link to the post
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
