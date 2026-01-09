import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

export interface AnalysisData {
  hasPackageJson: boolean;
  hasRequirementsTxt: boolean;
  hasPyprojectToml: boolean;
  hasDockerfile: boolean;
  hasTests: boolean;
  hasCI: boolean;
  hasReadme: boolean;
  hasGitignore: boolean;
  fileStructure: string[];
  packageJsonContent?: string;
  readmeContent?: string;
  requirementsContent?: string;
  pyprojectContent?: string;
  dockerfileContent?: string;
  primaryLanguages: string[];
}

@Injectable()
export class RepositoryAnalysisService {
  private readonly logger = new Logger(RepositoryAnalysisService.name);
  private static readonly MAX_RECURSION_DEPTH = 3;
  private static readonly TEST_PATTERNS = [
    'test',
    'tests',
    '__tests__',
    'spec',
    '*.test.ts',
    '*.test.js',
    '*.spec.ts',
    '*.spec.js',
    '*_test.py',
    'test_*.py',
  ];
  private static readonly TEST_PATTERN_REGEXES = RepositoryAnalysisService.TEST_PATTERNS.map(
    (pattern) => new RegExp(pattern.replace(/\*/g, '.*')),
  );

  /**
   * Analyze the repository structure and content
   */
  async analyzeRepository(repositoryPath: string): Promise<AnalysisData> {
    const analysisData: AnalysisData = {
      hasPackageJson: false,
      hasRequirementsTxt: false,
      hasPyprojectToml: false,
      hasDockerfile: false,
      hasTests: false,
      hasCI: false,
      hasReadme: false,
      hasGitignore: false,
      fileStructure: [],
      primaryLanguages: [],
    };

    try {
      // Check for key files
      analysisData.hasPackageJson = await this.fileExists(
        path.join(repositoryPath, 'package.json'),
      );
      analysisData.hasRequirementsTxt = await this.fileExists(
        path.join(repositoryPath, 'requirements.txt'),
      );
      analysisData.hasPyprojectToml = await this.fileExists(
        path.join(repositoryPath, 'pyproject.toml'),
      );
      analysisData.hasDockerfile =
        (await this.fileExists(path.join(repositoryPath, 'Dockerfile'))) ||
        (await this.fileExists(path.join(repositoryPath, 'dockerfile')));
      analysisData.hasReadme =
        (await this.fileExists(path.join(repositoryPath, 'README.md'))) ||
        (await this.fileExists(path.join(repositoryPath, 'readme.md')));
      analysisData.hasGitignore = await this.fileExists(
        path.join(repositoryPath, '.gitignore'),
      );

      // Check for CI/CD
      analysisData.hasCI =
        (await this.directoryExists(
          path.join(repositoryPath, '.github/workflows'),
        )) ||
        (await this.fileExists(path.join(repositoryPath, '.gitlab-ci.yml'))) ||
        (await this.fileExists(path.join(repositoryPath, '.circleci/config.yml'))) ||
        (await this.fileExists(path.join(repositoryPath, 'azure-pipelines.yml')));

      // Check for tests
      analysisData.hasTests = await this.hasTestFiles(repositoryPath);

      // Get file structure
      analysisData.fileStructure = await this.getFileStructure(
        repositoryPath,
        2,
      );

      // Read content of key files
      if (analysisData.hasPackageJson) {
        analysisData.packageJsonContent = await this.readFile(
          path.join(repositoryPath, 'package.json'),
        );
      }

      if (analysisData.hasReadme) {
        const readmePath =
          (await this.fileExists(path.join(repositoryPath, 'README.md')))
            ? path.join(repositoryPath, 'README.md')
            : path.join(repositoryPath, 'readme.md');
        analysisData.readmeContent = await this.readFile(readmePath);
      }

      if (analysisData.hasRequirementsTxt) {
        analysisData.requirementsContent = await this.readFile(
          path.join(repositoryPath, 'requirements.txt'),
        );
      }

      if (analysisData.hasPyprojectToml) {
        analysisData.pyprojectContent = await this.readFile(
          path.join(repositoryPath, 'pyproject.toml'),
        );
      }

      if (analysisData.hasDockerfile) {
        const dockerfilePath = (await this.fileExists(
          path.join(repositoryPath, 'Dockerfile'),
        ))
          ? path.join(repositoryPath, 'Dockerfile')
          : path.join(repositoryPath, 'dockerfile');
        analysisData.dockerfileContent = await this.readFile(dockerfilePath);
      }

      // Detect primary languages
      analysisData.primaryLanguages = await this.detectLanguages(repositoryPath);
    } catch (error) {
      this.logger.error('Error analyzing repository:', error);
    }

    return analysisData;
  }

