import { instagramMedia } from '@/types/general';
import { InstagramCarousel } from './instagram-carousel';

export async function Instagram() {
  const data = await fetch(
    `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,username,timestamp,permalink,thumbnail_url&access_token=${process.env.INSTAGRAM_TOKEN}`
  );
  const json = await data.json();
  const instagramPosts: instagramMedia[] = json.data;

  return (
    <>
      <h1 className="text-center text-gray-700 text-3xl font-medium mb-8">
        Instagram
      </h1>
      <InstagramCarousel instagramPosts={instagramPosts} />
    </>
  );
}
