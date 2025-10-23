export type MediaType = "VIDEO" | "IMAGE" | "CAROUSEL_ALBUM";

export type InstagramMedia = {
  id: string;
  caption: string;
  media_type: MediaType;
  media_url: string;
  username: string;
  timestamp: string;
  permalink: string;
  thumbnail_url?: string;
};

export type InstagramMediaProps = {
  mediaType: MediaType;
  mediaUrl: string;
  thumbnail_url?: string;
  priority?: boolean;
};

export type InstagramImageProps = {
  url: string;
  imageLoading: boolean;
  setImageLoading: React.Dispatch<React.SetStateAction<boolean>>;
  priority?: boolean;
};

export type InstagramCardProps = {
  id: string;
  caption: string;
  mediaType: MediaType;
  mediaUrl: string;
  userName: string;
  timestamp: string;
  permalink: string;
  thumbnail_url?: string;
  priority?: boolean;
};

export type InstagramCarouselProps = {
  instagramPosts: InstagramMedia[];
};
