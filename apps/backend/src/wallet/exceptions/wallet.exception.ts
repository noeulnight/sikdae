import { HttpException, HttpStatus } from "@nestjs/common";

export class SikdaeWalletException extends HttpException {
  constructor(
    message: string,
    status?: number,
    readonly code?: string,
  ) {
    super(
      {
        code: "SIKDAE_WALLET_REQUEST_FAILED",
        message,
        providerCode: code,
      },
      status ?? HttpStatus.BAD_GATEWAY,
    );
  }
}
