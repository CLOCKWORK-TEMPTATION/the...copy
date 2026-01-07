/**
 * FileClassifier - تصنيف الملفات لتحديد ما يمكن حذفه
 * Classifies files to determine which can be safely deleted
 */

import { DependencyNode, DependencyGraph } from './DependencyGraph.js';
import { LogManager } from './LogManager.js';

export enum FileCategory {
  KEEP = 'KEEP',                      // يجب الاحتفاظ به
  DELETE_SAFE = 'DELETE_SAFE',        // حذف آمن
  DELETE_PROBABLY = 'DELETE_PROBABLY', // حذف محتمل
  UNCERTAIN = 'UNCERTAIN',            // غير محدد
}

export interface ClassificationResult {
  node: DependencyNode;
  category: FileCategory;
  safetyScore: number;  // 0 = آمن للحذف، 100 = يجب الاحتفاظ
  reasons: string[];
}

export class FileClassifier {
  private logger: LogManager;
  private graph: DependencyGraph;
  private entryPoints: string[];

  // أسماء الملفات المشبوهة (قد تكون مهمة)
  private readonly SUSPICIOUS_NAMES = [
    'index', 'main', 'app', 'server', 'client',
    'config', 'settings', 'constants', 'types',
    'utils', 'helpers', 'lib', 'core',
  ];

  // أسماء الملفات التي تشير إلى كود مؤقت
  private readonly TEMP_NAMES = [
    'temp', 'tmp', 'test', 'spec', 'mock',
    'old', 'backup', 'bak', 'deprecated',
    'todo', 'fixme', 'wip', 'draft',
  ];

  constructor(graph: DependencyGraph, entryPoints: string[], logger: LogManager) {
    this.graph = graph;
    this.entryPoints = entryPoints;
    this.logger = logger;
  }

  /**
   * تصنيف ملف واحد
   */
  classify(node: DependencyNode): ClassificationResult {
    const result: ClassificationResult = {
      node,
      category: FileCategory.UNCERTAIN,
      safetyScore: 50,
      reasons: [],
    };

    // 1. التحقق من كونه نقطة دخول
    if (this.isEntryPoint(node)) {
      result.safetyScore = 100;
      result.category = FileCategory.KEEP;
      result.reasons.push('Is an entry point');
      return result;
    }

    // 2. التحقق من المسافة من نقاط الدخول
    const distanceScore = this.calculateDistanceScore(node);
    result.safetyScore += distanceScore;
    if (distanceScore < 0) {
      result.reasons.push('Far from entry points');
    } else {
      result.reasons.push('Close to entry points');
    }

    // 3. التحقق من عدد الملفات التي تستورده
    const importersScore = this.calculateImportersScore(node);
    result.safetyScore += importersScore;
    if (importersScore < 0) {
      result.reasons.push('Not imported by other files');
    } else {
      result.reasons.push(`Imported by ${node.exportedBy.size} files`);
    }

    // 4. التحقق من الاسم
    const nameScore = this.calculateNameScore(node);
    result.safetyScore += nameScore;
    if (nameScore < 0) {
      result.reasons.push('Has temporary/deprecated name');
    } else if (nameScore > 0) {
      result.reasons.push('Has important-sounding name');
    }

    // 5. التحقق من الحجم
    const sizeScore = this.calculateSizeScore(node);
    result.safetyScore += sizeScore;

    // 6. التحقق من كونه يتيم
    if (node.isOrphan) {
      result.safetyScore -= 30;
      result.reasons.push('Not reachable from entry points');
    }

    // 7. التحقق من الاستيرادات العكسية (imports from deeper files)
    if (this.hasReverseImports(node)) {
      result.safetyScore -= 20;
      result.reasons.push('Has reverse dependencies');
    }

    // تصحيح النتيجة لتكون بين 0 و 100
    result.safetyScore = Math.max(0, Math.min(100, result.safetyScore));

    // تحديد الفئة
    result.category = this.determineCategory(result.safetyScore);

    return result;
  }

  /**
   * تصنيف جميع الملفات
   */
  classifyAll(): Map<string, ClassificationResult> {
    this.logger.info('Classifying files...');

    const results = new Map<string, ClassificationResult>();

    for (const node of this.graph.nodes.values()) {
      const result = this.classify(node);
      results.set(node.path, result);
    }

    this.logger.success('Classification complete', {
      total: results.size,
      keep: Array.from(results.values()).filter(r => r.category === FileCategory.KEEP).length,
      delete_safe: Array.from(results.values()).filter(r => r.category === FileCategory.DELETE_SAFE).length,
      delete_probably: Array.from(results.values()).filter(r => r.category === FileCategory.DELETE_PROBABLY).length,
      uncertain: Array.from(results.values()).filter(r => r.category === FileCategory.UNCERTAIN).length,
    });

    return results;
  }

