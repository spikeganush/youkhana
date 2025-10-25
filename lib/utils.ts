import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const validateString = (
  value: unknown,
  maxLength: number
): value is string => {
  if (!value || typeof value !== "string" || value?.length > maxLength) {
    return false;
  }

  return true;
};

export const getErrorMessage = (error: unknown): string => {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    message = String(error.message);
  } else if (typeof error === "string") {
    message = error;
  } else {
    message = "Something went wrong";
  }

  return message;
};

export const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export async function fetchInstagramData() {
  try {
    // Import redis only in server-side function
    const { redis } = await import("./redist");
    const getToken = await redis.get("instagram_token");

    if (!getToken) {
      throw new Error("No Instagram token found");
    }

    const token = getToken || process.env.INSTAGRAM_TOKEN;
    const data = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,username,timestamp,permalink,thumbnail_url&access_token=${token}`,
      {
        cache: "no-store",
      }
    );
    const json = await data.json();
    if (json.error) {
      throw new Error(json.error.message);
    }
    return json.data;
  } catch (error) {
    console.error("Error fetching Instagram data:", error);
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

// app/utils/cleanHtml.ts
export function cleanHtml(html: string) {
  if (!html) return "";

  return (
    html
      // Remove space after paragraph opening tag
      .replace(/<p>\s+/g, "<p>")
      // Remove space after span opening tag
      .replace(/<span>\s+/g, "<span>")
      // Remove space between p and span tags
      .replace(/<p([^>]*)>\s+<span/g, "<p$1><span")
      // Clean multiple spaces between words (optional)
      .replace(/\s{2,}/g, " ")
      // Remove trailing spaces before closing tags (optional)
      .replace(/\s+<\/span>/g, "</span>")
      .replace(/\s+<\/p>/g, "</p>")
  );
}
