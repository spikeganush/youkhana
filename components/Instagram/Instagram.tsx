import { instagramMedia } from '@/types/general';
import { Suspense } from 'react';
import { InstagramCardsSkeleton } from '../ui/skeletons';
import { InstagramCarousel } from './instagram-carousel';
import { fetchInstagramData } from '@/lib/utils';

export async function Instagram() {
  const instagramPosts: instagramMedia[] = await fetchInstagramData();

  return (
    <>
      <h1 className="text-center text-gray-700 text-3xl font-medium mb-8">
        Instagram
      </h1>
      <Suspense fallback={<InstagramCardsSkeleton />}>
        <InstagramCarousel instagramPosts={instagramPosts} />
      </Suspense>
    </>
  );
}
