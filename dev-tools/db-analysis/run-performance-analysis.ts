/**
 * ===============================================
 * Database Performance Analysis Runner
 * ===============================================
 * Runs EXPLAIN ANALYZE on critical queries and saves results
 *
 * Usage:
 *   npm run perf:baseline        - Run baseline (before indexes)
 *   npm run perf:post-optimization - Run after applying indexes
 *
 * Or directly:
 *   tsx db-performance-analysis/run-performance-analysis.ts baseline
 *   tsx db-performance-analysis/run-performance-analysis.ts post-optimization
 * ===============================================
 */

import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface QueryResult {
  queryName: string;
  description: string;
  planningTime: number;
  executionTime: number;
  totalCost: number;
  rows: number;
  plan: string;
  usesIndex: boolean;
  indexNames: string[];
}

interface TestSampleIds {
  userId: string;
  projectId: string;
  sceneId: string;
  characterId: string;
  shotId: string;
}

/**
 * Get sample IDs from the database for testing
 */
async function getSampleIds(): Promise<TestSampleIds> {
  console.log('Getting sample IDs from database...');

  // Get a random user
  const userResult = await pool.query('SELECT id FROM users LIMIT 1');
  const userId = userResult.rows[0]?.id;

  if (!userId) {
    throw new Error('No users found in database. Please run seed-test-data.ts first.');
  }

  // Get a random project for this user
  const projectResult = await pool.query(
    'SELECT id FROM projects WHERE user_id = $1 LIMIT 1',
    [userId]
  );
  const projectId = projectResult.rows[0]?.id;

  // Get a random scene for this project
  const sceneResult = await pool.query(
    'SELECT id FROM scenes WHERE project_id = $1 LIMIT 1',
    [projectId]
  );
  const sceneId = sceneResult.rows[0]?.id;

  // Get a random character for this project
  const characterResult = await pool.query(
    'SELECT id FROM characters WHERE project_id = $1 LIMIT 1',
    [projectId]
  );
  const characterId = characterResult.rows[0]?.id;

  // Get a random shot for this scene
  const shotResult = await pool.query(
    'SELECT id FROM shots WHERE scene_id = $1 LIMIT 1',
    [sceneId]
  );
  const shotId = shotResult.rows[0]?.id;

  console.log('✓ Sample IDs retrieved');
  console.log(`  User ID: ${userId}`);
  console.log(`  Project ID: ${projectId}`);
  console.log(`  Scene ID: ${sceneId}`);
  console.log(`  Character ID: ${characterId}`);
  console.log(`  Shot ID: ${shotId}`);
  console.log('');

  return { userId, projectId, sceneId, characterId, shotId };
}

/**
 * Run EXPLAIN ANALYZE on a query
 */
