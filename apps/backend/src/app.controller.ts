import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  AppStatusResponseDto,
  HealthResponseDto,
  RootResponseDto,
} from "./app/dto/app-response.dto";
import { AppService } from "./app.service";

@ApiTags("app")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: "Backend root status" })
  @ApiOkResponse({ description: "Backend root message", type: RootResponseDto })
  @Get()
  getRoot(): RootResponseDto {
    return this.appService.getRoot();
  }

  @ApiOperation({ summary: "Health check" })
  @ApiOkResponse({ description: "Backend health status", type: HealthResponseDto })
  @Get("health")
  getHealth(): HealthResponseDto {
    return this.appService.getHealth();
  }

  @ApiOperation({ summary: "Authentication and cache status" })
  @ApiOkResponse({
    description: "Safe backend authentication and cache diagnostics",
    type: AppStatusResponseDto,
  })
  @Get("status")
  getStatus(): Promise<AppStatusResponseDto> {
    return this.appService.getStatus();
  }
}
