# Database Performance Analysis and Optimization

## Overview

This directory contains comprehensive database performance analysis and optimization work for The Copy application. The analysis focuses on critical query paths for Projects, Scenes, Characters, and Shots entities.

## 🚀 Quick Start

### Prerequisites

```bash
# 1. Make sure PostgreSQL is running (via Docker)
cd /home/user/the-copy/backend
docker-compose up -d postgres

# 2. Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://the_copy_app:your_password@localhost:5432/the_copy"

# 3. Install dependencies
npm install
```

### Running the Full Analysis

```bash
# Step 1: Setup database and seed test data
npm run perf:setup

# Step 2: Run baseline performance tests (BEFORE indexes)
npm run perf:baseline

# Step 3: Apply optimized indexes
npm run perf:apply-indexes

# Step 4: Run post-optimization tests (AFTER indexes)
npm run perf:post-optimization

# Step 5: Compare and generate report
npm run perf:compare
```

## 📁 Files in this Directory

### 1. `baseline-queries.sql`
SQL queries for establishing performance baselines using `EXPLAIN ANALYZE`. This file contains:
- All critical queries from the application
- Index usage analysis queries
- Table statistics queries
- Buffer and I/O analysis

**Usage:**
```bash
# Connect to your database
psql $DATABASE_URL

# Run individual queries from the file
# Replace sample IDs with actual IDs from your database
\i backend/db-performance-analysis/baseline-queries.sql
```

### 2. `optimized-indexes.sql`
Proposed database indexes for performance optimization:
- Composite indexes for ownership verification
- Indexes for JOIN optimization
- Partial indexes for specific use cases
- Performance testing queries
- Rollback plan

**Usage:**
```bash
# To apply indexes (in production, use CONCURRENTLY to avoid locks)
psql $DATABASE_URL -f backend/db-performance-analysis/optimized-indexes.sql
```

### 3. `optimized-queries.sql` (to be created)
Optimized query implementations that replace multiple separate queries with efficient JOINs.

## 📊 Performance Analysis Summary

### Current State (Before Optimization)

#### Identified Issues:

1. **Multiple Query Problem (N+1 Pattern)**
   - Shots operations require 3 separate queries for ownership verification
   - Scenes operations require 2 separate queries for ownership verification
   - Characters operations require 2 separate queries for ownership verification

2. **Missing Composite Indexes**
   - No index on `projects(id, user_id)` for ownership verification
   - No index on `scenes(id, project_id)` for JOIN optimization
   - No index on `characters(id, project_id)` for JOIN optimization
   - No index on `shots(id, scene_id)` for JOIN optimization

3. **Inefficient Query Patterns**
   - Sequential queries instead of JOINs
   - No covering indexes for common SELECT patterns
   - Potential sequential scans on multi-column WHERE clauses

### Critical Query Paths

#### 1. Projects
- **Get user's projects**: `SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC`
- **Verify ownership**: `SELECT * FROM projects WHERE id = ? AND user_id = ?`
- **Frequency**: Very High

#### 2. Scenes
- **Get project's scenes**: `SELECT * FROM scenes WHERE project_id = ? ORDER BY scene_number`
- **Verify ownership**: 2 queries (scenes + projects) → Should be 1 JOIN
- **Frequency**: High

#### 3. Characters
- **Get project's characters**: `SELECT * FROM characters WHERE project_id = ?`
- **Verify ownership**: 2 queries (characters + projects) → Should be 1 JOIN
- **Frequency**: Medium-High

#### 4. Shots
- **Get scene's shots**: `SELECT * FROM shots WHERE scene_id = ? ORDER BY shot_number`
- **Verify ownership**: 3 queries (shots + scenes + projects) → Should be 1 JOIN
- **Frequency**: High

## 🎯 Optimization Strategy

### Phase 1: Index Optimization (COMPLETED)

Added the following indexes to `schema.ts`:

#### Projects Table
```typescript
index('idx_projects_id_user').on(table.id, table.userId)
```
- **Purpose**: Optimize ownership verification queries
- **Impact**: HIGH - Used in almost every operation

#### Scenes Table
```typescript
index('idx_scenes_id_project').on(table.id, table.projectId)
index('idx_scenes_project_status').on(table.projectId, table.status)
```
- **Purpose**: Optimize JOIN operations and status filtering
- **Impact**: MEDIUM-HIGH

#### Characters Table
```typescript
index('idx_characters_id_project').on(table.id, table.projectId)
index('idx_characters_project_name').on(table.projectId, table.name)
index('idx_characters_project_consistency').on(table.projectId, table.consistencyStatus)
```
- **Purpose**: Optimize JOINs, name search, and consistency filtering
- **Impact**: MEDIUM-HIGH

#### Shots Table
```typescript
index('idx_shots_id_scene').on(table.id, table.sceneId)
index('idx_shots_scene_type').on(table.sceneId, table.shotType)
```
- **Purpose**: Optimize multi-table JOINs and type filtering
- **Impact**: MEDIUM-HIGH

### Phase 2: Query Optimization (PENDING)

Replace multiple separate queries with efficient JOINs:

#### Before (Current Implementation):
```typescript
// 3 separate queries
const [shot] = await db.select().from(shots).where(eq(shots.id, id));
const [scene] = await db.select().from(scenes).where(eq(scenes.id, shot.sceneId));
const [project] = await db.select().from(projects).where(eq(projects.id, scene.projectId));
```

