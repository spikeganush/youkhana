'use client';

import dynamic from 'next/dynamic';
import { InstagramCard } from './instagram-card';
import { Suspense } from 'react';
import { InstagramCardSkeleton } from '../ui/skeletons';
import { InstagramCarouselProps } from '@/types/instagram';
import 'react-multi-carousel/lib/styles.css';

// Dynamically import carousel to reduce initial bundle size
const Carousel = dynamic(() => import('react-multi-carousel'), {
  loading: () => <InstagramCardSkeleton />,
  ssr: false,
});

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1300 },
    items: 3,
    slidesToSlide: 3,
  },
  tablet: {
    breakpoint: { max: 1300, min: 464 },
    items: 2,
    slidesToSlide: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1,
  },
};

export function InstagramCarousel({ instagramPosts }: InstagramCarouselProps) {
  return (
    <div className='px-6 lg:px-8'>
      {instagramPosts?.length > 0 && (
        <Carousel
          showDots={false}
          responsive={responsive}
          infinite
          keyBoardControl
          transitionDuration={500}
          containerClass='container mx-auto'
          removeArrowOnDeviceType={['tablet', 'mobile']}
        >
          {instagramPosts &&
            instagramPosts.map((post: any, index) => (
              <Suspense fallback={<InstagramCardSkeleton />} key={post.id}>
                <InstagramCard
                  key={post.id}
                  id={post.id}
                  caption={post.caption}
                  mediaType={post.media_type}
                  mediaUrl={post.media_url}
                  userName={post.username}
                  timestamp={post.timestamp}
                  thumbnail_url={post.thumbnail_url}
                  permalink={post.permalink}
                  priority={index < 3} // Prioritize first 3 images
                />
              </Suspense>
            ))}
        </Carousel>
      )}
    </div>
  );
}
