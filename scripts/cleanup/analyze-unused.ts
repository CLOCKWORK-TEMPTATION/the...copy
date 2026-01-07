#!/usr/bin/env tsx

/**
 * أداة تحليل الملفات غير المستخدمة في المشروع
 * Unused Code Analyzer - للكشف عن الملفات والتصديرات غير المستخدمة
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface AnalysisResult {
  timestamp: string;
  unusedFiles: string[];
  unusedExports: string[];
  unusedDependencies: string[];
  circularDependencies: string[];
  unreachableFiles: string[];
}

const CONFIG = {
  frontendPath: join(process.cwd(), 'frontend'),
  backendPath: join(process.cwd(), 'backend'),
  outputPath: join(process.cwd(), 'cleanup-analysis-report.json'),
};

console.log('🔍 بدء تحليل الكود غير المستخدم...\n');

const result: AnalysisResult = {
  timestamp: new Date().toISOString(),
  unusedFiles: [],
  unusedExports: [],
  unusedDependencies: [],
  circularDependencies: [],
  unreachableFiles: [],
};

/**
 * تشغيل Knip للكشف عن الملفات غير المستخدمة
 */
function runKnip(projectPath: string, projectName: string) {
  console.log(`📦 تحليل ${projectName} بـ Knip...`);

  try {
    const output = execSync(
      `npx knip --reporter json --config ${join(projectPath, 'knip.json')}`,
      { cwd: projectPath, encoding: 'utf-8', stdio: 'pipe' }
    );

    const knipResult = JSON.parse(output);

    // جمع الملفات غير المستخدمة
    if (knipResult.files) {
      for (const [path, issues] of Object.entries(knipResult.files)) {
        if (Array.isArray(issues) && issues.length > 0) {
          result.unusedFiles.push(`[${projectName}] ${path}`);
        }
      }
    }

    // جمع التصديرات غير المستخدمة
    if (knipResult.unusedExports) {
      for (const [file, exports] of Object.entries(knipResult.unusedExports)) {
        if (Array.isArray(exports)) {
          exports.forEach((exp: string) => {
            result.unusedExports.push(`[${projectName}] ${file}:${exp}`);
          });
        }
      }
    }

    // جمع الاعتماديات غير المستخدمة
    if (knipResult.unresolved) {
      for (const [file, imports] of Object.entries(knipResult.unresolved)) {
        if (Array.isArray(imports)) {
          imports.forEach((imp: string) => {
            if (!result.unusedDependencies.includes(imp)) {
              result.unusedDependencies.push(`[${projectName}] ${imp}`);
            }
          });
        }
      }
    }

    console.log(`  ✅ تم تحليل ${projectName}`);
  } catch (error: any) {
    // Knip يرجع exit code غير صفر عند وجود مشاكل
    const output = error.stdout || error.stderr || '{}';
    try {
      const knipResult = JSON.parse(output);
      // معالجة النتيجة كما أعلاه
    } catch {
      console.log(`  ⚠️ لم يتم تحليل ${projectName}: ${error.message}`);
    }
  }
}

/**
 * تشغيل dependency-cruiser للكشف عن الملفات المعزولة
 */
function runDependencyCruiser() {
  console.log('\n🔗 تحليل الاعتماديات بـ dependency-cruiser...');

  try {
    const output = execSync(
      `npx depcruise --config .dependency-cruiser.json --output-type json frontend/src backend/src`,
      { cwd: process.cwd(), encoding: 'utf-8', stdio: 'pipe' }
    );

    const depResult = JSON.parse(output);

    // جمع الملفات غير القابلة للوصول
    if (depResult.modules) {
      for (const mod of depResult.modules) {
        if (mod.reachable === false || mod.orphan === true) {
          result.unreachableFiles.push(mod.source);
        }
      }
    }

    // جمع الاعتماديات الدائرية
    if (depResult.summary?.violationCount) {
      const circularOutput = execSync(
        `npx depcruise --config .dependency-cruiser.json --output-type err frontend/src backend/src`,
        { cwd: process.cwd(), encoding: 'utf-8', stdio: 'pipe' }
      );

      if (circularOutput.includes('circular')) {
        const lines = circularOutput.split('\n');
        lines.forEach((line: string) => {
          if (line.includes('circular')) {
            result.circularDependencies.push(line.trim());
          }
        });
      }
    }

    console.log('  ✅ تم تحليل الاعتماديات');
  } catch (error: any) {
    const output = error.stdout || error.stderr || '';
    console.log('  ⚠️ تم تحليل الاعتماديات مع وجود مخالفات');

    // محاولة استخراج المعلومات من الخطأ
    try {
      const depResult = JSON.parse(output);
      if (depResult.modules) {
        for (const mod of depResult.modules) {
          if (mod.reachable === false || mod.orphan === true) {
            result.unreachableFiles.push(mod.source);
          }
        }
      }
    } catch {
      // تجاهل أخطاء التحليل
    }
  }
}

