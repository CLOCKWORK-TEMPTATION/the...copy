/**
 * ===============================================
 * Database Performance Analysis - Test Data Generator
 * ===============================================
 * Generates realistic test data for performance testing
 *
 * Usage:
 *   npm run ts-node db-performance-analysis/seed-test-data.ts
 *
 * Or:
 *   tsx db-performance-analysis/seed-test-data.ts
 * ===============================================
 */

import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Configuration
const CONFIG = {
  USERS_COUNT: 100,
  PROJECTS_PER_USER: 5,
  SCENES_PER_PROJECT: 20,
  CHARACTERS_PER_PROJECT: 15,
  SHOTS_PER_SCENE: 10,
};

// Helper functions
function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Sample data
const FIRST_NAMES = ['محمد', 'أحمد', 'علي', 'فاطمة', 'خديجة', 'عائشة', 'حسن', 'حسين', 'سارة', 'مريم'];
const LAST_NAMES = ['العربي', 'المصري', 'السعودي', 'اللبناني', 'السوري', 'الأردني', 'المغربي', 'التونسي'];
const PROJECT_TITLES = ['مسلسل رمضاني', 'فيلم درامي', 'مسلسل كوميدي', 'فيلم أكشن', 'مسلسل تاريخي'];
const SCENE_LOCATIONS = ['غرفة المعيشة', 'المكتب', 'الشارع', 'المطعم', 'المنزل', 'السيارة'];
const TIME_OF_DAY = ['صباحاً', 'ظهراً', 'مساءً', 'ليلاً'];
const CHARACTER_NAMES = ['أحمد', 'محمد', 'فاطمة', 'خالد', 'ليلى', 'عمر', 'زينب', 'ياسر', 'نور', 'سلمى'];
const SHOT_TYPES = ['wide', 'medium', 'closeup', 'extreme-closeup', 'over-shoulder'];
const CAMERA_ANGLES = ['eye-level', 'high', 'low', 'birds-eye', 'dutch'];
const CAMERA_MOVEMENTS = ['static', 'pan', 'tilt', 'zoom', 'dolly', 'steadicam'];
const LIGHTING_TYPES = ['natural', 'three-point', 'high-key', 'low-key', 'silhouette'];
const SCENE_STATUSES = ['planned', 'in-progress', 'filming', 'completed'];
const CONSISTENCY_STATUSES = ['good', 'warning', 'error'];

