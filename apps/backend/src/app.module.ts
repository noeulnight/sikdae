import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import appConfig from "./config/configs/app.config";
import cacheConfig from "./config/configs/cache.config";
import sikdaeConfig from "./config/configs/sikdae.config";
import { validationSchema } from "./config/validation-schema";
import { CacheModule } from "./cache/cache.module";
import { SikdaeModule } from "./sikdae/sikdae.module";
import { StoreModule } from "./store/store.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env"],
      isGlobal: true,
      load: [appConfig, cacheConfig, sikdaeConfig],
      validationOptions: {
        abortEarly: false,
      },
      validationSchema,
    }),
    CacheModule,
    SikdaeModule,
    StoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
