'use server';

export async function fetchInstagramData() {
  try {
    const data = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,username,timestamp,permalink,thumbnail_url&access_token=${process.env.INSTAGRAM_TOKEN}`,
      {
        cache: 'no-store',
      }
    );
    const json = await data.json();
    if (json.error) {
      throw new Error(json.error.message);
    }
    return json.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}
