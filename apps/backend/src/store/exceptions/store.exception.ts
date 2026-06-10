import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";

export class SikdaeStoreException extends HttpException {
  constructor(
    message: string,
    status?: number,
    readonly code?: string,
  ) {
    super(
      {
        code: "SIKDAE_STORE_REQUEST_FAILED",
        message,
        providerCode: code,
      },
      status ?? HttpStatus.BAD_GATEWAY,
    );
  }
}

export class SikdaeStoreNotFoundException extends NotFoundException {
  constructor(storeId: string) {
    super({
      code: "SIKDAE_STORE_NOT_FOUND",
      message: `Sikdae store not found: ${storeId}`,
    });
  }
}