async function explainAnalyze(queryName: string, description: string, query: string): Promise<QueryResult> {
  const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, VERBOSE, COSTS, FORMAT JSON) ${query}`;

  const result = await pool.query(explainQuery);
  const plan = result.rows[0]['QUERY PLAN'][0];

  // Extract metrics
  const planningTime = plan['Planning Time'] || 0;
  const executionTime = plan['Execution Time'] || 0;
  const totalCost = plan['Plan']['Total Cost'] || 0;
  const rows = plan['Plan']['Actual Rows'] || 0;

  // Check if query uses indexes
  const planStr = JSON.stringify(plan);
  const usesIndex = planStr.includes('Index Scan') || planStr.includes('Index Only Scan');
  const indexNames: string[] = [];

  // Extract index names
  const indexMatches = planStr.match(/"Index Name": "([^"]+)"/g);
  if (indexMatches) {
    indexMatches.forEach((match) => {
      const name = match.match(/"Index Name": "([^"]+)"/)?.[1];
      if (name && !indexNames.includes(name)) {
        indexNames.push(name);
      }
    });
  }

  return {
    queryName,
    description,
    planningTime,
    executionTime,
    totalCost,
    rows,
    plan: JSON.stringify(plan, null, 2),
    usesIndex,
    indexNames,
  };
}

/**
 * Run all performance tests
 */
async function runPerformanceTests(sampleIds: TestSampleIds): Promise<QueryResult[]> {
  const results: QueryResult[] = [];

  console.log('Running performance tests...');
  console.log('================================================');
  console.log('');

  // Test 1: Get user's projects
  console.log('Test 1/13: Get user\'s projects...');
  results.push(
    await explainAnalyze(
      'get_user_projects',
      'Get all projects for a user ordered by updated_at',
      `SELECT * FROM projects WHERE user_id = '${sampleIds.userId}' ORDER BY updated_at DESC`
    )
  );

  // Test 2: Get project with ownership verification
  console.log('Test 2/13: Get project with ownership verification...');
  results.push(
    await explainAnalyze(
      'get_project_verified',
      'Get project by ID with user ownership verification',
      `SELECT * FROM projects WHERE id = '${sampleIds.projectId}' AND user_id = '${sampleIds.userId}'`
    )
  );

  // Test 3: Get all scenes for a project
  console.log('Test 3/13: Get all scenes for a project...');
  results.push(
    await explainAnalyze(
      'get_project_scenes',
      'Get all scenes for a project ordered by scene_number',
      `SELECT * FROM scenes WHERE project_id = '${sampleIds.projectId}' ORDER BY scene_number`
    )
  );

  // Test 4: Get scenes by status
  console.log('Test 4/13: Get scenes by status...');
  results.push(
    await explainAnalyze(
      'get_scenes_by_status',
      'Get scenes filtered by status within a project',
      `SELECT * FROM scenes WHERE project_id = '${sampleIds.projectId}' AND status = 'in-progress' ORDER BY scene_number`
    )
  );

  // Test 5: Get scene with ownership verification
  console.log('Test 5/13: Get scene with ownership verification...');
  results.push(
    await explainAnalyze(
      'get_scene_verified',
      'Get scene with project ownership verification (JOIN)',
      `SELECT s.*, p.user_id FROM scenes s INNER JOIN projects p ON s.project_id = p.id WHERE s.id = '${sampleIds.sceneId}' AND p.user_id = '${sampleIds.userId}'`
    )
  );

  // Test 6: Get characters for a project
  console.log('Test 6/13: Get characters for a project...');
  results.push(
    await explainAnalyze(
      'get_project_characters',
      'Get all characters for a project',
      `SELECT * FROM characters WHERE project_id = '${sampleIds.projectId}'`
    )
  );

  // Test 7: Search characters by name
  console.log('Test 7/13: Search characters by name...');
  results.push(
    await explainAnalyze(
      'search_characters_by_name',
      'Search characters by name within a project',
      `SELECT * FROM characters WHERE project_id = '${sampleIds.projectId}' AND name ILIKE '%محمد%'`
    )
  );

  // Test 8: Filter characters by consistency status
  console.log('Test 8/13: Filter characters by consistency status...');
  results.push(
    await explainAnalyze(
      'filter_characters_by_status',
      'Filter characters by consistency status',
      `SELECT * FROM characters WHERE project_id = '${sampleIds.projectId}' AND consistency_status = 'warning' ORDER BY appearances DESC`
    )
  );

  // Test 9: Get character with ownership verification
  console.log('Test 9/13: Get character with ownership verification...');
  results.push(
    await explainAnalyze(
      'get_character_verified',
      'Get character with project ownership verification (JOIN)',
      `SELECT c.*, p.user_id FROM characters c INNER JOIN projects p ON c.project_id = p.id WHERE c.id = '${sampleIds.characterId}' AND p.user_id = '${sampleIds.userId}'`
    )
  );

  // Test 10: Get shots for a scene
  console.log('Test 10/13: Get shots for a scene...');
  results.push(
    await explainAnalyze(
      'get_scene_shots',
      'Get all shots for a scene ordered by shot_number',
      `SELECT * FROM shots WHERE scene_id = '${sampleIds.sceneId}' ORDER BY shot_number`
    )
  );

  // Test 11: Filter shots by type
  console.log('Test 11/13: Filter shots by type...');
  results.push(
    await explainAnalyze(
      'filter_shots_by_type',
      'Filter shots by type within a scene',
      `SELECT * FROM shots WHERE scene_id = '${sampleIds.sceneId}' AND shot_type = 'closeup'`
    )
  );

  // Test 12: Get shot with ownership verification (3-table JOIN)
  console.log('Test 12/13: Get shot with ownership verification...');
  results.push(
    await explainAnalyze(
      'get_shot_verified',
      'Get shot with full ownership chain (shots -> scenes -> projects)',
      `SELECT sh.*, s.project_id, p.user_id FROM shots sh INNER JOIN scenes s ON sh.scene_id = s.id INNER JOIN projects p ON s.project_id = p.id WHERE sh.id = '${sampleIds.shotId}' AND p.user_id = '${sampleIds.userId}'`
    )
  );

  // Test 13: Get project summary with counts
  console.log('Test 13/13: Get project summary with counts...');
  results.push(
    await explainAnalyze(
      'get_project_summary',
      'Get project with counts of related entities',
      `SELECT p.*, COUNT(DISTINCT s.id) as scene_count, COUNT(DISTINCT c.id) as character_count, COUNT(DISTINCT sh.id) as shot_count FROM projects p LEFT JOIN scenes s ON p.id = s.project_id LEFT JOIN characters c ON p.id = c.project_id LEFT JOIN shots sh ON s.id = sh.scene_id WHERE p.id = '${sampleIds.projectId}' AND p.user_id = '${sampleIds.userId}' GROUP BY p.id`
    )
  );

  console.log('');
  console.log('✅ All tests completed');
  console.log('');

  return results;
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(results: QueryResult[], phase: string): string {
  const timestamp = new Date().toISOString();

  let report = `# Database Performance Analysis - ${phase === 'baseline' ? 'Before Indexes' : 'After Indexes'}\n\n`;
  report += `**Generated:** ${timestamp}\n\n`;
  report += `**Database:** PostgreSQL\n\n`;
  report += `---\n\n`;

  // Summary table
  report += `## Performance Summary\n\n`;
  report += `| Query | Planning Time (ms) | Execution Time (ms) | Total Time (ms) | Uses Index | Index Names |\n`;
  report += `|-------|-------------------|--------------------|-----------------|-----------|--------------|\n`;

  results.forEach((result) => {
    const totalTime = result.planningTime + result.executionTime;
    const usesIndexIcon = result.usesIndex ? '✅' : '❌';
    const indexNames = result.indexNames.length > 0 ? result.indexNames.join(', ') : 'N/A';

    report += `| ${result.queryName} | ${result.planningTime.toFixed(3)} | ${result.executionTime.toFixed(3)} | ${totalTime.toFixed(3)} | ${usesIndexIcon} | ${indexNames} |\n`;
  });

  report += `\n---\n\n`;

  // Detailed results
  report += `## Detailed Results\n\n`;

  results.forEach((result, index) => {
    report += `### ${index + 1}. ${result.queryName}\n\n`;
    report += `**Description:** ${result.description}\n\n`;
    report += `**Metrics:**\n`;
    report += `- Planning Time: ${result.planningTime.toFixed(3)}ms\n`;
    report += `- Execution Time: ${result.executionTime.toFixed(3)}ms\n`;
    report += `- Total Cost: ${result.totalCost.toFixed(2)}\n`;
    report += `- Rows Returned: ${result.rows}\n`;
    report += `- Uses Index: ${result.usesIndex ? 'Yes ✅' : 'No ❌'}\n`;
    if (result.indexNames.length > 0) {
      report += `- Index Names: ${result.indexNames.join(', ')}\n`;
    }
    report += `\n`;
    report += `<details>\n`;
    report += `<summary>View Query Plan</summary>\n\n`;
    report += `\`\`\`json\n${result.plan}\n\`\`\`\n\n`;
    report += `</details>\n\n`;
    report += `---\n\n`;
  });

  return report;
}

