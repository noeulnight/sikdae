import { ApiProperty } from "@nestjs/swagger";

export class RootResponseDto {
  @ApiProperty({ example: "Sikdae backend is running" })
  message!: string;
}

export class HealthResponseDto {
  @ApiProperty({ example: true })
  ok!: boolean;

  @ApiProperty({ example: "backend" })
  service!: string;
}

export class CacheKeyStatusResponseDto {
  @ApiProperty({ example: true })
  hit!: boolean;

  @ApiProperty({ example: 86300, nullable: true, type: Number })
  ttlSeconds!: number | null;
}

export class StatusMeResponseDto {
  @ApiProperty({ example: true })
  ok!: boolean;

  @ApiProperty({ example: "1", nullable: true, type: String })
  remoteStatus!: string | null;

  @ApiProperty({ example: 120 })
  responseMs!: number;
}

export class StatusAuthResponseDto {
  @ApiProperty({ example: true })
  ok!: boolean;

  @ApiProperty({ type: StatusMeResponseDto })
  me!: StatusMeResponseDto;

  @ApiProperty({ type: CacheKeyStatusResponseDto })
  tokenCache!: CacheKeyStatusResponseDto;
}

export class StatusRedisResponseDto {
  @ApiProperty({ example: "ready" })
  status!: string;

  @ApiProperty({ example: true })
  ping!: boolean;

  @ApiProperty({ example: 2 })
  responseMs!: number;
}

export class StatusStoreCachesResponseDto {
  @ApiProperty({ type: CacheKeyStatusResponseDto })
  list!: CacheKeyStatusResponseDto;
}

export class StatusCacheResponseDto {
  @ApiProperty({ example: true })
  ok!: boolean;

  @ApiProperty({ type: StatusRedisResponseDto })
  redis!: StatusRedisResponseDto;

  @ApiProperty({ type: StatusStoreCachesResponseDto })
  stores!: StatusStoreCachesResponseDto;
}

export class AppStatusResponseDto {
  @ApiProperty({ example: true })
  ok!: boolean;

  @ApiProperty({ enum: ["backend"], example: "backend" })
  service!: "backend";

  @ApiProperty({ example: "2026-06-10T01:00:00.000Z" })
  checkedAt!: string;

  @ApiProperty({ type: StatusAuthResponseDto })
  auth!: StatusAuthResponseDto;

  @ApiProperty({ type: StatusCacheResponseDto })
  cache!: StatusCacheResponseDto;
}
