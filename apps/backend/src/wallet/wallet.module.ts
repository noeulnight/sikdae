import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SIKDAE_APP_HEADERS } from "../sikdae/constants/sikdae.constants";
import { SikdaeModule } from "../sikdae/sikdae.module";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";

@Module({
  controllers: [WalletController],
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
            "Accept-Language": SIKDAE_APP_HEADERS.acceptLanguage,
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            "X-User-Agent": userAgent,
            "app-name": SIKDAE_APP_HEADERS.appName,
            "app-platform": SIKDAE_APP_HEADERS.appPlatform,
            responseType: SIKDAE_APP_HEADERS.responseType,
            "ua-device-mcc": SIKDAE_APP_HEADERS.uaDeviceMcc,
            "ua-device-mnc": SIKDAE_APP_HEADERS.uaDeviceMnc,
          },
          timeout: configService.getOrThrow<number>("sikdae.timeoutMs"),
        };
      },
    }),
  ],
  providers: [WalletService],
})
export class WalletModule {}
