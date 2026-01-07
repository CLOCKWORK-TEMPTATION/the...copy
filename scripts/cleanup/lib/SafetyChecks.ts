/**
 * SafetyChecks - فحوصات الأمان قبل الحذف
 * Safety checks before file deletion
 */

import { DependencyGraph, DependencyNode } from './DependencyGraph.js';
import { LogManager } from './LogManager.js';
import { FileCategory, ClassificationResult } from './FileClassifier.js';

export interface SafetyCheckResult {
  isSafe: boolean;
  warnings: string[];
  errors: string[];
  blockedFiles: string[];
}

export class SafetyChecks {
  private logger: LogManager;
  private graph: DependencyGraph;
  private protectedFiles: string[];
  private entryPoints: string[];

  constructor(
    graph: DependencyGraph,
    protectedFiles: string[],
    entryPoints: string[],
    logger: LogManager
  ) {
    this.graph = graph;
    this.protectedFiles = protectedFiles;
    this.entryPoints = entryPoints;
    this.logger = logger;
  }

  /**
   * فحص شامل للأمان قبل الحذف
   */
  checkBeforeDeletion(candidates: ClassificationResult[]): SafetyCheckResult {
    this.logger.info('Running safety checks...');

    const result: SafetyCheckResult = {
      isSafe: true,
      warnings: [],
      errors: [],
      blockedFiles: [],
    };

    // 1. التحقق من الملفات المحمية
    for (const candidate of candidates) {
      if (this.isProtected(candidate.node)) {
        result.isSafe = false;
        result.errors.push(`Cannot delete protected file: ${candidate.node.relativePath}`);
        result.blockedFiles.push(candidate.node.path);
      }
    }

    // 2. التحقق من نقاط الدخول
    for (const candidate of candidates) {
      if (this.isEntryPoint(candidate.node)) {
        result.isSafe = false;
        result.errors.push(`Cannot delete entry point: ${candidate.node.relativePath}`);
        result.blockedFiles.push(candidate.node.path);
      }
    }

    // 3. التحقق من الاعتماديات الدائرية
    const circularDeps = this.findCircularDependencies();
    if (circularDeps.length > 0) {
      result.warnings.push(`Found ${circularDeps.length} circular dependencies`);
      for (const cycle of circularDeps) {
        result.warnings.push(`  Cycle: ${cycle.join(' -> ')}`);
      }
    }

    // 4. التحقق من الملفات التي ستصبح يتيمة
    const wouldBeOrphaned = this.findWouldBeOrphaned(candidates);
    if (wouldBeOrphaned.length > 0) {
      result.warnings.push(`After deletion, ${wouldBeOrphaned.length} files would become orphaned`);
      for (const file of wouldBeOrphaned.slice(0, 5)) {
        result.warnings.push(`  - ${file}`);
      }
      if (wouldBeOrphaned.length > 5) {
        result.warnings.push(`  ... and ${wouldBeOrphaned.length - 5} more`);
      }
    }

    // 5. التحقق من الملفات المهمة
    const importantFiles = this.findImportantFiles(candidates);
    if (importantFiles.length > 0) {
      result.warnings.push(`Some files appear important based on naming`);
      for (const file of importantFiles) {
        result.warnings.push(`  - ${file}`);
      }
    }

    return result;
  }

  /**
   * التحقق من كون الملف محمي
   */
  private isProtected(node: DependencyNode): boolean {
    return this.protectedFiles.some(protFile =>
      node.relativePath === protFile ||
      node.relativePath.endsWith(`/${protFile}`) ||
      node.relativePath.endsWith(`\\${protFile}`)
    );
  }

  /**
   * التحقق من كون الملف نقطة دخول
   */
  private isEntryPoint(node: DependencyNode): boolean {
    return this.entryPoints.some(ep => node.relativePath === ep);
  }

  /**
   * البحث عن الاعتماديات الدائرية
   */
  findCircularDependencies(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (path: string, pathStack: string[]): void => {
      visited.add(path);
      recStack.add(path);
      pathStack.push(path);

      const imports = this.graph.imports.get(path) || new Set();

      for (const imp of imports) {
        if (recStack.has(imp)) {
          const cycleStart = pathStack.indexOf(imp);
          cycles.push([...pathStack.slice(cycleStart), imp]);
        } else if (!visited.has(imp) && this.graph.nodes.has(imp)) {
          dfs(imp, [...pathStack]);
        }
      }

      recStack.delete(path);
    };

    for (const path of this.graph.nodes.keys()) {
      if (!visited.has(path)) {
        dfs(path, []);
      }
    }

    return cycles;
  }

