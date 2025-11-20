/**
 * ===============================================
 * Database Performance Results Comparator
 * ===============================================
 * Compares baseline and post-optimization results
 *
 * Usage:
 *   npm run perf:compare
 *
 * Or directly:
 *   tsx db-performance-analysis/compare-results.ts <baseline-file> <post-opt-file>
 * ===============================================
 */

import * as fs from 'fs';
import * as path from 'path';

interface ComparisonMetrics {
  queryName: string;
  baselinePlanningTime: number;
  baselineExecutionTime: number;
  baselineTotalTime: number;
  postOptPlanningTime: number;
  postOptExecutionTime: number;
  postOptTotalTime: number;
  improvementPercentage: number;
  baselineUsesIndex: boolean;
  postOptUsesIndex: boolean;
}

/**
 * Parse markdown report to extract metrics
 */
function parseReport(content: string): Map<string, any> {
  const metrics = new Map<string, any>();

  // Extract table rows
  const tableMatch = content.match(/\| Query \| Planning Time[\s\S]*?\n\n/);
  if (!tableMatch) {
    throw new Error('Could not find performance summary table in report');
  }

  const lines = tableMatch[0].split('\n');

  // Skip header and separator lines
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || !line.startsWith('|')) continue;

    const parts = line.split('|').map(p => p.trim()).filter(p => p);
    if (parts.length < 6) continue;

    const queryName = parts[0];
    const planningTime = parseFloat(parts[1]);
    const executionTime = parseFloat(parts[2]);
    const totalTime = parseFloat(parts[3]);
    const usesIndex = parts[4] === '✅';

    metrics.set(queryName, {
      planningTime,
      executionTime,
      totalTime,
      usesIndex,
    });
  }

  return metrics;
}

/**
 * Calculate improvement percentage
 */
function calculateImprovement(baseline: number, postOpt: number): number {
  if (baseline === 0) return 0;
  return ((baseline - postOpt) / baseline) * 100;
}

/**
 * Generate comparison report
 */
function generateComparisonReport(comparisons: ComparisonMetrics[]): string {
  const timestamp = new Date().toISOString();

  let report = `# Database Performance Comparison Report\n\n`;
  report += `**Generated:** ${timestamp}\n\n`;
  report += `---\n\n`;

  // Overall summary
  const avgImprovement =
    comparisons.reduce((sum, c) => sum + c.improvementPercentage, 0) / comparisons.length;
  const improvedQueries = comparisons.filter(c => c.improvementPercentage > 0).length;
  const indexAdoption = comparisons.filter(c => !c.baselineUsesIndex && c.postOptUsesIndex).length;

  report += `## Executive Summary\n\n`;
  report += `- **Total Queries Analyzed:** ${comparisons.length}\n`;
  report += `- **Average Performance Improvement:** ${avgImprovement.toFixed(2)}%\n`;
  report += `- **Queries with Improvement:** ${improvedQueries}/${comparisons.length}\n`;
  report += `- **New Index Adoptions:** ${indexAdoption}\n\n`;

  // Detailed comparison table
  report += `## Detailed Comparison\n\n`;
  report += `| Query | Baseline (ms) | Post-Opt (ms) | Improvement | Index Status |\n`;
  report += `|-------|---------------|---------------|-------------|---------------|\n`;

  comparisons.forEach((comp) => {
    const improvement = comp.improvementPercentage > 0
      ? `✅ ${comp.improvementPercentage.toFixed(2)}%`
      : comp.improvementPercentage < 0
      ? `❌ ${Math.abs(comp.improvementPercentage).toFixed(2)}% slower`
      : '➖ No change';

    const indexStatus = !comp.baselineUsesIndex && comp.postOptUsesIndex
      ? '🆕 Index added'
      : comp.baselineUsesIndex && comp.postOptUsesIndex
      ? '✅ Using index'
      : '❌ No index';

    report += `| ${comp.queryName} | ${comp.baselineTotalTime.toFixed(3)} | ${comp.postOptTotalTime.toFixed(3)} | ${improvement} | ${indexStatus} |\n`;
  });

  report += `\n---\n\n`;

  // Top improvements
  const topImprovements = [...comparisons]
    .filter(c => c.improvementPercentage > 0)
    .sort((a, b) => b.improvementPercentage - a.improvementPercentage)
    .slice(0, 5);

  report += `## Top 5 Performance Improvements\n\n`;
  topImprovements.forEach((comp, index) => {
    report += `${index + 1}. **${comp.queryName}**: ${comp.improvementPercentage.toFixed(2)}% faster\n`;
    report += `   - Before: ${comp.baselineTotalTime.toFixed(3)}ms\n`;
    report += `   - After: ${comp.postOptTotalTime.toFixed(3)}ms\n`;
    report += `   - Saved: ${(comp.baselineTotalTime - comp.postOptTotalTime).toFixed(3)}ms\n\n`;
  });

  // Queries needing attention
  const needsAttention = comparisons.filter(c => c.improvementPercentage < 0);
  if (needsAttention.length > 0) {
    report += `## Queries Needing Attention\n\n`;
    report += `⚠️ The following queries performed worse after optimization:\n\n`;
    needsAttention.forEach((comp) => {
      report += `- **${comp.queryName}**: ${Math.abs(comp.improvementPercentage).toFixed(2)}% slower\n`;
      report += `  - Before: ${comp.baselineTotalTime.toFixed(3)}ms\n`;
      report += `  - After: ${comp.postOptTotalTime.toFixed(3)}ms\n\n`;
    });
  }

  report += `---\n\n`;

  // Recommendations
  report += `## Recommendations\n\n`;

  if (avgImprovement > 40) {
    report += `✅ **Excellent results!** The optimization achieved an average improvement of ${avgImprovement.toFixed(2)}%.\n\n`;
  } else if (avgImprovement > 20) {
    report += `✅ **Good results!** The optimization achieved an average improvement of ${avgImprovement.toFixed(2)}%.\n\n`;
  } else if (avgImprovement > 0) {
    report += `⚠️ **Moderate results.** The optimization achieved an average improvement of ${avgImprovement.toFixed(2)}%. Consider additional optimizations.\n\n`;
  } else {
    report += `❌ **Poor results.** The optimization did not improve performance. Review index strategy.\n\n`;
  }

  if (indexAdoption < comparisons.length / 2) {
    report += `⚠️ Only ${indexAdoption} out of ${comparisons.length} queries are now using indexes. Consider adding more targeted indexes.\n\n`;
  }

  if (needsAttention.length > 0) {
    report += `⚠️ ${needsAttention.length} queries performed worse. Investigate these queries and consider rolling back specific indexes if needed.\n\n`;
  }

  return report;
}