async function seedDatabase() {
  console.log('================================================');
  console.log('Seeding Test Data');
  console.log('================================================');
  console.log('');

  try {
    // 1. Create users
    console.log('Step 1/5: Creating users...');
    const userIds: string[] = [];

    for (let i = 0; i < CONFIG.USERS_COUNT; i++) {
      const userId = randomUUID();
      const firstName = randomFromArray(FIRST_NAMES);
      const lastName = randomFromArray(LAST_NAMES);
      const email = `user${i}@example.com`;

      await pool.query(
        `INSERT INTO users (id, email, password_hash, first_name, last_name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT (email) DO NOTHING`,
        [userId, email, '$2b$10$dummyhash', firstName, lastName]
      );

      userIds.push(userId);

      if ((i + 1) % 20 === 0) {
        console.log(`  ✓ Created ${i + 1}/${CONFIG.USERS_COUNT} users`);
      }
    }
    console.log(`✅ Created ${CONFIG.USERS_COUNT} users`);
    console.log('');

    // 2. Create projects
    console.log('Step 2/5: Creating projects...');
    const projectIds: { id: string; userId: string }[] = [];

    for (const userId of userIds) {
      for (let i = 0; i < CONFIG.PROJECTS_PER_USER; i++) {
        const projectId = randomUUID();
        const title = `${randomFromArray(PROJECT_TITLES)} ${i + 1}`;

        await pool.query(
          `INSERT INTO projects (id, title, script_content, user_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())`,
          [projectId, title, 'محتوى السيناريو هنا...', userId]
        );

        projectIds.push({ id: projectId, userId });
      }
    }
    console.log(`✅ Created ${projectIds.length} projects`);
    console.log('');

    // 3. Create scenes and characters
    console.log('Step 3/5: Creating scenes and characters...');
    const sceneIds: string[] = [];

    for (const project of projectIds) {
      // Create characters for this project
      const characterIds: string[] = [];
      for (let i = 0; i < CONFIG.CHARACTERS_PER_PROJECT; i++) {
        const characterId = randomUUID();
        const name = randomFromArray(CHARACTER_NAMES);

        await pool.query(
          `INSERT INTO characters (id, project_id, name, appearances, consistency_status, last_seen, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            characterId,
            project.id,
            `${name} ${i + 1}`,
            randomInt(1, 20),
            randomFromArray(CONSISTENCY_STATUSES),
            'المشهد الأخير',
            'ملاحظات على الشخصية'
          ]
        );

        characterIds.push(characterId);
      }

      // Create scenes for this project
      for (let i = 0; i < CONFIG.SCENES_PER_PROJECT; i++) {
        const sceneId = randomUUID();
        const location = randomFromArray(SCENE_LOCATIONS);
        const timeOfDay = randomFromArray(TIME_OF_DAY);
        const sceneCharacters = characterIds.slice(0, randomInt(2, 5));

        await pool.query(
          `INSERT INTO scenes (id, project_id, scene_number, title, location, time_of_day, characters, description, shot_count, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            sceneId,
            project.id,
            i + 1,
            `مشهد ${i + 1}`,
            location,
            timeOfDay,
            JSON.stringify(sceneCharacters),
            'وصف المشهد هنا...',
            CONFIG.SHOTS_PER_SCENE,
            randomFromArray(SCENE_STATUSES)
          ]
        );

        sceneIds.push(sceneId);
      }
    }
    console.log(`✅ Created ${sceneIds.length} scenes and ${CONFIG.CHARACTERS_PER_PROJECT * projectIds.length} characters`);
    console.log('');

    // 4. Create shots
    console.log('Step 4/5: Creating shots...');
    let shotsCreated = 0;

    for (const sceneId of sceneIds) {
      for (let i = 0; i < CONFIG.SHOTS_PER_SCENE; i++) {
        const shotId = randomUUID();

        await pool.query(
          `INSERT INTO shots (id, scene_id, shot_number, shot_type, camera_angle, camera_movement, lighting, ai_suggestion)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            shotId,
            sceneId,
            i + 1,
            randomFromArray(SHOT_TYPES),
            randomFromArray(CAMERA_ANGLES),
            randomFromArray(CAMERA_MOVEMENTS),
            randomFromArray(LIGHTING_TYPES),
            'اقتراح الذكاء الاصطناعي للقطة'
          ]
        );

        shotsCreated++;
      }

      if (shotsCreated % 1000 === 0) {
        console.log(`  ✓ Created ${shotsCreated} shots...`);
      }
    }
    console.log(`✅ Created ${shotsCreated} shots`);
    console.log('');

    // 5. Analyze tables
    console.log('Step 5/5: Analyzing tables...');
    await pool.query('ANALYZE users');
    await pool.query('ANALYZE projects');
    await pool.query('ANALYZE scenes');
    await pool.query('ANALYZE characters');
    await pool.query('ANALYZE shots');
    console.log('✅ Tables analyzed');
    console.log('');

    // Print statistics
    console.log('================================================');
    console.log('Database Statistics');
    console.log('================================================');

    const stats = await pool.query(`
      SELECT
        'users' as table_name, COUNT(*) as row_count FROM users
      UNION ALL
      SELECT 'projects', COUNT(*) FROM projects
      UNION ALL
      SELECT 'scenes', COUNT(*) FROM scenes
      UNION ALL
      SELECT 'characters', COUNT(*) FROM characters
      UNION ALL
      SELECT 'shots', COUNT(*) FROM shots
      ORDER BY table_name
    `);

    console.table(stats.rows);

    console.log('');
    console.log('✅ Test data seeding completed successfully!');
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seeder
seedDatabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
