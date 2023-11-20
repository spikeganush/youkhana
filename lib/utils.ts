export const validateString = (
  value: unknown,
  maxLength: number
): value is string => {
  if (!value || typeof value !== 'string' || value.length > maxLength) {
    return false;
  }

  return true;
};

export const getErrorMessage = (error: unknown): string => {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String(error.message);
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'Something went wrong';
  }

  return message;
};

export const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export async function fetchInstagramData() {
  try {
    const data = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,username,timestamp,permalink,thumbnail_url&access_token=${process.env.INSTAGRAM_TOKEN}`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );
    const json = await data.json();
    return json.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}
