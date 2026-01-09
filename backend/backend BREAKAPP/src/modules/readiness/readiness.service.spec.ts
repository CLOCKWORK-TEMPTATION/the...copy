import { Test, TestingModule } from '@nestjs/testing';
import { ReadinessService } from './readiness.service';
import { RepositoryAnalysisService } from './repository-analysis.service';
import { PromptGeneratorService } from './prompt-generator.service';
import * as path from 'path';

describe('ReadinessService Integration', () => {
  let service: ReadinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadinessService,
        RepositoryAnalysisService,
        PromptGeneratorService,
      ],
    }).compile();

    service = module.get<ReadinessService>(ReadinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateReport', () => {
    it('should generate a complete report for the repository', async () => {
      const repositoryPath = path.join(__dirname, '../../../../..');
      const report = await service.generateReport(
        'CLOCKWORK-TEMPTATION',
        'breakbreak',
        repositoryPath,
      );

      // Validate metadata
      expect(report.metadata).toBeDefined();
      expect(report.metadata.repository).toBe('CLOCKWORK-TEMPTATION/breakbreak');
      expect(report.metadata.reportDate).toBeDefined();
      expect(report.metadata.primaryLanguages).toContain('TypeScript');

      // Validate analysis data
      expect(report.analysisData).toBeDefined();
      expect(report.analysisData.hasPackageJson).toBe(true);
      expect(report.analysisData.hasGitignore).toBe(true);
      expect(report.analysisData.fileStructure.length).toBeGreaterThan(0);

      // Validate prompt
      expect(report.prompt).toBeDefined();
      expect(report.prompt).toContain('CLOCKWORK-TEMPTATION/breakbreak');
      expect(report.prompt).toContain('المجالات الهندسية');
      expect(report.prompt).toContain('الوظائف الأساسية');
      expect(report.prompt).toContain('الأداء');
      expect(report.prompt).toContain('الأمان');
      expect(report.prompt).toContain('البنية التحتية');
      expect(report.prompt).toContain('المراقبة والسجلات');
      expect(report.prompt).toContain('النسخ الاحتياطي والاستعادة');
      expect(report.prompt).toContain('التوثيق');
      expect(report.prompt).toContain('الاختبار');
      expect(report.prompt).toContain('التوافق');
      expect(report.prompt).toContain('الامتثال');

      // Validate report structure
      expect(report.summary).toBeDefined();
      expect(report.overallStatus).toBeDefined();
      expect(report.readinessLevel).toBeDefined();
      expect(report.conclusion).toBeDefined();

      // Log sample output for verification
      console.log('\n=== Sample Report Output ===');
      console.log('Repository:', report.metadata.repository);
      console.log('Languages:', report.metadata.primaryLanguages.join(', '));
      console.log('Has package.json:', report.analysisData.hasPackageJson);
      console.log('Has tests:', report.analysisData.hasTests);
      console.log('Has CI/CD:', report.analysisData.hasCI);
      console.log('Prompt length:', report.prompt.length, 'characters');
    });

    it('should include all 10 domain criteria in the prompt', async () => {
      const repositoryPath = path.join(__dirname, '../../../../..');
      const report = await service.generateReport(
        'test-owner',
        'test-repo',
        repositoryPath,
      );

      const domains = [
        'الوظائف الأساسية',     // Core Functionality
        'الأداء',                 // Performance
        'الأمان',                 // Security
        'البنية التحتية',        // Infrastructure
        'المراقبة والسجلات',     // Monitoring & Logging
        'النسخ الاحتياطي والاستعادة', // Backup & Recovery
        'التوثيق',                // Documentation
        'الاختبار',              // Testing
        'التوافق',               // Compatibility
        'الامتثال',              // Compliance
      ];

      for (const domain of domains) {
        expect(report.prompt).toContain(domain);
      }
    });

    it('should detect repository technologies correctly', async () => {
      const repositoryPath = path.join(__dirname, '../../../../..');
      const report = await service.generateReport(
        'test',
        'test',
        repositoryPath,
      );

      // This is a TypeScript/JavaScript monorepo
      expect(report.analysisData.hasPackageJson).toBe(true);
      expect(report.metadata.primaryLanguages).toEqual(
        expect.arrayContaining(['TypeScript'])
      );

      // Should include package.json content in prompt
      expect(report.prompt).toContain('محتوى package.json');
    });
  });
});
