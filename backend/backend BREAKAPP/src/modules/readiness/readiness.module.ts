import { Module } from '@nestjs/common';
import { ReadinessController } from './readiness.controller.js';
import { ReadinessService } from './readiness.service.js';
import { RepositoryAnalysisService } from './repository-analysis.service.js';
import { PromptGeneratorService } from './prompt-generator.service.js';

@Module({
  controllers: [ReadinessController],
  providers: [
    ReadinessService,
    RepositoryAnalysisService,
    PromptGeneratorService,
  ],
  exports: [ReadinessService],
})
export class ReadinessModule {}