#### After (Optimized):
```typescript
// 1 query with JOINs
const [result] = await db
  .select({ shot: shots, scene: scenes, project: projects })
  .from(shots)
  .innerJoin(scenes, eq(shots.sceneId, scenes.id))
  .innerJoin(projects, eq(scenes.projectId, projects.id))
  .where(and(eq(shots.id, id), eq(projects.userId, userId)));
```

### Phase 3: Monitoring and Validation

1. **Run EXPLAIN ANALYZE** on critical queries before and after
2. **Measure improvement** in execution time
3. **Monitor index usage** via `pg_stat_user_indexes`
4. **Track query performance** in production

## 📈 Expected Performance Improvements

Based on the optimization strategy:

| Operation | Current (est.) | Optimized (est.) | Improvement |
|-----------|----------------|------------------|-------------|
| Project ownership check | 10-20ms | 2-5ms | 60-75% |
| Scene with verification | 20-40ms | 5-10ms | 70-80% |
| Character with verification | 20-40ms | 5-10ms | 70-80% |
| Shot with verification | 30-60ms | 8-15ms | 70-80% |
| Project list with counts | 50-100ms | 20-40ms | 50-60% |

**Overall Expected Reduction**: 40-70% in query execution time for critical paths

## 🚀 Implementation Steps

### Step 1: Apply Schema Changes

The schema has been updated in `/home/user/the-copy/backend/src/db/schema.ts`.

To generate and apply migrations:

```bash
cd backend
pnpm drizzle-kit generate
pnpm drizzle-kit push
```

### Step 2: Verify Index Creation

Connect to the database and verify indexes were created:

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('projects', 'scenes', 'characters', 'shots')
ORDER BY tablename, indexname;
```

### Step 3: Run Baseline Measurements

Before optimizing queries, establish baselines:

```bash
psql $DATABASE_URL < backend/db-performance-analysis/baseline-queries.sql
```

Document the results including:
- Planning time
- Execution time
- Rows returned
- Index usage (Seq Scan vs Index Scan)
- Buffer statistics

### Step 4: Optimize Controller Queries

Update controllers to use JOIN queries instead of multiple separate queries.

### Step 5: Measure Improvements

Re-run the same queries and compare results.

### Step 6: Monitor in Production

Use tools like:
- `pg_stat_statements` for query performance tracking
- Application logging for request timing
- Database monitoring for index usage

## 🔄 Rollback Plan

If issues occur after applying optimizations:

### Rollback Indexes

```sql
DROP INDEX CONCURRENTLY IF EXISTS idx_shots_scene_type;
DROP INDEX CONCURRENTLY IF EXISTS idx_shots_id_scene;
DROP INDEX CONCURRENTLY IF EXISTS idx_characters_project_consistency;
DROP INDEX CONCURRENTLY IF EXISTS idx_characters_project_name;
DROP INDEX CONCURRENTLY IF EXISTS idx_characters_id_project;
DROP INDEX CONCURRENTLY IF EXISTS idx_scenes_project_status;
DROP INDEX CONCURRENTLY IF EXISTS idx_scenes_id_project;
DROP INDEX CONCURRENTLY IF EXISTS idx_projects_id_user;
```

### Rollback Query Changes

Simply revert the controller files to previous versions using git:

```bash
git checkout HEAD -- backend/src/controllers/
```

## 📝 Notes

### Index Size Considerations

Each index adds storage overhead and slightly impacts INSERT/UPDATE performance. However:
- Our application is **read-heavy** (many more queries than writes)
- The indexes are on **foreign keys and commonly queried columns**
- The performance gains on reads far outweigh the small write overhead

### CONCURRENTLY Option

When creating indexes in production:
- Use `CREATE INDEX CONCURRENTLY` to avoid table locks
- This allows queries to continue during index creation
- Takes longer but doesn't block other operations

### Monitoring Index Usage

Regularly check if indexes are being used:

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

Indexes with `idx_scan = 0` are not being used and should be reconsidered.

## 🎓 Learning Resources

- [PostgreSQL EXPLAIN Documentation](https://www.postgresql.org/docs/current/using-explain.html)
- [PostgreSQL Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Query Optimization Best Practices](https://www.postgresql.org/docs/current/performance-tips.html)

## 👥 Team Coordination

This work is part of a coordinated 7-agent optimization effort:

- **Agent 1 (This Agent)**: Database & Performance Analysis
- **Agent 2**: Security & Monitoring
- **Agent 3**: Cache & Queue Development
- **Agent 4**: Frontend & Assets Optimization
- **Agent 5**: Real-time Communication
- **Agent 6**: Metrics & Dashboard
- **Agent 7**: Testing & Documentation

All agents are working in separate worktrees to avoid conflicts.

## ✅ Completion Checklist

- [x] Analyze current database schema
- [x] Identify critical query paths
- [x] Create baseline query analysis file
- [x] Design optimized indexes
- [x] Update schema.ts with new indexes
- [ ] Generate database migrations
- [ ] Optimize controller queries to use JOINs
- [ ] Run performance comparison tests
- [ ] Document results and improvements
- [ ] Commit and push changes

---

**Last Updated**: 2025-11-07
**Agent**: Database & Performance Analyst (worktree-1)
**Status**: In Progress
