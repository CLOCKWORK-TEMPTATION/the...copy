/**
 * DependencyGraphBuilder - بناء خريطة الاعتماديات
 * Builds a comprehensive dependency graph of the codebase
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative, extname } from 'path';
import { LogManager } from './LogManager.js';

export interface DependencyNode {
  path: string;
  relativePath: string;
  imports: Set<string>;
  exportedBy: Set<string>;
  distanceFromEntry: number;
  isOrphan: boolean;
  size: number;
  extension: string;
}

export interface DependencyGraph {
  nodes: Map<string, DependencyNode>;
  imports: Map<string, Set<string>>;      // من يستورد من
  importedBy: Map<string, Set<string>>;   // من يتم استيراده بواسطة
}

export class DependencyGraphBuilder {
  private logger: LogManager;
  private graph: DependencyGraph;
  private entryPoints: string[];
  private repoPath: string;
  private ignorePatterns: string[];

  // أنماط الاستيراد الشائعة
  private readonly IMPORT_PATTERNS = [
    // ES6 imports
    /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"`]([^'"`]+)['"`]/g,
    // CommonJS require
    /require\(['"`]([^'"`]+)['"`]\)/g,
    // TypeScript dynamic imports
    /import\(['"`]([^'"`]+)['"`]\)/g,
    // Next.js dynamic imports
    /dynamic\(['"`]([^'"`]+)['"`]\)/g,
  ];

  constructor(
    repoPath: string,
    entryPoints: string[],
    ignorePatterns: string[],
    logger: LogManager
  ) {
    this.repoPath = repoPath;
    this.entryPoints = entryPoints;
    this.ignorePatterns = ignorePatterns;
    this.logger = logger;

    this.graph = {
      nodes: new Map(),
      imports: new Map(),
      importedBy: new Map(),
    };
  }

  /**
   * بناء خريطة الاعتماديات الكاملة
   */
  async build(): Promise<DependencyGraph> {
    this.logger.info('Building dependency graph...');

    // 1. جمع جميع الملفات
    await this.collectFiles();

    // 2. استخراج الاعتماديات من كل ملف
    await this.extractDependencies();

    // 3. حساب المسافة من نقاط الدخول
    await this.calculateDistances();

    // 4. تحديد الملفات اليتيمة
    await this.identifyOrphans();

    this.logger.success('Dependency graph built successfully', {
      nodes: this.graph.nodes.size,
      edges: Array.from(this.graph.imports.values()).reduce((sum, set) => sum + set.size, 0),
    });

    return this.graph;
  }

  /**
   * جمع جميع الملفات في المشروع
   */
  private async collectFiles(): Promise<void> {
    this.logger.debug('Collecting files...');

    const collectRecursive = (dir: string): void => {
      try {
        const entries = readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          const relativePath = relative(this.repoPath, fullPath);

          // تخطي المجلدات المستثناة
          if (this.shouldIgnore(relativePath)) {
            continue;
          }

          if (entry.isDirectory()) {
            collectRecursive(fullPath);
          } else if (entry.isFile()) {
            const ext = extname(entry.name);
            const supportedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

            if (supportedExtensions.includes(ext)) {
              const stats = statSync(fullPath);
              this.graph.nodes.set(fullPath, {
                path: fullPath,
                relativePath,
                imports: new Set(),
                exportedBy: new Set(),
                distanceFromEntry: Infinity,
                isOrphan: false,
                size: stats.size,
                extension: ext,
              });
            }
          }
        }
      } catch (error) {
        // تجاهل الأخطاء في الوصول للمجلدات
      }
    };

    collectRecursive(this.repoPath);
  }

  /**
   * استخراج الاعتماديات من كل ملف
   */
  private async extractDependencies(): Promise<void> {
    this.logger.debug('Extracting dependencies...');

    for (const [filePath, node] of this.graph.nodes) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        const imports = this.extractImportsFromFile(content, filePath);

        // إضافة الاستيرادات للعقدة
        for (const imp of imports) {
          node.imports.add(imp);

          // إضافة للخريطة
          if (!this.graph.imports.has(filePath)) {
            this.graph.imports.set(filePath, new Set());
          }
          this.graph.imports.get(filePath)!.add(imp);

          // إضافة للعكس
          if (!this.graph.importedBy.has(imp)) {
            this.graph.importedBy.set(imp, new Set());
          }
          this.graph.importedBy.get(imp)!.add(filePath);

          // تحديث العقدة المستوردة
          if (this.graph.nodes.has(imp)) {
            this.graph.nodes.get(imp)!.exportedBy.add(filePath);
          }
        }
      } catch (error) {
        this.logger.warn(`Failed to read file: ${filePath}`);
      }
    }
  }

  /**
   * استخراج الاستيرادات من محتوى الملف
   */
  private extractImportsFromFile(content: string, filePath: string): string[] {
    const imports: string[] = [];
    const fileDir = filePath.substring(0, filePath.lastIndexOf('/') + 1);

    for (const pattern of this.IMPORT_PATTERNS) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const importPath = match[1];

        // تخطي الاعتماديات الخارجية
        if (importPath.startsWith('.') || importPath.startsWith('/')) {
          // تحويل المسار النسبي إلى مطلق
          const resolvedPath = this.resolveImportPath(importPath, fileDir);
          if (resolvedPath && this.graph.nodes.has(resolvedPath)) {
            imports.push(resolvedPath);
          }
        }
      }
    }

    return imports;
  }

  /**
   * تحويل مسار الاستيراد النسبي إلى مسار مطلق
   */
  private resolveImportPath(importPath: string, baseDir: string): string | null {
    // إزالة الامتدادات المضافة
    let cleanPath = importPath
      .replace(/\.ts$/, '')
      .replace(/\.tsx$/, '')
      .replace(/\.js$/, '')
      .replace(/\.jsx$/, '');

    // إضافة الامتدادات الممكنة
    const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js'];
    const basePath = importPath.startsWith('.')
      ? join(baseDir, importPath)
      : importPath;

    for (const ext of possibleExtensions) {
      const fullPath = cleanPath.endsWith(ext)
        ? cleanPath
        : cleanPath + ext;

      if (this.graph.nodes.has(fullPath)) {
        return fullPath;
      }
    }

    return null;
  }

  /**
   * حساب المسافة من نقاط الدخول باستخدام BFS
   */
  private async calculateDistances(): Promise<void> {
    this.logger.debug('Calculating distances from entry points...');

    // تهيئة المسافات
    for (const node of this.graph.nodes.values()) {
      node.distanceFromEntry = Infinity;
    }

    // BFS من كل نقطة دخول
    for (const entryPoint of this.entryPoints) {
      const entryPath = join(this.repoPath, entryPoint);

      if (!this.graph.nodes.has(entryPath)) {
        this.logger.warn(`Entry point not found: ${entryPoint}`);
        continue;
      }

      // BFS
      const queue: { path: string; distance: number }[] = [
        { path: entryPath, distance: 0 }
      ];

      while (queue.length > 0) {
        const { path, distance } = queue.shift()!;
        const node = this.graph.nodes.get(path);

        if (!node || distance >= node.distanceFromEntry) {
          continue;
        }

        node.distanceFromEntry = distance;

        // إضافة جميع الاستيرادات للqueue
        for (const imp of node.imports) {
          queue.push({ path: imp, distance: distance + 1 });
        }
      }
    }
  }

  /**
   * تحديد الملفات اليتيمة (غير القابلة للوصول)
   */
  private async identifyOrphans(): Promise<void> {
    this.logger.debug('Identifying orphaned files...');

    for (const node of this.graph.nodes.values()) {
      node.isOrphan = node.distanceFromEntry === Infinity;
    }
  }

  /**
   * التحقق مما إذا كان المسار يجب تجاهله
   */
  private shouldIgnore(path: string): boolean {
    return this.ignorePatterns.some(pattern =>
      path.includes(pattern) || path.match(new RegExp(pattern))
    );
  }

  /**
   * البحث عن ملف يحتوي على نص معين
   */
  findFilesContaining(content: string): string[] {
    const results: string[] = [];

    for (const [path, node] of this.graph.nodes) {
      try {
        const fileContent = readFileSync(path, 'utf-8');
        if (fileContent.includes(content)) {
          results.push(path);
        }
      } catch (error) {
        // تجاهل
      }
    }

    return results;
  }

  /**
   * الحصول على جميع الملفات غير القابلة للوصول
   */
  getUnreachableFiles(): DependencyNode[] {
    return Array.from(this.graph.nodes.values()).filter(n => n.isOrphan);
  }

  /**
   * الحصول على جميع الملفات القابلة للوصول
   */
  getReachableFiles(): DependencyNode[] {
    return Array.from(this.graph.nodes.values()).filter(n => !n.isOrphan);
  }

  /**
   * البحث عن اعتماديات دائرية
   */
  findCircularDependencies(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (path: string, currentPath: string[]): void => {
      visited.add(path);
      recursionStack.add(path);
      currentPath.push(path);

      const imports = this.graph.imports.get(path) || new Set();

      for (const imp of imports) {
        if (recursionStack.has(imp)) {
          // وجدنا دورة
          const cycleStart = currentPath.indexOf(imp);
          cycles.push([...currentPath.slice(cycleStart), imp]);
        } else if (!visited.has(imp)) {
          dfs(imp, [...currentPath]);
        }
      }

      recursionStack.delete(path);
    };

    for (const path of this.graph.nodes.keys()) {
      if (!visited.has(path)) {
        dfs(path, []);
      }
    }

    return cycles;
  }

  /**
   * الحصول على الخريطة
   */
  getGraph(): DependencyGraph {
    return this.graph;
  }
}
