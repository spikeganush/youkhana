import { sendEmail } from '@/actions/sendEmail';

export const validateString = (
  value: unknown,
  maxLength: number
): value is string => {
  if (!value || typeof value !== 'string' || value?.length > maxLength) {
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
        cache: 'no-store',
      }
    );
    const json = await data.json();
    if (json.error) {
      throw new Error(json.error.message);
    }
    return json.data;
  } catch (error) {
    console.log(process.env.INSTAGRAM_TOKEN, error);
    return [];
  }
}

export function debounce<F extends (...args: any[]) => void>(
  func: F,
  waitFor: number
) {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>;
}

export default debounce;
