import { Test, TestingModule } from '@nestjs/testing';
import { ReadinessController } from './readiness.controller';
import { ReadinessService } from './readiness.service';
import { RepositoryAnalysisService } from './repository-analysis.service';
import { PromptGeneratorService } from './prompt-generator.service';

describe('ReadinessController', () => {
  let controller: ReadinessController;
  let service: ReadinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReadinessController],
      providers: [
        ReadinessService,
        RepositoryAnalysisService,
        PromptGeneratorService,
      ],
    }).compile();

    controller = module.get<ReadinessController>(ReadinessController);
    service = module.get<ReadinessService>(ReadinessService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('health', () => {
    it('should return health status', () => {
      const result = controller.health();
      expect(result).toEqual({
        status: 'ok',
        message: 'Production Readiness Service is running',
      });
    });
  });

  describe('generateReport', () => {
    it('should generate a report with default values', async () => {
      const dto = {};
      const result = await controller.generateReport(dto);

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.repository).toBe('CLOCKWORK-TEMPTATION/breakbreak');
      expect(result.prompt).toBeDefined();
      expect(result.analysisData).toBeDefined();
    });

    it('should generate a report with custom owner and repo', async () => {
      const dto = {
        owner: 'test-owner',
        repo: 'test-repo',
        repositoryPath: process.cwd().replace('/apps/backend', ''),
      };
      const result = await controller.generateReport(dto);

      expect(result).toBeDefined();
      expect(result.metadata.repository).toBe('test-owner/test-repo');
    });
  });
});
