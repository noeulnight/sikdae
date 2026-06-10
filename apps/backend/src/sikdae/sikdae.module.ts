import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CacheModule } from "../cache/cache.module";
import { SikdaeService } from "./sikdae.service";

@Module({
  exports: [SikdaeService],
  imports: [
    CacheModule,
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.getOrThrow<string>("sikdae.oauthBaseUrl"),
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "X-User-Agent": configService.getOrThrow<string>("sikdae.xUserAgent"),
        },
        timeout: configService.getOrThrow<number>("sikdae.timeoutMs"),
      }),
    }),
  ],
  providers: [SikdaeService],
})
export class SikdaeModule {}
