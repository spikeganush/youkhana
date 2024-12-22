export type MediaType = 'VIDEO' | 'IMAGE' | 'CAROUSEL_ALBUM';

export interface InstagramMedia {
  id: string;
  caption: string;
  media_type: MediaType;
  media_url: string;
  username: string;
  timestamp: string;
  permalink: string;
  thumbnail_url?: string;
}

export interface InstagramMediaProps {
  mediaType: MediaType;
  mediaUrl: string;
  thumbnail_url?: string;
  priority?: boolean;
}

export interface InstagramImageProps {
  url: string;
  imageLoading: boolean;
  setImageLoading: React.Dispatch<React.SetStateAction<boolean>>;
  priority?: boolean;
}

export interface InstagramCardProps {
  id: string;
  caption: string;
  mediaType: MediaType;
  mediaUrl: string;
  userName: string;
  timestamp: string;
  permalink: string;
  thumbnail_url?: string;
  priority?: boolean;
}

export interface InstagramCarouselProps {
  instagramPosts: InstagramMedia[];
}
