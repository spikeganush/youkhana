import Image from 'next/image';
import { shimmer } from '../ui/skeletons';
import { InstagramImageProps } from '@/types/instagram';

export function InstagramImage({
  url,
  imageLoading,
  setImageLoading,
  priority = false,
}: InstagramImageProps) {
  return (
    <>
      {url && imageLoading ? (
        <div
          className={`${shimmer} absolute overflow-hidden flex justify-center w-full h-[382.4px] bg-gray-200`}
        />
      ) : null}
      <Image
        src={url}
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
