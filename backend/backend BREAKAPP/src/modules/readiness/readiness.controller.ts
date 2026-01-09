import { Controller, Post, Body, Get } from '@nestjs/common';
import { ReadinessService } from './readiness.service.js';
import { GenerateReportDto } from './dto/generate-report.dto.js';

@Controller('readiness')
export class ReadinessController {
  constructor(private readonly readinessService: ReadinessService) {}

  @Post('generate')
  async generateReport(@Body() dto: GenerateReportDto) {
    const owner = dto.owner || 'CLOCKWORK-TEMPTATION';
    const repo = dto.repo || 'breakbreak';
    const repositoryPath =
      dto.repositoryPath || process.cwd().replace('/apps/backend', '');

    return this.readinessService.generateReport(owner, repo, repositoryPath);
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      message: 'Production Readiness Service is running',
    };
  }
}
