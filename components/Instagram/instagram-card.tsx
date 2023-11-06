'use client';

import { formatDate } from '@/lib/utils';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { InstagramMedia } from './instagram-media';

type InstagramCardProps = {
  id: string;
  caption: string;
  mediaType: 'VIDEO' | 'IMAGE' | 'CAROUSEL_ALBUM';
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
  const formatedDate = formatDate(timestamp);

  type ProfilePictureProps = {
    src: string;
    alt: string;
  };

  const ProfilePicture = ({ src, alt }: ProfilePictureProps) => (
    <Image
      src={src}
      width={50}
      height={50}
      className="rounded-full w-10 h-10"
      alt={alt}
      draggable={false}
    />
  );

  return (
    <div className="bg-white border-gray-300 w-80 mx-auto md:w-96 border rounded-lg">
      <header className="grid grid-cols-6 items-center p-3 border-b border-b-gray-300">
        <div>
          <ProfilePicture
            src="https://instagram.fsyd5-1.fna.fbcdn.net/v/t51.2885-19/315353411_209610284791397_7692960964948794448_n.jpg?stp=dst-jpg_s320x320&_nc_ht=instagram.fsyd5-1.fna.fbcdn.net&_nc_cat=105&_nc_ohc=ZVOOSCYcFeAAX_lLGvF&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfD5GlDt04cNYfkHzKCFbMTd3ee94mC8iUpuPhGmpM_F8Q&oe=654D8E9F&_nc_sid=8b3546"
            alt="Youkhana Instagram Profile Picture"
          />
        </div>

        <div className="col-span-4 text-sm font-semibold">{userName}</div>

        {/* <div className="">
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
        </div> */}
      </header>

      <InstagramMedia
        mediaType={mediaType}
        mediaUrl={mediaUrl}
        thumbnail_url={thumbnail_url}
      />

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