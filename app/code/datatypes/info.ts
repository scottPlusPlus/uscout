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


export function hashOrF(u:UInfoV2, fallback:string=""): string {
  if (!u.info){
    return fallback;
  }
  return u.info.hash;
}

export function titleOrF(u:UInfoV2, fallback:string=""): string {
  if (!u.info){
    return fallback;
  }
  return u.info.title;
}

export function imageOrF(u:UInfoV2, fallback:string=""): string {
  if (!u.info){
    return fallback;
  }
  return u.info.image;
}

export function updatedTime(u:UInfoV2):number {
  const history = u.scrapeHistory;
  if (history.length == 0){
    return -1;
  }
  const goodEntry = history[history.length-1];
  if (goodEntry.status == 200){
    return goodEntry.timestamp;
  }
  return -1;
}