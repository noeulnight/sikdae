import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { WalletHistoryQueryDto } from "./dto/wallet-history-query.dto";
import { WalletHistoryResponseDto, WalletResponseDto } from "./dto/wallet-response.dto";
import { WalletService } from "./wallet.service";

@ApiTags("wallet")
@Controller("wallet")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiOperation({ summary: "Get meal wallet amount and available time" })
  @ApiOkResponse({ description: "Meal wallet amount and available time", type: WalletResponseDto })
  @Get()
  getWallet(): Promise<WalletResponseDto> {
    return this.walletService.retrieveWallet();
  }

  @ApiOperation({ summary: "List meal wallet payment history" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiOkResponse({ description: "Meal wallet payment history", type: WalletHistoryResponseDto })
  @Get("history")
  getWalletHistory(@Query() query: WalletHistoryQueryDto): Promise<WalletHistoryResponseDto> {
    return this.walletService.retrieveWalletHistory(query);
  }
}
