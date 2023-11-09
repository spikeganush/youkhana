'use client';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { InstagramCard } from './instagram-card';
import { InstagramMedia } from '@/types/general';
import { Suspense } from 'react';
import { InstagramCardSkeleton } from '../ui/skeletons';

type InstagramCarouselProps = {
  instagramPosts: InstagramMedia[];
};

export function InstagramCarousel({ instagramPosts }: InstagramCarouselProps) {
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 3, // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 2, // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
  };

  return (
    <div className="px-6 lg:px-8">
      <Carousel
        showDots={false}
        responsive={responsive}
        infinite
        keyBoardControl
        transitionDuration={500}
        containerClass="container"
        removeArrowOnDeviceType={['tablet', 'mobile']}
      >
        {instagramPosts.map((post: any) => (
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
            />
          </Suspense>
        ))}
      </Carousel>
    </div>
  );
}
