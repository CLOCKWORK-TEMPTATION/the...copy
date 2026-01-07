/**
 * PostDeletionValidator - التحقق بعد الحذف
 * Validates the project after deletion operations
 */

import { execSync } from 'child_process';
import { readFileSync, statSync } from 'fs';
import { LogManager, LogLevel } from './LogManager.js';

export interface ValidationResult {
  build_success: boolean;
  test_success: boolean;
  typecheck_success: boolean;
  lint_success: boolean;
  errors: string[];
  warnings: string[];
  before_after: {
    file_count: { before: number; after: number };
    total_size: { before: number; after: number };
  };
}

export interface ValidationOptions {
  run_build?: boolean;
  run_test?: boolean;
  run_typecheck?: boolean;
  run_lint?: boolean;
  build_command?: string;
  test_command?: string;
  typecheck_command?: string;
  lint_command?: string;
}

export class PostDeletionValidator {
  private logger: LogManager;
  private repoPath: string;

  constructor(repoPath: string, logger: LogManager) {
    this.repoPath = repoPath;
    this.logger = logger;
  }

  /**
   * التحقق الشامل بعد الحذف
   */
  async validate(
    beforeStats: { files: number; size: number },
    options: ValidationOptions = {}
  ): Promise<ValidationResult> {
    this.logger.info('Running post-deletion validation...');

    const result: ValidationResult = {
      build_success: true,
      test_success: true,
      typecheck_success: true,
      lint_success: true,
      errors: [],
      warnings: [],
      before_after: {
        file_count: {
          before: beforeStats.files,
          after: this.countFiles(),
        },
        total_size: {
          before: beforeStats.size,
          after: this.getTotalSize(),
        },
      },
    };

    // تشغيل الأوامر المطلوبة
    const opts = {
      run_build: true,
      run_test: true,
      run_typecheck: true,
      run_lint: false,
      build_command: 'pnpm build',
      test_command: 'pnpm test',
      typecheck_command: 'pnpm typecheck',
      lint_command: 'pnpm lint',
      ...options,
    };

    // TypeCheck
    if (opts.run_typecheck) {
      this.logger.info('Running typecheck...');
      const typecheckResult = await this.runCommand(opts.typecheck_command!);
      result.typecheck_success = typecheckResult.success;
      if (!typecheckResult.success) {
        result.errors.push(...typecheckResult.errors);
      }
      result.warnings.push(...typecheckResult.warnings);
    }

    // Lint
    if (opts.run_lint) {
      this.logger.info('Running lint...');
      const lintResult = await this.runCommand(opts.lint_command!);
      result.lint_success = lintResult.success;
      if (!lintResult.success) {
        result.errors.push(...lintResult.errors);
      }
      result.warnings.push(...lintResult.warnings);
    }

    // Build
    if (opts.run_build) {
      this.logger.info('Running build...');
      const buildResult = await this.runCommand(opts.build_command!);
      result.build_success = buildResult.success;
      if (!buildResult.success) {
        result.errors.push(...buildResult.errors);
      }
      result.warnings.push(...buildResult.warnings);
    }

    // Test
    if (opts.run_test) {
      this.logger.info('Running tests...');
      const testResult = await this.runCommand(opts.test_command!);
      result.test_success = testResult.success;
      if (!testResult.success) {
        result.errors.push(...testResult.errors);
      }
      result.warnings.push(...testResult.warnings);
    }

    // طباعة الملخص
    this.printSummary(result);

    return result;
  }

  /**
   * تشغيل أمر والتحقق من النتيجة
   */
  private async runCommand(
    command: string
  ): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const output = execSync(command, {
        cwd: this.repoPath,
        encoding: 'utf-8',
        stdio: 'pipe',
      });