  /**
   * Check if a file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath);
      return stats.isFile();
    } catch {
      return false;
    }
  }

  /**
   * Check if a directory exists
   */
  private async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Read file content
   */
  private async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      return '';
    }
  }

  /**
   * Get file structure up to specified depth
   */
  private async getFileStructure(
    dirPath: string,
    maxDepth: number,
    currentDepth = 0,
    prefix = '',
  ): Promise<string[]> {
    const structure: string[] = [];

    if (currentDepth >= maxDepth) {
      return structure;
    }

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        // Skip hidden files and common directories to ignore
        if (
          entry.name.startsWith('.') ||
          entry.name === 'node_modules' ||
          entry.name === 'dist' ||
          entry.name === 'build' ||
          entry.name === '__pycache__' ||
          entry.name === 'venv'
        ) {
          continue;
        }

        const fullPath = path.join(dirPath, entry.name);
        const displayPath = prefix + entry.name;

        if (entry.isDirectory()) {
          structure.push(displayPath + '/');
          const subStructure = await this.getFileStructure(
            fullPath,
            maxDepth,
            currentDepth + 1,
            displayPath + '/',
          );
          structure.push(...subStructure);
        } else {
          structure.push(displayPath);
        }
      }
    } catch (error) {
      this.logger.error(`Error reading directory ${dirPath}:`, error);
    }

    return structure;
  }

  /**
   * Check if repository has test files
   */
  private async hasTestFiles(
    repositoryPath: string,
    depth = 0,
  ): Promise<boolean> {
    if (depth >= RepositoryAnalysisService.MAX_RECURSION_DEPTH) {
      return false;
    }

    try {
      const entries = await fs.readdir(repositoryPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }

        // Check if name matches any pattern
        const matchesPattern = RepositoryAnalysisService.TEST_PATTERNS.some(
          (pattern) => entry.name.includes(pattern),
        );
        const matchesRegex = RepositoryAnalysisService.TEST_PATTERN_REGEXES.some(
          (regex) => entry.name.match(regex),
        );

        if (matchesPattern || matchesRegex) {
          return true;
        }

        // Check subdirectories with depth limit
        if (entry.isDirectory()) {
          const subPath = path.join(repositoryPath, entry.name);
          if (await this.hasTestFiles(subPath, depth + 1)) {
            return true;
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Error checking for test files in ${repositoryPath}:`,
        error,
      );
    }

    return false;
  }

  /**
   * Detect primary programming languages
   */
  private async detectLanguages(repositoryPath: string): Promise<string[]> {
    const languages = new Set<string>();
    const extensionMap: Record<string, string> = {
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript',
      '.js': 'JavaScript',
      '.jsx': 'JavaScript',
      '.py': 'Python',
      '.java': 'Java',
      '.go': 'Go',
      '.rs': 'Rust',
      '.rb': 'Ruby',
      '.php': 'PHP',
      '.cs': 'C#',
      '.cpp': 'C++',
      '.c': 'C',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
    };

    try {
      const files = await this.getAllFiles(repositoryPath);

      for (const file of files) {
        const ext = path.extname(file);
        if (extensionMap[ext]) {
          languages.add(extensionMap[ext]);
        }
      }
    } catch (error) {
      this.logger.error('Error detecting languages:', error);
    }

    return Array.from(languages);
  }

  /**
   * Get all files recursively
   */
  private async getAllFiles(dirPath: string, depth = 0): Promise<string[]> {
    const files: string[] = [];

    if (depth >= RepositoryAnalysisService.MAX_RECURSION_DEPTH) {
      return files;
    }

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (
          entry.name.startsWith('.') ||
          entry.name === 'node_modules' ||
          entry.name === 'dist' ||
          entry.name === 'build' ||
          entry.name === '__pycache__' ||
          entry.name === 'venv'
        ) {
          continue;
        }

        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          const subFiles = await this.getAllFiles(fullPath, depth + 1);
          files.push(...subFiles);
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      this.logger.error(`Error reading files in directory ${dirPath}:`, error);
    }

    return files;
  }
}
