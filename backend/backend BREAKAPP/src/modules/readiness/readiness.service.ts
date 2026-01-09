import { Injectable } from '@nestjs/common';
import {
  RepositoryAnalysisService,
  AnalysisData,
} from './repository-analysis.service.js';
import { PromptGeneratorService } from './prompt-generator.service.js';

export interface ProductionReadinessReport {
  metadata: {
    reportDate: string;
    repository: string;
    primaryLanguages: string[];
  };
  summary: string;
  overallStatus: 'ready' | 'conditional' | 'not-ready';
  overallScore: string;
  readinessLevel: string;
  domains: Domain[];
  criticalIssues: CriticalIssue[];
  recommendations: Recommendations;
  conclusion: string;
  prompt?: string;
  analysisData?: AnalysisData;
}

export interface Domain {
  id: number;
  title: string;
  status: 'ready' | 'conditional' | 'not-ready' | 'unknown';
  score: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  findings: string[];
  recommendations: DomainRecommendation[];
  missingInfo: string[];
}

export interface DomainRecommendation {
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  action: string;
  rationale: string;
}

export interface CriticalIssue {
  domain: string;
  issue: string;
  impact: string;
  priority: 'P0';
}

export interface Recommendations {
  immediate: string[];
  shortTerm: string[];
  mediumTerm: string[];
  longTerm: string[];
}

@Injectable()
export class ReadinessService {
  constructor(
    private readonly repositoryAnalysisService: RepositoryAnalysisService,
    private readonly promptGeneratorService: PromptGeneratorService,
  ) {}

  /**
   * Generate a production readiness report for a repository
   */
  async generateReport(
    owner: string,
    repo: string,
    repositoryPath: string,
  ): Promise<ProductionReadinessReport> {
    // Analyze the repository
    const analysisData =
      await this.repositoryAnalysisService.analyzeRepository(repositoryPath);

    // Generate the AI prompt
    const prompt = this.promptGeneratorService.generatePrompt(
      analysisData,
      owner,
      repo,
    );

    // For now, return the prompt and analysis data
    // In a real implementation, this would call an AI service (e.g., OpenAI, Gemini)
    // to generate the actual report based on the prompt
    const report: ProductionReadinessReport = {
      metadata: {
        reportDate: new Date().toISOString().split('T')[0],
        repository: `${owner}/${repo}`,
        primaryLanguages: analysisData.primaryLanguages,
      },
      summary:
        'هذا تقرير جاهزية إنتاج تم إنشاؤه آلياً. يرجى استخدام الـ prompt المرفق مع خدمة AI لتوليد التقرير الكامل.',
      overallStatus: 'conditional',
      overallScore: '0',
      readinessLevel: 'يتطلب تقييم AI كامل',
      domains: [],
      criticalIssues: [],
      recommendations: {
        immediate: [],
        shortTerm: [],
        mediumTerm: [],
        longTerm: [],
      },
      conclusion:
        'يرجى استخدام الـ prompt المرفق مع نموذج AI لتوليد التقرير الكامل.',
      prompt,
      analysisData,
    };

    return report;
  }
}
