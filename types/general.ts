import { MediaType } from './instagram';

export type InstagramMedia = {
  id: string;
  media_url: string;
  media_type: MediaType;
  permalink: string;
  caption: string;
  timestamp: string;
  username: string;
  thumbnail_url?: string;
};