/**
 * Main function
 */
async function main() {
  const phase = process.argv[2] || 'baseline';

  if (!['baseline', 'post-optimization'].includes(phase)) {
    console.error('Usage: tsx run-performance-analysis.ts [baseline|post-optimization]');
    process.exit(1);
  }

  console.log('================================================');
  console.log(`Database Performance Analysis - ${phase.toUpperCase()}`);
  console.log('================================================');
  console.log('');

  try {
    // Get sample IDs
    const sampleIds = await getSampleIds();

    // Run tests
    const results = await runPerformanceTests(sampleIds);

    // Generate report
    const report = generateMarkdownReport(results, phase);

    // Save report
    const filename = `performance-${phase}-${Date.now()}.md`;
    const filepath = path.join(__dirname, filename);
    fs.writeFileSync(filepath, report);

    console.log('================================================');
    console.log('Report Generated');
    console.log('================================================');
    console.log(`📄 Report saved to: ${filepath}`);
    console.log('');

    // Print summary
    console.log('Performance Summary:');
    console.log('-------------------');
    results.forEach((result) => {
      const totalTime = result.planningTime + result.executionTime;
      const icon = result.usesIndex ? '✅' : '❌';
      console.log(`${icon} ${result.queryName}: ${totalTime.toFixed(3)}ms`);
    });

    console.log('');

  } catch (error) {
    console.error('❌ Error running performance analysis:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the analysis
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
