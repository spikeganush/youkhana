import Image from 'next/image';
import { shimmer } from '../ui/skeletons';
import { Dispatch, SetStateAction } from 'react';

type instagramMediaProps = {
  url: string;
  imageLoading: boolean;
  setImageLoading: Dispatch<SetStateAction<boolean>>;
  priority?: boolean;
};

export function InstagramImage({
  url: mediaUrl,
  imageLoading,
  setImageLoading,
  priority = false,
}: instagramMediaProps) {
  return (
    <>
      {mediaUrl && imageLoading ? (
        <div
          className={`${shimmer} absolute overflow-hidden flex justify-center w-full h-[382.4px] bg-gray-200`}
        />
      ) : null}
      <Image
        src={mediaUrl}
        alt={'Instagram media'}
        width={640}
        height={640}
        className="object-contain w-full h-[382.4px]"
        draggable={false}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setImageLoading(false)}
        unoptimized
      />
    </>
  );
}
