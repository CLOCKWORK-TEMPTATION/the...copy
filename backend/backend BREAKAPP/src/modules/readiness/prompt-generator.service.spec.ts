import { Test, TestingModule } from '@nestjs/testing';
import { PromptGeneratorService } from './prompt-generator.service';
import { AnalysisData } from './repository-analysis.service';

describe('PromptGeneratorService', () => {
  let service: PromptGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromptGeneratorService],
    }).compile();

    service = module.get<PromptGeneratorService>(PromptGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePrompt', () => {
    it('should generate a prompt with analysis data', () => {
      const analysisData: AnalysisData = {
        hasPackageJson: true,
        hasRequirementsTxt: false,
        hasPyprojectToml: false,
        hasDockerfile: true,
        hasTests: true,
        hasCI: false,
        hasReadme: true,
        hasGitignore: true,
        fileStructure: ['package.json', 'README.md', 'src/'],
        packageJsonContent: '{"name": "test"}',
        readmeContent: '# Test Project',
        primaryLanguages: ['TypeScript', 'JavaScript'],
      };

      const prompt = service.generatePrompt(
        analysisData,
        'test-owner',
        'test-repo',
      );

      expect(prompt).toBeDefined();
      expect(prompt).toContain('test-owner/test-repo');
      expect(prompt).toContain('✓ موجود'); // package.json exists
      expect(prompt).toContain('✗ غير موجود'); // requirements.txt doesn't exist
      expect(prompt).toContain('package.json');
      expect(prompt).toContain('README.md');
      expect(prompt).toContain('المجالات الهندسية');
      expect(prompt).toContain('الوظائف الأساسية');
      expect(prompt).toContain('الأداء');
      expect(prompt).toContain('الأمان');
    });

    it('should include file structure in prompt', () => {
      const analysisData: AnalysisData = {
        hasPackageJson: false,
        hasRequirementsTxt: false,
        hasPyprojectToml: false,
        hasDockerfile: false,
        hasTests: false,
        hasCI: false,
        hasReadme: false,
        hasGitignore: false,
        fileStructure: ['src/', 'test/', 'index.ts'],
        primaryLanguages: ['TypeScript'],
      };

      const prompt = service.generatePrompt(
        analysisData,
        'owner',
        'repo',
      );

      expect(prompt).toContain('src/');
      expect(prompt).toContain('test/');
      expect(prompt).toContain('index.ts');
    });
  });
});
