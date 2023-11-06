import { instagramMedia } from '@/types/general';
import { InstagramCarousel } from './instagram-carousel';

export async function Instagram() {
  const data = await fetch(
    'https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,username,timestamp,permalink,thumbnail_url&access_token=IGQWRNblh3T200TUtfeUFnWHpsYi1vejU2eGc4VU8yNDRhbFNJbDdqRUpFaElFTU9Qc3BMXzNFcW5RWHlTRlFWMG1FZAWRlSHBaazJ3Q0FqMkpES2c1THZAmRmVJV3ZAsNVlpYmlPTVlNM0Q1LXJOMkNzbXNWb2lnWVUZD'
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