/**
 * تشغيل depcheck للاعتماديات غير المستخدمة
 */
function runDepcheck(projectPath: string, projectName: string) {
  console.log(`\n🔍 تحليل ${projectName} بـ depcheck...`);

  try {
    const output = execSync(
      `npx depcheck --json`,
      { cwd: projectPath, encoding: 'utf-8', stdio: 'pipe' }
    );

    const depcheckResult = JSON.parse(output);

    if (depcheckResult.dependencies) {
      depcheckResult.dependencies.forEach((dep: string) => {
        if (!result.unusedDependencies.includes(`[${projectName}] ${dep}`)) {
          result.unusedDependencies.push(`[${projectName}] ${dep}`);
        }
      });
    }

    if (depcheckResult.devDependencies) {
      depcheckResult.devDependencies.forEach((dep: string) => {
        if (!result.unusedDependencies.includes(`[${projectName}] ${dep}`)) {
          result.unusedDependencies.push(`[${projectName}] ${dep} (dev)`);
        }
      });
    }

    console.log(`  ✅ تم تحليل ${projectName}`);
  } catch (error: any) {
    console.log(`  ⚠️ لم يتم تحليل ${projectName}`);
  }
}

// ==================== التنفيذ ====================

// تحليل Frontend
if (existsSync(CONFIG.frontendPath)) {
  runKnip(CONFIG.frontendPath, 'frontend');
  runDepcheck(CONFIG.frontendPath, 'frontend');
}

// تحليل Backend
if (existsSync(CONFIG.backendPath)) {
  // Backend يحتاج تكوين knip أيضاً
  // runKnip(CONFIG.backendPath, 'backend');
  runDepcheck(CONFIG.backendPath, 'backend');
}

// تحليل الاعتماديات
runDependencyCruiser();

// ==================== التقرير ====================

console.log('\n' + '='.repeat(60));
console.log('📊 تقرير التحليل');
console.log('='.repeat(60));

console.log(`\n📁 الملفات غير المستخدمة: ${result.unusedFiles.length}`);
if (result.unusedFiles.length > 0) {
  result.unusedFiles.slice(0, 10).forEach((file) => console.log(`  - ${file}`));
  if (result.unusedFiles.length > 10) {
    console.log(`  ... و ${result.unusedFiles.length - 10} ملف آخر`);
  }
}

console.log(`\n📤 التصديرات غير المستخدمة: ${result.unusedExports.length}`);
if (result.unusedExports.length > 0) {
  result.unusedExports.slice(0, 10).forEach((exp) => console.log(`  - ${exp}`));
  if (result.unusedExports.length > 10) {
    console.log(`  ... و ${result.unusedExports.length - 10} تصدير آخر`);
  }
}

console.log(`\n📦 الاعتماديات غير المستخدمة: ${result.unusedDependencies.length}`);
if (result.unusedDependencies.length > 0) {
  result.unusedDependencies.slice(0, 10).forEach((dep) => console.log(`  - ${dep}`));
  if (result.unusedDependencies.length > 10) {
    console.log(`  ... و ${result.unusedDependencies.length - 10} اعتمادية أخرى`);
  }
}

console.log(`\n🔗 الملفات المعزولة (غير القابلة للوصول): ${result.unreachableFiles.length}`);
if (result.unreachableFiles.length > 0) {
  result.unreachableFiles.slice(0, 10).forEach((file) => console.log(`  - ${file}`));
  if (result.unreachableFiles.length > 10) {
    console.log(`  ... و ${result.unreachableFiles.length - 10} ملف آخر`);
  }
}

console.log(`\n🔄 الاعتماديات الدائرية: ${result.circularDependencies.length}`);
if (result.circularDependencies.length > 0) {
  result.circularDependencies.forEach((dep) => console.log(`  - ${dep}`));
}

// حفظ التقرير
writeFileSync(CONFIG.outputPath, JSON.stringify(result, null, 2));
console.log(`\n💾 تم حفظ التقرير الكامل في: ${CONFIG.outputPath}`);

console.log('\n✅ انتهى التحليل!');