  /**
   * تحديد الفئة بناءً على safety_score
   */
  private determineCategory(score: number): FileCategory {
    if (score >= 80) return FileCategory.KEEP;
    if (score >= 60) return FileCategory.UNCERTAIN;
    if (score >= 40) return FileCategory.DELETE_PROBABLY;
    return FileCategory.DELETE_SAFE;
  }

  /**
   * التحقق من كونه نقطة دخول
   */
  private isEntryPoint(node: DependencyNode): boolean {
    return this.entryPoints.some(ep => node.relativePath === ep);
  }

  /**
   * حساب درجة المسافة من نقاط الدخول
   */
  private calculateDistanceScore(node: DependencyNode): number {
    if (node.distanceFromEntry === Infinity) return -20;
    if (node.distanceFromEntry === 0) return 30;
    if (node.distanceFromEntry <= 2) return 20;
    if (node.distanceFromEntry <= 5) return 10;
    if (node.distanceFromEntry <= 10) return 0;
    return -10;
  }

  /**
   * حساب درجة عدد المستوردين
   */
  private calculateImportersScore(node: DependencyNode): number {
    const importCount = node.exportedBy.size;

    if (importCount === 0) return -15;
    if (importCount === 1) return -5;
    if (importCount <= 3) return 0;
    if (importCount <= 5) return 10;
    return 20;
  }

  /**
   * حساب درجة الاسم
   */
  private calculateNameScore(node: DependencyNode): number {
    const name = node.relativePath.toLowerCase();

    // التحقق من الأسماء المؤقتة
    for (const tempName of this.TEMP_NAMES) {
      if (name.includes(tempName)) {
        return -25;
      }
    }

    // التحقق من الأسماء المشبوهة
    for (const susName of this.SUSPICIOUS_NAMES) {
      if (name.includes(susName)) {
        return 15;
      }
    }

    return 0;
  }

  /**
   * حساب درجة الحجم
   */
  private calculateSizeScore(node: DependencyNode): number {
    const sizeKB = node.size / 1024;

    if (sizeKB < 1) return -5;   // صغير جداً - قد يكون فارغاً
    if (sizeKB < 5) return 0;
    if (sizeKB < 20) return 5;
    return 10; // كبير - يحتوي على الكثير من الكود
  }

  /**
   * التحقق من الاستيرادات العكسية
   */
  private hasReverseImports(node: DependencyNode): boolean {
    // ملف يستورد من ملف أبعد عن نقطة الدخول
    for (const imp of node.imports) {
      const impNode = this.graph.nodes.get(imp);
      if (impNode && impNode.distanceFromEntry > node.distanceFromEntry) {
        return true;
      }
    }
    return false;
  }

  /**
   * الحصول على الملفات المقترحة للحذف
   */
  getDeletionCandidates(classifications: Map<string, ClassificationResult>): {
    safe: ClassificationResult[];
    probably: ClassificationResult[];
    uncertain: ClassificationResult[];
  } {
    const safe: ClassificationResult[] = [];
    const probably: ClassificationResult[] = [];
    const uncertain: ClassificationResult[] = [];

    for (const result of classifications.values()) {
      switch (result.category) {
        case FileCategory.DELETE_SAFE:
          safe.push(result);
          break;
        case FileCategory.DELETE_PROBABLY:
          probably.push(result);
          break;
        case FileCategory.UNCERTAIN:
          uncertain.push(result);
          break;
      }
    }

    return { safe, probably, uncertain };
  }

  /**
   * بناء نص للأمر AI لتحليل ملف معقد
   */
  buildAIAnalysisPrompt(node: DependencyNode): string {
    return `
Please analyze this file and determine if it can be safely deleted:

File: ${node.relativePath}
Size: ${node.size} bytes
Imports: ${Array.from(node.imports).join(', ')}
Imported by: ${Array.from(node.exportedBy).join(', ')}
Distance from entry: ${node.distanceFromEntry}
Is orphan: ${node.isOrphan}

Consider:
1. Is this file part of the core functionality?
2. Are there any references to this file in configuration?
3. Does this file contain important types or interfaces?
4. Is this file a component, utility, or test file?

Provide a recommendation (KEEP/DELETE) with reasoning.
`;
  }
}
