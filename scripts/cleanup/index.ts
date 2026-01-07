/**
 * Code Cleanup Tool - الأداة الرئيسية لتنظيف الكود
 * Main entry point for the code cleanup tool
 */

import { resolve, join } from 'path';
import { ConfigManager } from './lib/ConfigManager.js';
import { LogManager } from './lib/LogManager.js';
import { DependencyGraphBuilder } from './lib/DependencyGraphBuilder.js';
import { FileClassifier, FileCategory } from './lib/FileClassifier.js';
import { SafetyChecks, DeletionSimulator } from './lib/SafetyChecks.js';
import { ExecutionManager } from './lib/ExecutionManager.js';
import { PostDeletionValidator } from './lib/PostDeletionValidator.js';

interface CleanupOptions {
  config?: string;
  dryRun?: boolean;
  safeMode?: boolean;
  noBackup?: boolean;
  verbose?: boolean;
}

/**
 * الفئة الرئيسية لأداة تنظيف الكود
 */
export class CodeCleanupTool {
  private configManager: ConfigManager;
  private logger: LogManager;
  private graphBuilder: DependencyGraphBuilder;
  private executionManager: ExecutionManager;
  private validator: PostDeletionValidator;

  constructor(options: CleanupOptions = {}) {
    // إعداد اللوجر
    this.logger = new LogManager('cleanup.log', true);

    // إدارة الإعدادات
    this.configManager = new ConfigManager(options.config || 'cleanup_config.json');

    // تطبيق الخيارات
    const config = this.configManager.getConfig();
    if (options.dryRun !== undefined) config.dry_run = options.dryRun;
    if (options.safeMode !== undefined) config.safe_mode = options.safeMode;
    if (options.noBackup !== undefined) config.create_backup = !options.noBackup;

    // إعداد مدير التنفيذ
    this.executionManager = new ExecutionManager(
      process.cwd(),
      config.create_backup,
      this.logger
    );

    // إعداد المدقق
    this.validator = new PostDeletionValidator(process.cwd(), this.logger);

    // إعداد باني خريطة الاعتماديات
    this.graphBuilder = new DependencyGraphBuilder(
      resolve(process.cwd(), config.repo_path),
      config.entry_points,
      config.ignore_patterns,
      this.logger
    );

    this.logger.info('Code Cleanup Tool initialized');
    this.logger.debug('Configuration', config);
  }