      this.logger.debug(`${command} succeeded`);
      return { success: true, errors, warnings };
    } catch (error: any) {
      const stderr = error.stderr || '';
      const stdout = error.stdout || '';

      // تحليل الأخطاء
      const errorLines = stderr.split('\n').concat(stdout.split('\n'));
      for (const line of errorLines) {
        const trimmed = line.trim();
        if (trimmed) {
          if (trimmed.includes('error')) {
            errors.push(trimmed);
          } else if (trimmed.includes('warning')) {
            warnings.push(trimmed);
          }
        }
      }

      this.logger.warn(`${command} failed with ${errors.length} errors`);
      return { success: false, errors, warnings };
    }
  }

  /**
   * حساب عدد الملفات
   */
  private countFiles(): number {
    let count = 0;

    const countRecursive = (dir: string): void => {
      try {
        const entries = require('fs').readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = require('path').join(dir, entry.name);

          // تخطي المجلدات المستثناة
          if (['node_modules', '.git', '.next', 'dist', 'build'].includes(entry.name)) {
            continue;
          }

          if (entry.isDirectory()) {
            countRecursive(fullPath);
          } else if (entry.isFile()) {
            const ext = fullPath.split('.').pop();
            if (['ts', 'tsx', 'js', 'jsx'].includes(ext || '')) {
              count++;
            }
          }
        }
      } catch {
        // تجاهل
      }
    };

    countRecursive(this.repoPath);
    return count;
  }

  /**
   * حساب الحجم الكلي
   */
  private getTotalSize(): number {
    let size = 0;

    const sizeRecursive = (dir: string): void => {
      try {
        const entries = require('fs').readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = require('path').join(dir, entry.name);

          if (['node_modules', '.git', '.next', 'dist', 'build'].includes(entry.name)) {
            continue;
          }

          if (entry.isDirectory()) {
            sizeRecursive(fullPath);
          } else if (entry.isFile()) {
            const ext = fullPath.split('.').pop();
            if (['ts', 'tsx', 'js', 'jsx'].includes(ext || '')) {
              try {
                size += statSync(fullPath).size;
              } catch {
                // تجاهل
              }
            }
          }
        }
      } catch {
        // تجاهل
      }
    };

    sizeRecursive(this.repoPath);
    return size;
  }

  /**
   * طباعة ملخص التحقق
   */
  private printSummary(result: ValidationResult): void {
    this.logger.info('========================================');
    this.logger.info('Validation Summary');
    this.logger.info('========================================');

    // TypeCheck
    const typecheckStatus = result.typecheck_success ? '✓ PASS' : '✗ FAIL';
    this.logger.log(
      result.typecheck_success ? LogLevel.SUCCESS : LogLevel.ERROR,
      `TypeCheck: ${typecheckStatus}`
    );

    // Lint
    if (result.lint_success !== undefined) {
      const lintStatus = result.lint_success ? '✓ PASS' : '✗ FAIL';
      this.logger.log(
        result.lint_success ? LogLevel.SUCCESS : LogLevel.ERROR,
        `Lint: ${lintStatus}`
      );
    }

    // Build
    const buildStatus = result.build_success ? '✓ PASS' : '✗ FAIL';
    this.logger.log(
      result.build_success ? LogLevel.SUCCESS : LogLevel.ERROR,
      `Build: ${buildStatus}`
    );

    // Test
    const testStatus = result.test_success ? '✓ PASS' : '✗ FAIL';
    this.logger.log(
      result.test_success ? LogLevel.SUCCESS : LogLevel.ERROR,
      `Test: ${testStatus}`
    );

    // قبل وبعد
    const filesDiff = result.before_after.file_count.before - result.before_after.file_count.after;
    const sizeDiff = result.before_after.total_size.before - result.before_after.total_size.after;
    const sizeKB = Math.round(sizeDiff / 1024);

    this.logger.info('');
    this.logger.info(`Files: ${result.before_after.file_count.before} → ${result.before_after.file_count.after} (${filesDiff} deleted)`);
    this.logger.info(`Size: ${Math.round(result.before_after.total_size.before / 1024)}KB → ${Math.round(result.before_after.total_size.after / 1024)}KB (${sizeKB}KB saved)`);

    if (result.errors.length > 0) {
      this.logger.error(`Errors: ${result.errors.length}`);
    }
    if (result.warnings.length > 0) {
      this.logger.warn(`Warnings: ${result.warnings.length}`);
    }
  }

  /**
   * الحصول على حالة المشروع الحالية
   */
  getCurrentStats(): { files: number; size: number } {
    return {
      files: this.countFiles(),
      size: this.getTotalSize(),
    };
  }

  /**
   * توليد تقرير نهائي
   */
  generateFinalReport(validationResult: ValidationResult, deletedFiles: string[]): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      validation: validationResult,
      deleted_files: deletedFiles,
      overall_status: this.getOverallStatus(validationResult),
    }, null, 2);
  }

  /**
   * الحصول على الحالة العامة
   */
  private getOverallStatus(result: ValidationResult): string {
    if (result.build_success && result.test_success && result.typecheck_success) {
      return 'SUCCESS';
    }
    if (result.build_success) {
      return 'PARTIAL_SUCCESS';
    }
    return 'FAILED';
  }
}