/**
 * Find latest reports in directory
 */
function findLatestReports(dir: string): { baseline: string; postOpt: string } {
  const files = fs.readdirSync(dir);

  const baselineFiles = files
    .filter(f => f.startsWith('performance-baseline-') && f.endsWith('.md'))
    .sort()
    .reverse();

  const postOptFiles = files
    .filter(f => f.startsWith('performance-post-optimization-') && f.endsWith('.md'))
    .sort()
    .reverse();

  if (baselineFiles.length === 0) {
    throw new Error('No baseline report found. Run: npm run perf:baseline');
  }

  if (postOptFiles.length === 0) {
    throw new Error('No post-optimization report found. Run: npm run perf:post-optimization');
  }

  return {
    baseline: path.join(dir, baselineFiles[0]),
    postOpt: path.join(dir, postOptFiles[0]),
  };
}

/**
 * Main function
 */
async function main() {
  console.log('================================================');
  console.log('Database Performance Comparison');
  console.log('================================================');
  console.log('');

  try {
    const analysisDir = path.join(__dirname);

    // Get report files
    let baselineFile: string;
    let postOptFile: string;

    if (process.argv.length >= 4) {
      baselineFile = process.argv[2];
      postOptFile = process.argv[3];
    } else {
      console.log('Finding latest reports...');
      const reports = findLatestReports(analysisDir);
      baselineFile = reports.baseline;
      postOptFile = reports.postOpt;
    }

    console.log(`Baseline report: ${path.basename(baselineFile)}`);
    console.log(`Post-optimization report: ${path.basename(postOptFile)}`);
    console.log('');

    // Read reports
    const baselineContent = fs.readFileSync(baselineFile, 'utf-8');
    const postOptContent = fs.readFileSync(postOptFile, 'utf-8');

    // Parse metrics
    const baselineMetrics = parseReport(baselineContent);
    const postOptMetrics = parseReport(postOptContent);

    // Compare
    const comparisons: ComparisonMetrics[] = [];

    baselineMetrics.forEach((baselineData, queryName) => {
      const postOptData = postOptMetrics.get(queryName);

      if (postOptData) {
        const improvement = calculateImprovement(
          baselineData.totalTime,
          postOptData.totalTime
        );

        comparisons.push({
          queryName,
          baselinePlanningTime: baselineData.planningTime,
          baselineExecutionTime: baselineData.executionTime,
          baselineTotalTime: baselineData.totalTime,
          postOptPlanningTime: postOptData.planningTime,
          postOptExecutionTime: postOptData.executionTime,
          postOptTotalTime: postOptData.totalTime,
          improvementPercentage: improvement,
          baselineUsesIndex: baselineData.usesIndex,
          postOptUsesIndex: postOptData.usesIndex,
        });
      }
    });

    // Generate comparison report
    const report = generateComparisonReport(comparisons);

    // Save report
    const reportFile = path.join(analysisDir, `comparison-${Date.now()}.md`);
    fs.writeFileSync(reportFile, report);

    console.log('================================================');
    console.log('Comparison Report Generated');
    console.log('================================================');
    console.log(`📄 Report saved to: ${reportFile}`);
    console.log('');

    // Print summary
    const avgImprovement =
      comparisons.reduce((sum, c) => sum + c.improvementPercentage, 0) / comparisons.length;

    console.log('Summary:');
    console.log('--------');
    console.log(`Average improvement: ${avgImprovement.toFixed(2)}%`);
    console.log(`Queries analyzed: ${comparisons.length}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error comparing results:', error);
    throw error;
  }
}

// Run the comparison
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