  /**
   * تشغيل الأداة بالكامل
   */
  async run(): Promise<void> {
    const config = this.configManager.getConfig();

    this.logger.info('Starting code cleanup analysis...');
    this.logger.info(`Dry run: ${config.dry_run}`);
    this.logger.info(`Safe mode: ${config.safe_mode}`);
    this.logger.info(`Backup: ${config.create_backup}`);

    try {
      // المرحلة 1: بناء خريطة الاعتماديات
      const graph = await this.graphBuilder.build();

      // المرحلة 2: تصنيف الملفات
      const classifier = new FileClassifier(
        graph,
        config.entry_points,
        this.logger
      );
      const classifications = classifier.classifyAll();

      // المرحلة 3: الحصول على مرشحي الحذف
      const candidates = classifier.getDeletionCandidates(classifications);

      this.logger.info('');
      this.logger.info('=== Analysis Results ===');
      this.logger.info(`Safe to delete: ${candidates.safe.length}`);
      this.logger.info(`Probably can delete: ${candidates.probably.length}`);
      this.logger.info(`Uncertain: ${candidates.uncertain.length}`);
      this.logger.info(`Keep: ${Array.from(classifications.values()).filter(c => c.category === FileCategory.KEEP).length}`);

      // عرض الملفات المرشحة للحذف الآمن
      if (candidates.safe.length > 0) {
        this.logger.info('');
        this.logger.info('Files safe to delete:');
        for (const file of candidates.safe.slice(0, 10)) {
          this.logger.info(`  - ${file.node.relativePath} (score: ${file.safetyScore})`);
        }
        if (candidates.safe.length > 10) {
          this.logger.info(`  ... and ${candidates.safe.length - 10} more`);
        }
      }

      // المرحلة 4: فحوصات الأمان
      const allCandidates = [...candidates.safe, ...candidates.probably];
      const safetyChecks = new SafetyChecks(
        graph,
        config.protected_files,
        config.entry_points,
        this.logger
      );

      const safetyResult = safetyChecks.checkBeforeDeletion(allCandidates);

      if (!safetyResult.isSafe) {
        this.logger.error('Safety checks failed!');
        for (const error of safetyResult.errors) {
          this.logger.error(`  - ${error}`);
        }
      }

      for (const warning of safetyResult.warnings) {
        this.logger.warn(`  - ${warning}`);
      }

      // تصفية الملفات المحظورة
      const safeToDelete = allCandidates.filter(
        c => !safetyResult.blockedFiles.includes(c.node.path)
      );

      // المرحلة 5: محاكاة الحذف
      const simulator = new DeletionSimulator(graph, this.logger);
      const simulation = simulator.simulate(safeToDelete.map(c => c.node.path));

      this.logger.info('');
      this.logger.info('=== Simulation Results ===');
      this.logger.info(`Files that would be orphaned: ${simulation.orphaned.length}`);
      this.logger.info(`Files with broken imports: ${simulation.brokenImports.length}`);

      // المرحلة 6: التنفيذ (إذا لم يكن dry run)
      if (!config.dry_run && safeToDelete.length > 0) {
        // التحقق من safe_mode
        if (config.safe_mode) {
          this.logger.warn('Safe mode is enabled. Please review the results before proceeding.');
          this.logger.info('Run with --safe-mode=false to proceed with deletion.');
          return;
        }

        // الحصول على الإحصائيات قبل الحذف
        const beforeStats = this.validator.getCurrentStats();

        // تنفيذ الحذف
        const deletionResult = await this.executionManager.safeDelete(
          safeToDelete.map(c => c.node.path)
        );

        this.logger.info(`Deleted: ${deletionResult.success.length}`);
        this.logger.info(`Failed: ${deletionResult.failed.length}`);

        // المرحلة 7: التحقق بعد الحذف
        if (deletionResult.success.length > 0) {
          await this.validator.validate(beforeStats, {
            run_typecheck: true,
            run_lint: false,
            run_build: false,
            run_test: false,
          });
        }
      } else {
        this.logger.info('');
        this.logger.info('=== Dry Run Complete ===');
        this.logger.info('No files were deleted. Run without --dry-run to perform deletion.');
      }

      // حفظ التقرير
      const report = {
        timestamp: new Date().toISOString(),
        config: config,
        analysis: {
          total_files: graph.nodes.size,
          unreachable: this.graphBuilder.getUnreachableFiles().length,
          safe_to_delete: candidates.safe.length,
          probably_delete: candidates.probably.length,
          uncertain: candidates.uncertain.length,
        },
        candidates: {
          safe: candidates.safe.map(c => ({
            path: c.node.relativePath,
            score: c.safetyScore,
            reasons: c.reasons,
          })),
          probably: candidates.probably.map(c => ({
            path: c.node.relativePath,
            score: c.safetyScore,
            reasons: c.reasons,
          })),
        },
        simulation: simulation.report,
        safety_checks: safetyResult,
      };

      const reportPath = join(process.cwd(), 'cleanup-report.json');
      require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
      this.logger.info(`Report saved to: ${reportPath}`);

      this.logger.success('Code cleanup analysis complete!');
    } catch (error) {
      this.logger.error('Error during cleanup', error);
      throw error;
    }
  }

  /**
   * استعادة من النسخة الاحتياطية
   */
  async rollback(timestamp?: string): Promise<void> {
    this.logger.info('Rolling back changes...');
    const result = await this.executionManager.rollback(timestamp);
    this.logger.success(`Restored ${result.restored.length} files`);
    if (result.failed.length > 0) {
      this.logger.error(`Failed to restore ${result.failed.length} files`);
    }
  }

  /**
   * تنظيف النسخ الاحتياطية القديمة
   */
  async cleanBackups(keepCount: number = 5): Promise<void> {
    await this.executionManager.cleanOldBackups(keepCount);
  }
}

/**
 * نقطة الدخول الرئيسية
 */
export async function main(options: CleanupOptions = {}): Promise<void> {
  const tool = new CodeCleanupTool(options);

  try {
    await tool.run();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// تشغيل إذا تم تنفيذ الملف مباشرة
if (require.main === module) {
  const args = process.argv.slice(2);

  const options: CleanupOptions = {
    dryRun: args.includes('--dry-run') || args.includes('-n'),
    safeMode: !args.includes('--unsafe') && !args.includes('-u'),
    noBackup: args.includes('--no-backup'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };

  const configIndex = args.indexOf('--config');
  if (configIndex !== -1 && args[configIndex + 1]) {
    options.config = args[configIndex + 1];
  }

  main(options);
}
