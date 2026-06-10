import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SikdaeModule } from "../sikdae/sikdae.module";
import { SIKDAE_STORE_HEADERS } from "./constants/store.constants";
import { StoreController } from "./store.controller";
import { StoreService } from "./store.service";

@Module({
  controllers: [StoreController],
  exports: [StoreService],
  imports: [
    SikdaeModule,
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const userAgent = configService.getOrThrow<string>("sikdae.xUserAgent");

        return {
          baseURL: configService.getOrThrow<string>("sikdae.apiBaseUrl"),
          headers: {
            Accept: "*/*",
            "Accept-Language": SIKDAE_STORE_HEADERS.acceptLanguage,
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            "X-User-Agent": userAgent,
            "app-name": SIKDAE_STORE_HEADERS.appName,
            "app-platform": SIKDAE_STORE_HEADERS.appPlatform,
            responseType: SIKDAE_STORE_HEADERS.responseType,
            "ua-device-mcc": SIKDAE_STORE_HEADERS.uaDeviceMcc,
            "ua-device-mnc": SIKDAE_STORE_HEADERS.uaDeviceMnc,
          },
          timeout: configService.getOrThrow<number>("sikdae.timeoutMs"),
        };
      },
    }),
  ],
  providers: [StoreService],
})
export class StoreModule {}
