import { ApiProperty } from "@nestjs/swagger";

export class WalletTimeWindowDto {
  @ApiProperty({ example: -32400000 })
  startOffsetMs!: number;

  @ApiProperty({ example: 53700000 })
  endOffsetMs!: number;
}

export class WalletResponseDto {
  @ApiProperty({ example: 99200 })
  amount!: number;

  @ApiProperty({ type: [WalletTimeWindowDto] })
  timeWindows!: WalletTimeWindowDto[];
}

export class WalletHistoryItemDto {
  @ApiProperty({ example: "019EAF9F-DA4B-778A-961F-26CE3D233DB6" })
  id!: string;

  @ApiProperty({ example: "851복덮밥" })
  title!: string;

  @ApiProperty({ example: -9900 })
  amount!: number;

  @ApiProperty({ example: "2026-06-10T03:43:15.000Z" })
  usedAt!: string;
}

export class WalletHistoryPaginationDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: true })
  hasNext!: boolean;

  @ApiProperty({ example: 2, nullable: true, type: Number })
  nextPage!: number | null;
}

export class WalletHistoryResponseDto {
  @ApiProperty({ type: [WalletHistoryItemDto] })
  items!: WalletHistoryItemDto[];

  @ApiProperty({ type: WalletHistoryPaginationDto })
  pagination!: WalletHistoryPaginationDto;
}
