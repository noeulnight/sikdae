export interface CacheSetOptions {
  ttlSeconds?: number;
}

export interface CacheKeyStatus {
  hit: boolean;
  ttlSeconds: number | null;
}

export interface CachePingStatus {
  status: string;
  ping: boolean;
  responseMs: number;
}
