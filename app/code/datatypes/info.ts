export type UInfoV2 = {
  url: string;
  info: ScrapedInfo | null;
  scrapeHistory: Array<scrapeHistory>;
};

export type ScrapedInfo = {
  url: string;
  fullUrl: string;
  hash: string;
  title: string;
  summary: string;
  image: string;
  contentType: string | null;
  duration?: number;
  likes?: number;
  dislikes?: number;
  authorName?: string;
  authorLink?: string;
  publishTime?: number;
};

type scrapeHistory = {
  timestamp: number;
  status: number;
};
