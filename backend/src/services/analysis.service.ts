import { PipelineInput, PipelineRunResult, Station1Output, StationOutput } from '@/types';
import { GeminiService } from './gemini.service';
import { logger } from '@/utils/logger';

export class AnalysisService {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = new GeminiService();
  }

  async runFullPipeline(input: PipelineInput): Promise<PipelineRunResult> {
    const startTime = Date.now();
    logger.info('Starting analysis pipeline', { projectName: input.projectName });

    try {
      // Station 1: Text Analysis
      const station1Output = await this.runStation1(input);
      
      // Run stations 2-7 in parallel for efficiency
      const [station2Output, station3Output, station4Output, station5Output, station6Output] = await Promise.all([
        this.runStation2(input),
        this.runStation3(input),
        this.runStation4(input),
        this.runStation5(input),
        this.runStation6(input),
      ]);

      // Station 7 runs last, taking other outputs as context
      const station7Output = await this.runStation7(input, {
        station1: station1Output,
        station2: station2Output,
        station3: station3Output,
        station4: station4Output,
        station5: station5Output,
        station6: station6Output,
      });

      const endTime = Date.now();
      
      return {
        stationOutputs: {
          station1: station1Output,
          station2: station2Output,
          station3: station3Output,
          station4: station4Output,
          station5: station5Output,
          station6: station6Output,
          station7: station7Output,
        },
        pipelineMetadata: {
          stationsCompleted: 7,
          totalExecutionTime: endTime - startTime,
          startedAt: new Date(startTime).toISOString(),
          finishedAt: new Date(endTime).toISOString(),
        },
      };
    } catch (error) {
      logger.error('Pipeline execution failed:', error);
      throw error;
    }
  }

  private async runStation1(input: PipelineInput): Promise<Station1Output> {
    const startTime = Date.now();
    
    try {
      const analysis = await this.geminiService.analyzeText(input.fullText, 'characters');
      
      // Parse AI response to extract structured data
      const characters = this.extractCharacters(analysis);
      const relationships = this.extractRelationships(analysis);
      
      return {
        stationId: 1,
        stationName: 'Text Analysis',
        executionTime: Date.now() - startTime,
        status: 'completed',
        timestamp: new Date().toISOString(),
        majorCharacters: characters,
        relationships: relationships,
        narrativeStyleAnalysis: {
          overallTone: 'درامي',
          pacing: 'متوسط',
          complexity: 7,
        },
      };
    } catch (error) {
      logger.error('Station 1 failed:', error);
      throw new Error('فشل في تحليل النص الأساسي');
    }
  }

  private extractCharacters(analysis: string): string[] {
    // Simple extraction - في التطبيق الحقيقي نحتاج parsing أكثر تعقيداً
    const lines = analysis.split('\n');
    const characters: string[] = [];
    
    for (const line of lines) {
      if (line.includes('شخصية') || line.includes('الشخصيات')) {
        const matches = line.match(/[\u0600-\u06FF\s]+/g);
        if (matches) {
          characters.push(...matches.filter(m => m.trim().length > 2));
        }
      }
    }
    
    return [...new Set(characters)].slice(0, 10); // أول 10 شخصيات فريدة
  }

  private extractRelationships(analysis: string): Array<{
    character1: string;
    character2: string;
    relationshipType: string;
    strength: number;
  }> {
    // Mock implementation - في التطبيق الحقيقي نحتاج parsing متقدم
    return [
      {
        character1: 'البطل',
        character2: 'البطلة',
        relationshipType: 'حب',
        strength: 0.9,
      },
    ];
  }

  private async runStation2(input: PipelineInput): Promise<StationOutput> {
    const startTime = Date.now();
    try {
      const analysis = await this.geminiService.analyzeText(input.fullText, 'themes');
      return {
        stationId: 2,
        stationName: 'التحليل المفاهيمي',
        executionTime: Date.now() - startTime,
        status: 'completed',
        timestamp: new Date().toISOString(),
        details: { themes: analysis.split('\n') },
      };
    } catch (error) {
      logger.error('Station 2 failed:', error);
      throw new Error('فشل في التحليل المفاهيمي');
    }
  }

  private async runStation3(input: PipelineInput): Promise<StationOutput> {
    const startTime = Date.now();
    try {
      const analysis = await this.geminiService.analyzeText(input.fullText, 'relationships');
      return {
        stationId: 3,
        stationName: 'شبكة الصراعات',
        executionTime: Date.now() - startTime,
        status: 'completed',
        timestamp: new Date().toISOString(),
        details: { conflicts: analysis },
      };
    } catch (error) {
      logger.error('Station 3 failed:', error);
      throw new Error('فشل في تحليل شبكة الصراعات');
    }
  }

  private async runStation4(input: PipelineInput): Promise<StationOutput> {
    const startTime = Date.now();
    try {
      const analysis = await this.geminiService.analyzeText(input.fullText, 'effectiveness');
      return {
        stationId: 4,
        stationName: 'مقاييس الفعالية',
        executionTime: Date.now() - startTime,
        status: 'completed',
        timestamp: new Date().toISOString(),
        details: { effectiveness: analysis },
      };
    } catch (error) {
      logger.error('Station 4 failed:', error);
      throw new Error('فشل في قياس الفعالية');
    }
  }

  private async runStation5(input: PipelineInput): Promise<StationOutput> {
    const startTime = Date.now();
    try {
      const analysis = await this.geminiService.analyzeText(input.fullText, 'symbolism');
      return {
        stationId: 5,
        stationName: 'الديناميكية والرمزية',
        executionTime: Date.now() - startTime,
        status: 'completed',
        timestamp: new Date().toISOString(),
        details: { symbolism: analysis },
      };
    } catch (error) {
      logger.error('Station 5 failed:', error);
      throw new Error('فشل في تحليل الديناميكية والرمزية');
    }
  }

  private async runStation6(input: PipelineInput): Promise<StationOutput> {
    const startTime = Date.now();
    try {
      const review = await this.geminiService.reviewScreenplay(input.fullText);
      return {
        stationId: 6,
        stationName: 'الفريق الأحمر',
        executionTime: Date.now() - startTime,
        status: 'completed',
        timestamp: new Date().toISOString(),
        details: { criticalReview: review },
      };
    } catch (error) {
      logger.error('Station 6 failed:', error);
      throw new Error('فشل في تحليل الفريق الأحمر');
    }
  }

  private async runStation7(input: PipelineInput, allOutputs: Record<string, any>): Promise<StationOutput> {
    const startTime = Date.now();
    try {
      const summaryContext = `بناءً على التحليلات التالية، قم بإنشاء تقرير نهائي متكامل:\n\n${JSON.stringify(allOutputs, null, 2)}`;
      const finalReport = await this.geminiService.analyzeText(summaryContext, 'summary');
      return {
        stationId: 7,
        stationName: 'التقرير النهائي',
        executionTime: Date.now() - startTime,
        status: 'completed',
        timestamp: new Date().toISOString(),
        details: { finalReport },
      };
    } catch (error) {
      logger.error('Station 7 failed:', error);
      throw new Error('فشل في إنشاء التقرير النهائي');
    }
  }
}