  /**
   * البحث عن الملفات التي ستصبح يتيمة بعد الحذف
   */
  private findWouldBeOrphaned(candidates: ClassificationResult[]): string[] {
    const toDelete = new Set(candidates.map(c => c.node.path));
    const wouldBeOrphaned: string[] = [];

    for (const [path, node] of this.graph.nodes) {
      if (toDelete.has(path)) continue;

      // التحقق مما إذا كان جميع مستوردي هذا الملف سيتم حذفهم
      const importers = Array.from(node.exportedBy);
      const allImportersDeleted = importers.length > 0 &&
        importers.every(imp => toDelete.has(imp));

      if (allImportersDeleted && !node.isOrphan) {
        wouldBeOrphaned.push(node.relativePath);
      }
    }

    return wouldBeOrphaned;
  }

  /**
   * البحث عن الملفات المهمة بناءً على الاسم
   */
  private findImportantFiles(candidates: ClassificationResult[]): string[] {
    const important: string[] = [];
    const importantPatterns = [
      'index', 'main', 'app', 'server', 'client',
      'config', 'types', 'constants', 'utils',
    ];

    for (const candidate of candidates) {
      if (candidate.category === FileCategory.DELETE_SAFE) {
        const name = candidate.node.relativePath.toLowerCase();
        for (const pattern of importantPatterns) {
          if (name.includes(pattern)) {
            important.push(candidate.node.relativePath);
            break;
          }
        }
      }
    }

    return important;
  }

  /**
   * التحقق من إمكانية حذف ملف واحد
   */
  canDeleteFile(node: DependencyNode): { canDelete: boolean; reason: string } {
    // ملف محمي
    if (this.isProtected(node)) {
      return { canDelete: false, reason: 'File is protected' };
    }

    // نقطة دخول
    if (this.isEntryPoint(node)) {
      return { canDelete: false, reason: 'File is an entry point' };
    }

    // ملف مستورد من قبل ملفات أخرى
    if (node.exportedBy.size > 0) {
      return {
        canDelete: true,
        reason: `Warning: Imported by ${node.exportedBy.size} file(s)`,
      };
    }

    return { canDelete: true, reason: 'Safe to delete' };
  }
}

/**
 * DeletionSimulator - محاكاة الحذف قبل التنفيذ الفعلي
 */
export class DeletionSimulator {
  private logger: LogManager;
  private graph: DependencyGraph;

  constructor(graph: DependencyGraph, logger: LogManager) {
    this.graph = graph;
    this.logger = logger;
  }

  /**
   * محاكاة حذف ملفات معينة
   */
  simulate(toDelete: string[]): {
    orphaned: string[];
    brokenImports: string[];
    affectedFiles: number;
    report: any;
  } {
    this.logger.info(`Simulating deletion of ${toDelete.length} files...`);

    const deleteSet = new Set(toDelete);
    const orphaned: string[] = [];
    const brokenImports: { from: string; missing: string }[] = [];

    // البحث عن الملفات التي ستتأثر
    for (const [path, node] of this.graph.nodes) {
      if (deleteSet.has(path)) continue;

      // التحقق مما إذا كان هذا الملف يستورد ملفات سيتم حذفها
      for (const imp of node.imports) {
        if (deleteSet.has(imp)) {
          brokenImports.push({ from: path, missing: imp });
        }
      }

      // التحقق مما إذا كان سيتيم
      const importers = Array.from(node.exportedBy);
      const allImportersDeleted = importers.length > 0 &&
        importers.every(imp => deleteSet.has(imp));

      if (allImportersDeleted && !node.isOrphan) {
        orphaned.push(path);
      }
    }

    const report = {
      files_to_delete: toDelete.length,
      affected_files: brokenImports.length,
      orphaned_after: orphaned.length,
      broken_imports: brokenImports.length,
      details: {
        broken_imports: brokenImports.slice(0, 20),
        orphaned: orphaned.slice(0, 20),
      },
    };

    this.logger.success('Simulation complete', report);

    return {
      orphaned,
      brokenImports: brokenImports.map(b => b.from),
      affectedFiles: brokenImports.length,
      report,
    };
  }

  /**
   * توليد تقرير المحاكاة بصيغة JSON
   */
  generateSimulationReport(toDelete: string[]): string {
    const simulation = this.simulate(toDelete);

    return JSON.stringify({
      timestamp: new Date().toISOString(),
      simulation: simulation.report,
      recommendation: this.generateRecommendation(simulation),
    }, null, 2);
  }

  /**
   * توليد توصية بناءً على نتائج المحاكاة
   */
  private generateRecommendation(simulation: any): string {
    if (simulation.affectedFiles === 0 && simulation.orphaned.length === 0) {
      return 'SAFE_TO_DELETE';
    }

    if (simulation.affectedFiles > 10) {
      return 'UNSAFE: Too many files will be affected';
    }

    if (simulation.orphaned.length > 5) {
      return 'CAUTION: Many files will become orphaned';
    }

    return 'REVIEW_RECOMMENDED';
  }
}
