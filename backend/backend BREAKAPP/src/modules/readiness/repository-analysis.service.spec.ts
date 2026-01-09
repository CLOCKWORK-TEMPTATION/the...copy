import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryAnalysisService } from './repository-analysis.service';
import * as path from 'path';

describe('RepositoryAnalysisService', () => {
  let service: RepositoryAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RepositoryAnalysisService],
    }).compile();

    service = module.get<RepositoryAnalysisService>(RepositoryAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeRepository', () => {
    it('should analyze the current repository', async () => {
      const repositoryPath = path.join(__dirname, '../../../../..');
      const result = await service.analyzeRepository(repositoryPath);

      expect(result).toBeDefined();
      expect(result.hasPackageJson).toBe(true);
      expect(result.hasGitignore).toBe(true);
      expect(result.fileStructure).toBeDefined();
      expect(result.fileStructure.length).toBeGreaterThan(0);
    });

    it('should detect package.json content', async () => {
      const repositoryPath = path.join(__dirname, '../../../../..');
      const result = await service.analyzeRepository(repositoryPath);

      expect(result.packageJsonContent).toBeDefined();
      expect(result.packageJsonContent).toContain('breakapp');
    });

    it('should detect primary languages', async () => {
      const repositoryPath = path.join(__dirname, '../../../../..');
      const result = await service.analyzeRepository(repositoryPath);

      expect(result.primaryLanguages).toBeDefined();
      expect(result.primaryLanguages.length).toBeGreaterThan(0);
      expect(result.primaryLanguages).toContain('TypeScript');
    });
  });
});
