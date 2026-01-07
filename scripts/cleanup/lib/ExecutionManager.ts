/**
 * ExecutionManager - إدارة عملية الحذف والنسخ الاحتياطي
 * Manages deletion operations with backup and rollback
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';
import { LogManager } from './LogManager.js';

export interface DeletionLog {
  timestamp: string;
  backup_path: string;
  deleted_files: Array<{
    original_path: string;
    backup_path: string;
    size: number;
  }>;
}

export class ExecutionManager {
  private logger: LogManager;
  private backupDir: string;
  private logFilePath: string;

  constructor(
    private repoPath: string,
    private createBackup: boolean = true,
    logger?: LogManager
  ) {
    this.logger = logger || new LogManager();
    this.backupDir = join(repoPath, '_cleanup_backup');
    this.logFilePath = join(this.backupDir, 'deletion_log.json');
  }

  /**
   * نسخ الملفات احتياطياً
   */
  async backupFiles(filePaths: string[]): Promise<string> {
    if (!this.createBackup) {
      this.logger.warn('Backup is disabled, skipping...');
      return '';
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = join(this.backupDir, timestamp);

    this.logger.info(`Creating backup at: ${backupPath}`);

    // إنشاء مجلد النسخ الاحتياطي
    mkdirSync(backupPath, { recursive: true });

    for (const filePath of filePaths) {
      try {
        // الحفاظ على هيكل المجلدات
        const relativePath = filePath.replace(this.repoPath, '').replace(/^[\/\\]/, '');
        const targetPath = join(backupPath, relativePath);

        // إنشاء المجلدات الفرعية
        const targetDir = targetPath.substring(0, targetPath.lastIndexOf('/') || targetPath.lastIndexOf('\\'));
        if (!existsSync(targetDir)) {
          mkdirSync(targetDir, { recursive: true });
        }

        // نسخ الملف
        copyFileSync(filePath, targetPath);
      } catch (error) {
        this.logger.error(`Failed to backup: ${filePath}`, error);
      }
    }

    this.logger.success(`Backup complete: ${filePaths.length} files backed up`);
    return backupPath;
  }

  /**
   * حذف الملفات بشكل آمن
   */
  async safeDelete(filePaths: string[]): Promise<{
    success: string[];
    failed: Array<{ path: string; error: string }>;
  }> {
    this.logger.info(`Deleting ${filePaths.length} files...`);

    const success: string[] = [];
    const failed: Array<{ path: string; error: string }> = [];

    // إنشاء النسخة الاحتياطية أولاً
    let backupPath = '';
    if (this.createBackup) {
      backupPath = await this.backupFiles(filePaths);
    }

    // حذف الملفات
    for (const filePath of filePaths) {
      try {
        if (existsSync(filePath)) {
          const stats = statSync(filePath);

          // حذف الملف
          rmSync(filePath);

          success.push(filePath);
          this.logger.debug(`Deleted: ${filePath}`);
        } else {
          failed.push({ path: filePath, error: 'File not found' });
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        failed.push({ path: filePath, error: errorMsg });
        this.logger.error(`Failed to delete: ${filePath}`, error);
      }
    }

    // تسجيل العملية
    await this.logDeletion(backupPath, success);

    this.logger.success(`Deletion complete: ${success.length} deleted, ${failed.length} failed`);

    return { success, failed };
  }

  /**
   * تسجيل عملية الحذف
   */
  private async logDeletion(backupPath: string, deletedFiles: string[]): Promise<void> {
    if (!this.createBackup) return;

    mkdirSync(this.backupDir, { recursive: true });

    const log: DeletionLog = {
      timestamp: new Date().toISOString(),
      backup_path: backupPath,
      deleted_files: deletedFiles.map(path => {
        try {
          return {
            original_path: path,
            backup_path: path.replace(this.repoPath, backupPath),
            size: statSync(join(backupPath, path.replace(this.repoPath, '').replace(/^[\/\\]/, ''))).size,
          };
        } catch {
          return {
            original_path: path,
            backup_path: '',
            size: 0,
          };
        }
      }),
    };

    // قراءة السجل القديم
    let allLogs: DeletionLog[] = [];
    if (existsSync(this.logFilePath)) {
      try {
        allLogs = JSON.parse(readFileSync(this.logFilePath, 'utf-8'));
      } catch {
        // تجاهل أخطاء القراءة
      }
    }

    // إضافة السجل الجديد
    allLogs.push(log);

    // حفظ السجل
    writeFileSync(this.logFilePath, JSON.stringify(allLogs, null, 2));
  }

  /**
   * استعادة الملفات من النسخة الاحتياطية
   */
  async rollback(timestamp?: string): Promise<{
    restored: string[];
    failed: Array<{ path: string; error: string }>;
  }> {
    this.logger.info('Rolling back deletion...');

    // قراءة سجل الحذف
    if (!existsSync(this.logFilePath)) {
      this.logger.error('No deletion log found');
      return { restored: [], failed: [] };
    }

    const logs: DeletionLog[] = JSON.parse(readFileSync(this.logFilePath, 'utf-8'));

    // تحديد السجل المراد استعادته
    let targetLog: DeletionLog | undefined;

    if (timestamp) {
      targetLog = logs.find(log => log.timestamp.startsWith(timestamp));
    } else {
      // آخر سجل
      targetLog = logs[logs.length - 1];
    }

    if (!targetLog) {
      this.logger.error('Deletion log not found');
      return { restored: [], failed: [] };
    }

    this.logger.info(`Restoring from: ${targetLog.timestamp}`);

    const restored: string[] = [];
    const failed: Array<{ path: string; error: string }> = [];

    for (const file of targetLog.deleted_files) {
      try {
        if (existsSync(file.backup_path)) {
          // إنشاء المجلدات الفرعية
          const targetDir = file.original_path.substring(
            0,
            Math.max(
              file.original_path.lastIndexOf('/'),
              file.original_path.lastIndexOf('\\')
            )
          );
          if (targetDir && !existsSync(targetDir)) {
            mkdirSync(targetDir, { recursive: true });
          }

          // نسخ الملف
          copyFileSync(file.backup_path, file.original_path);
          restored.push(file.original_path);
        } else {
          failed.push({ path: file.original_path, error: 'Backup not found' });
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        failed.push({ path: file.original_path, error: errorMsg });
      }
    }

    this.logger.success(`Rollback complete: ${restored.length} restored, ${failed.length} failed`);

    return { restored, failed };
  }

  /**
   * حذف النسخة الاحتياطية القديمة
   */
  async cleanOldBackups(keepCount: number = 5): Promise<void> {
    if (!existsSync(this.backupDir)) {
      return;
    }

    const backups = readdirSync(this.backupDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name.match(/^\d{4}-\d{2}-\d{2}T/))
      .map(d => join(this.backupDir, d.name))
      .sort()
      .reverse();

    // الاحتفاظ بعدد محدد من النسخ
    const toDelete = backups.slice(keepCount);

    for (const backup of toDelete) {
      try {
        rmSync(backup, { recursive: true });
        this.logger.debug(`Deleted old backup: ${backup}`);
      } catch (error) {
        this.logger.warn(`Failed to delete old backup: ${backup}`);
      }
    }

    this.logger.info(`Cleaned ${toDelete.length} old backups, kept ${Math.min(keepCount, backups.length)}`);
  }

  /**
   * الحصول على قائمة النسخ الاحتياطية
   */
  listBackups(): string[] {
    if (!existsSync(this.backupDir)) {
      return [];
    }

    return readdirSync(this.backupDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name.match(/^\d{4}-\d{2}-\d{2}T/))
      .map(d => d.name)
      .sort()
      .reverse();
  }

  /**
   * الحصول على سجل الحذف
   */
  getDeletionLog(): DeletionLog[] {
    if (!existsSync(this.logFilePath)) {
      return [];
    }

    try {
      return JSON.parse(readFileSync(this.logFilePath, 'utf-8'));
    } catch {
      return [];
    }
  }
}
