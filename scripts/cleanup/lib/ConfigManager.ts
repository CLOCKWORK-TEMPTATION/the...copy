/**
 * ConfigManager - إدارة إعدادات أداة تنظيف الكود
 * Configuration Manager for Code Cleanup Tool
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface CleanupConfig {
  repo_path: string;
  ignore_patterns: string[];
  entry_points: string[];
  protected_files: string[];
  safe_mode: boolean;
  create_backup: boolean;
  dry_run: boolean;
}

const DEFAULT_CONFIG: CleanupConfig = {
  repo_path: './src',
  ignore_patterns: [
    'node_modules',
    '.git',
    'dist',
    'build',
    '__pycache__',
    '.vscode',
    '.idea',
    '.next',
    'coverage',
  ],
  entry_points: [
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/server.ts',
    'src/index.ts',
  ],
  protected_files: [
    'package.json',
    'tsconfig.json',
    '.env.example',
    'README.md',
    '.gitignore',
    'next.config.ts',
  ],
  safe_mode: true,
  create_backup: true,
  dry_run: false,
};

export class ConfigManager {
  private config: CleanupConfig;
  private configPath: string;

  constructor(configPath: string = 'cleanup_config.json') {
    this.configPath = configPath;
    this.config = this.loadConfig();
  }

  /**
   * تحميل الإعدادات من الملف أو استخدام الإعدادات الافتراضية
   */
  private loadConfig(): CleanupConfig {
    if (existsSync(this.configPath)) {
      try {
        const content = readFileSync(this.configPath, 'utf-8');
        const loaded = JSON.parse(content);
        return { ...DEFAULT_CONFIG, ...loaded };
      } catch (error) {
        console.warn(`Failed to load config from ${this.configPath}, using defaults`);
        return { ...DEFAULT_CONFIG };
      }
    }
    return { ...DEFAULT_CONFIG };
  }

  /**
   * الحصول على الإعدادات الحالية
   */
  getConfig(): CleanupConfig {
    return { ...this.config };
  }

  /**
   * تحديث إعداد معين
   */
  set<K extends keyof CleanupConfig>(key: K, value: CleanupConfig[K]): void {
    this.config[key] = value;
  }

  /**
   * حفظ الإعدادات إلى الملف
   */
  saveConfig(): void {
    writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  /**
   * التحقق مما إذا كان المسار محمياً
   */
  isProtected(filePath: string): boolean {
    const relativePath = filePath.replace(this.config.repo_path, '').replace(/^[\/\\]/, '');
    return this.config.protected_files.some(protFile =>
      relativePath === protFile || relativePath.endsWith(`/${protFile}`) || relativePath.endsWith(`\\${protFile}`)
    );
  }

  /**
   * التحقق مما إذا كان المسار يجب تجاهله
   */
  isIgnored(filePath: string): boolean {
    return this.config.ignore_patterns.some(pattern =>
      filePath.includes(pattern) || filePath.match(new RegExp(pattern))
    );
  }
}
