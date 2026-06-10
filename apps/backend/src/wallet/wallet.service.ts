import { firstValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { isAxiosError } from "axios";
import { Injectable } from "@nestjs/common";
import type { SikdaeTokenResponse } from "../sikdae/interfaces/sikdae-oauth.interface";
import { SikdaeService } from "../sikdae/sikdae.service";
import { SIKDAE_WALLET_GROUP_TYPE, SIKDAE_WALLET_PATHS } from "./constants/wallet.constants";
import type { WalletHistoryQueryDto } from "./dto/wallet-history-query.dto";
import { SikdaeWalletException } from "./exceptions/wallet.exception";
import type {
  SikdaeWalletHistoryResponse,
  SikdaeWalletPolicyResponse,
  WalletHistoryResult,
  WalletResult,
} from "./interfaces/wallet.interface";
import { findWalletPolicyId, mapWallet, mapWalletHistory } from "./mappers/wallet.mapper";

@Injectable()
export class WalletService {
  constructor(
    private readonly httpService: HttpService,
    private readonly sikdaeService: SikdaeService,
  ) {}

  async retrieveWallet(): Promise<WalletResult> {
    const token = await this.sikdaeService.retrieveToken();
    const policy = await this.fetchWalletPolicy(token);

    return mapWallet(policy);
  }

  async retrieveWalletHistory(query: WalletHistoryQueryDto): Promise<WalletHistoryResult> {
    const token = await this.sikdaeService.retrieveToken();
    const policy = await this.fetchWalletPolicy(token);
    const policyId = findWalletPolicyId(policy);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    if (!policyId) {
      return {
        items: [],
        pagination: {
          hasNext: false,
          limit,
          nextPage: null,
          page,
        },
      };
    }

    const history = await this.fetchWalletHistory(policyId, token, { limit, page });

    return mapWalletHistory(history, { limit, page });
  }

  private async fetchWalletPolicy(token: SikdaeTokenResponse): Promise<SikdaeWalletPolicyResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<SikdaeWalletPolicyResponse>(SIKDAE_WALLET_PATHS.policy, {
          headers: {
            Authorization: `${token.token_type} ${token.access_token}`,
          },
          params: {
            groupType: SIKDAE_WALLET_GROUP_TYPE,
          },
        }),
      );

      return response.data;
    } catch (error) {
      throw this.toSikdaeWalletException(error, SIKDAE_WALLET_PATHS.policy);
    }
  }

  private async fetchWalletHistory(
    policyId: number,
    token: SikdaeTokenResponse,
    query: Required<Pick<WalletHistoryQueryDto, "limit" | "page">>,
  ): Promise<SikdaeWalletHistoryResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<SikdaeWalletHistoryResponse>(SIKDAE_WALLET_PATHS.history, {
          headers: {
            Authorization: `${token.token_type} ${token.access_token}`,
          },
          params: {
            isPolicyInfo: query.page === 1,
            page: query.page,
            pageRow: query.limit + 1,
            policyIdx: policyId,
            searchType: "",
          },
        }),
      );

      return response.data;
    } catch (error) {
      throw this.toSikdaeWalletException(error, SIKDAE_WALLET_PATHS.history);
    }
  }

  private toSikdaeWalletException(error: unknown, path: string): SikdaeWalletException {
    if (isAxiosError(error)) {
      return new SikdaeWalletException(
        `Sikdae wallet request failed: ${path}`,
        error.response?.status,
        error.code,
      );
    }

    return new SikdaeWalletException(`Sikdae wallet request failed: ${path}`);
  }
}
