import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import type {
  CacheKeyStatus,
  CachePingStatus,
  CacheSetOptions,
} from "./interfaces/cache.interface";

type CacheFallback<T> = [T] extends [never]
  ? "CacheService.cache requires an explicit generic type"
  : () => Promise<T>;

@Injectable()
export class CacheService extends Redis implements OnModuleDestroy {
  constructor(configService: ConfigService) {
    super(configService.getOrThrow<string>("cache.redisUrl"), {
      commandTimeout: 1_000,
      connectTimeout: 1_000,
      enableOfflineQueue: false,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });

    this.on("error", () => undefined);
  }

  async getValue(key: string): Promise<string | null> {
    try {
      await this.ensureRedisConnected();

      return await this.get(key);
    } catch {
      return null;
    }
  }

  async setValue(key: string, value: string, options: CacheSetOptions = {}): Promise<boolean> {
    try {
      await this.ensureRedisConnected();

      if (options.ttlSeconds) {
        await this.set(key, value, "EX", options.ttlSeconds);
      } else {
        await this.set(key, value);
      }

      return true;
    } catch {
      return false;
    }
  }

  async deleteValue(key: string): Promise<boolean> {
    try {
      await this.ensureRedisConnected();
      await this.del(key);

      return true;
    } catch {
      return false;
    }
  }

  async getJsonValue<T>(key: string): Promise<T | null> {
    const cached = await this.getValue(key);

    if (!cached) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(cached);

      return parsed as T;
    } catch {
      return null;
    }
  }

  async setJsonValue<T>(key: string, value: T, options: CacheSetOptions = {}): Promise<boolean> {
    return this.setValue(key, JSON.stringify(value), options);
  }

  async cache<T = never>(
    key: string,
    fallback: CacheFallback<T>,
    options: CacheSetOptions = {},
  ): Promise<T> {
    const cached = await this.getJsonValue<T>(key);

    if (cached !== null) {
      return cached;
    }

    const value = await (fallback as () => Promise<T>)();

    await this.setJsonValue(key, value, options);

    return value;
  }

  async getKeyStatus(key: string): Promise<CacheKeyStatus> {
    try {
      await this.ensureRedisConnected();

      const ttlSeconds = await this.ttl(key);

      return {
        hit: ttlSeconds !== -2,
        ttlSeconds: ttlSeconds >= 0 ? ttlSeconds : null,
      };
    } catch {
      return {
        hit: false,
        ttlSeconds: null,
      };
    }
  }

  async getPingStatus(): Promise<CachePingStatus> {
    const startedAt = Date.now();

    try {
      await this.ensureRedisConnected();

      const response = await this.ping();

      return {
        ping: response === "PONG",
        responseMs: Date.now() - startedAt,
        status: this.status,
      };
    } catch {
      return {
        ping: false,
        responseMs: Date.now() - startedAt,
        status: this.status,
      };
    }
  }

  onModuleDestroy(): void {
    this.disconnect();
  }

  private async ensureRedisConnected(): Promise<void> {
    if (this.status === "wait" || this.status === "close" || this.status === "end") {
      await this.connect();
    }
  }
}
