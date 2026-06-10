import { Injectable } from "@nestjs/common";
import type {
  AppStatusResponseDto,
  HealthResponseDto,
  RootResponseDto,
  StatusMeResponseDto,
} from "./app/dto/app-response.dto";
import { CacheService } from "./cache/cache.service";
import { SikdaeService } from "./sikdae/sikdae.service";
import { SIKDAE_STORE_CACHE_KEYS } from "./store/constants/store.constants";

@Injectable()
export class AppService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly sikdaeService: SikdaeService,
  ) {}

  getRoot(): RootResponseDto {
    return { message: "Sikdae backend is running" };
  }

  getHealth(): HealthResponseDto {
    return { ok: true, service: "backend" };
  }

  async getStatus(): Promise<AppStatusResponseDto> {
    const checkedAt = new Date().toISOString();
    const redis = await this.cacheService.getPingStatus();
    const [me, storeListCache] = await Promise.all([
      this.getMeStatus(),
      this.cacheService.getKeyStatus(SIKDAE_STORE_CACHE_KEYS.list),
    ]);
    const tokenCache = await this.sikdaeService.getTokenCacheStatus();
    const authOk = me.ok;
    const cacheOk = redis.ping;

    return {
      auth: {
        me,
        ok: authOk,
        tokenCache,
      },
      cache: {
        ok: cacheOk,
        redis,
        stores: {
          list: storeListCache,
        },
      },
      checkedAt,
      ok: authOk && cacheOk,
      service: "backend",
    };
  }

  private async getMeStatus(): Promise<StatusMeResponseDto> {
    const startedAt = Date.now();

    try {
      const me = await this.sikdaeService.fetchMe();

      return {
        ok: me.status === "1",
        remoteStatus: me.status,
        responseMs: Date.now() - startedAt,
      };
    } catch {
      return {
        ok: false,
        remoteStatus: null,
        responseMs: Date.now() - startedAt,
      };
    }
  }
}
