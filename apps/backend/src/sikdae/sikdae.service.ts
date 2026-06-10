import { constants, createHash, publicEncrypt } from "node:crypto";
import { firstValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { isAxiosError } from "axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CacheService } from "../cache/cache.service";
import type { CacheKeyStatus } from "../cache/interfaces/cache.interface";
import {
  SIKDAE_API_PATHS,
  SIKDAE_APP_HEADERS,
  SIKDAE_CACHE_SKEW_SECONDS,
  SIKDAE_GRANT_TYPE,
  SIKDAE_OAUTH_PATHS,
  SIKDAE_TOKEN_CACHE_PREFIX,
} from "./constants/sikdae.constants";
import { SikdaeOAuthException } from "./exceptions/sikdae-oauth.exception";
import type {
  SikdaeKmsPublicKeyResponse,
  SikdaeMeResponse,
  SikdaeSsoResponse,
  SikdaeTokenRequestBody,
  SikdaeTokenResponse,
} from "./interfaces/sikdae-oauth.interface";

@Injectable()
export class SikdaeService {
  private readonly apiBaseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly kmsKeyId: string;
  private readonly password: string;
  private readonly signId: string;
  private readonly xUserAgent: string;

  constructor(
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiBaseUrl = this.configService.getOrThrow<string>("sikdae.apiBaseUrl").replace(/\/$/, "");
    this.clientId = this.configService.getOrThrow<string>("sikdae.clientId");
    this.clientSecret = this.configService.getOrThrow<string>("sikdae.clientSecret");
    this.kmsKeyId = this.configService.getOrThrow<string>("sikdae.kmsKeyId");
    this.password = this.configService.getOrThrow<string>("sikdae.password");
    this.signId = this.configService.getOrThrow<string>("sikdae.signId");
    this.xUserAgent = this.configService.getOrThrow<string>("sikdae.xUserAgent");
  }

  async retrieveToken(): Promise<SikdaeTokenResponse> {
    const cachedToken = await this.getCachedToken();

    if (cachedToken) {
      return cachedToken;
    }

    const { publicKey } = await this.fetchKmsPublicKey();
    const encryptedPassword = this.encryptPassword(this.password, publicKey);
    const token = await this.requestToken(encryptedPassword);

    await this.cacheToken(token);

    return token;
  }

  async fetchSsoInfo(): Promise<SikdaeSsoResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<SikdaeSsoResponse>(SIKDAE_OAUTH_PATHS.sso, {
          params: { signId: this.signId },
        }),
      );

      return response.data;
    } catch (error) {
      throw this.toSikdaeOAuthException(error, SIKDAE_OAUTH_PATHS.sso);
    }
  }

  async fetchMe(): Promise<SikdaeMeResponse> {
    const token = await this.retrieveToken();
    const url = `${this.apiBaseUrl}${SIKDAE_API_PATHS.me}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<SikdaeMeResponse>(url, {
          headers: {
            Accept: "*/*",
            "Accept-Language": SIKDAE_APP_HEADERS.acceptLanguage,
            Authorization: `${token.token_type} ${token.access_token}`,
            "Content-Type": "application/json",
            "User-Agent": this.xUserAgent,
            "X-User-Agent": this.xUserAgent,
            "app-name": SIKDAE_APP_HEADERS.appName,
            "app-platform": SIKDAE_APP_HEADERS.appPlatform,
            responseType: SIKDAE_APP_HEADERS.responseType,
            "ua-device-mcc": SIKDAE_APP_HEADERS.uaDeviceMcc,
            "ua-device-mnc": SIKDAE_APP_HEADERS.uaDeviceMnc,
          },
        }),
      );

      return response.data;
    } catch (error) {
      throw this.toSikdaeOAuthException(error, SIKDAE_API_PATHS.me);
    }
  }

  async getTokenCacheStatus(): Promise<CacheKeyStatus> {
    return this.cacheService.getKeyStatus(this.getTokenCacheKey());
  }

  async fetchKmsPublicKey(): Promise<SikdaeKmsPublicKeyResponse> {
    const path = SIKDAE_OAUTH_PATHS.kmsPublicKey(this.kmsKeyId);

    try {
      const response = await firstValueFrom(this.httpService.get<SikdaeKmsPublicKeyResponse>(path));

      return response.data;
    } catch (error) {
      throw this.toSikdaeOAuthException(error, path);
    }
  }

  async requestToken(encryptedPassword: string): Promise<SikdaeTokenResponse> {
    const body: SikdaeTokenRequestBody = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: SIKDAE_GRANT_TYPE,
      password: encryptedPassword,
      username: this.signId,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post<SikdaeTokenResponse>(SIKDAE_OAUTH_PATHS.token, body),
      );

      return response.data;
    } catch (error) {
      throw this.toSikdaeOAuthException(error, SIKDAE_OAUTH_PATHS.token);
    }
  }

  private async getCachedToken(): Promise<SikdaeTokenResponse | null> {
    return this.cacheService.getJsonValue<SikdaeTokenResponse>(this.getTokenCacheKey());
  }

  private async cacheToken(token: SikdaeTokenResponse): Promise<void> {
    await this.cacheService.setJsonValue(this.getTokenCacheKey(), token, {
      ttlSeconds: this.getTokenCacheTtlSeconds(token),
    });
  }

  private getTokenCacheKey(): string {
    const digest = createHash("sha256").update(`${this.clientId}:${this.signId}`).digest("hex");

    return `${SIKDAE_TOKEN_CACHE_PREFIX}:${digest}`;
  }

  private getTokenCacheTtlSeconds(token: SikdaeTokenResponse): number {
    return Math.max(1, Math.floor(token.expire_time) - SIKDAE_CACHE_SKEW_SECONDS);
  }

  private normalizePublicKey(publicKey: string): string {
    const trimmed = publicKey.trim();

    if (trimmed.includes("BEGIN PUBLIC KEY")) {
      return trimmed;
    }

    const body = trimmed
      .replaceAll(/\s/g, "")
      .match(/.{1,64}/g)
      ?.join("\n");

    if (!body) {
      throw new Error("Sikdae KMS public key is empty");
    }

    return `-----BEGIN PUBLIC KEY-----\n${body}\n-----END PUBLIC KEY-----`;
  }

  private encryptPassword(password: string, publicKey: string): string {
    const encrypted = publicEncrypt(
      {
        key: this.normalizePublicKey(publicKey),
        padding: constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(password, "utf8"),
    );

    return encrypted.toString("base64");
  }

  private toSikdaeOAuthException(error: unknown, path: string): SikdaeOAuthException {
    if (isAxiosError(error)) {
      return new SikdaeOAuthException(
        `Sikdae OAuth request failed: ${path}`,
        error.response?.status,
        error.code,
      );
    }

    return new SikdaeOAuthException(`Sikdae OAuth request failed: ${path}`);
  }
}
