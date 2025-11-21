# Database Performance Baseline Results

This document contains the baseline performance measurements and optimization results for The Copy database.

## =Ê Overview

This analysis measures the performance impact of database indexes on critical query patterns. The tests use **EXPLAIN ANALYZE** to measure actual execution time and query plan costs.

---

## <¯ Testing Methodology

### Test Environment
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM
- **Test Data Size**:
  - 100 users
  - 500 projects (5 per user)
  - 10,000 scenes (20 per project)
  - 7,500 characters (15 per project)
  - 100,000 shots (10 per scene)

### Metrics Measured
- **Planning Time**: Time PostgreSQL takes to create the query plan
- **Execution Time**: Time to execute the query and return results
- **Total Time**: Planning Time + Execution Time
- **Index Usage**: Whether the query uses indexes or performs sequential scans
- **Query Cost**: PostgreSQL's cost estimation for the query

---

## =Ë Test Queries

The following 13 critical queries were tested:

1. **get_user_projects** - Get all projects for a user (Dashboard)
2. **get_project_verified** - Get project with ownership verification
3. **get_project_scenes** - Get all scenes for a project
4. **get_scenes_by_status** - Filter scenes by status
5. **get_scene_verified** - Get scene with ownership verification (JOIN)
6. **get_project_characters** - Get all characters for a project
7. **search_characters_by_name** - Search characters by name (ILIKE)
8. **filter_characters_by_status** - Filter characters by consistency status
9. **get_character_verified** - Get character with ownership verification (JOIN)
10. **get_scene_shots** - Get all shots for a scene
11. **filter_shots_by_type** - Filter shots by type
12. **get_shot_verified** - Get shot with full ownership chain (3-table JOIN)
13. **get_project_summary** - Get project with related entity counts

---

## = Baseline Results (Before Optimization)

> **Note**: Run `npm run perf:baseline` to generate actual baseline results.
>
> This will create a timestamped report file: `performance-baseline-{timestamp}.md`

**Expected Performance Issues**:
- Sequential scans on large tables
- Slow JOIN operations without composite indexes
- High execution time for ownership verification queries
- No index usage for filtered queries (status, type)

---

## ¡ Optimization Applied

### Indexes Added

The following indexes were added to optimize query performance:

#### **Projects Table**
```sql
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_user_created ON projects(user_id, created_at DESC);
CREATE INDEX idx_projects_id_user ON projects(id, user_id);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);
```

#### **Scenes Table**
```sql
CREATE INDEX idx_scenes_project_id ON scenes(project_id);
CREATE INDEX idx_scenes_project_number ON scenes(project_id, scene_number);
CREATE INDEX idx_scenes_id_project ON scenes(id, project_id);
CREATE INDEX idx_scenes_project_status ON scenes(project_id, status);
CREATE INDEX idx_scenes_scene_number ON scenes(scene_number);
```

#### **Characters Table**
```sql
CREATE INDEX idx_characters_project_id ON characters(project_id);
CREATE INDEX idx_characters_id_project ON characters(id, project_id);
CREATE INDEX idx_characters_project_name ON characters(project_id, name);
CREATE INDEX idx_characters_project_consistency ON characters(project_id, consistency_status);
CREATE INDEX idx_characters_appearances ON characters(appearances DESC);
```

#### **Shots Table**
```sql
CREATE INDEX idx_shots_scene_id ON shots(scene_id);
CREATE INDEX idx_shots_scene_number ON shots(scene_id, shot_number);
CREATE INDEX idx_shots_id_scene ON shots(id, scene_id);
CREATE INDEX idx_shots_scene_type ON shots(scene_id, shot_type);
CREATE INDEX idx_shots_shot_number ON shots(shot_number);
```

#### **Users Table**
```sql
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

---

## =È Post-Optimization Results

> **Note**: Run `npm run perf:post-optimization` to generate post-optimization results.
>
> This will create a timestamped report file: `performance-post-optimization-{timestamp}.md`

**Expected Improvements**:
- 50-80% reduction in execution time for ownership verification
- 60-90% improvement for JOIN queries
- 70-95% faster filtered queries (status, type)
- 40-60% improvement in ordered queries (scene_number, shot_number)

---

## =Ê Comparison Report

> **Note**: Run `npm run perf:compare` to generate a comparison report.
>
> This will create a detailed comparison: `comparison-{timestamp}.md`

The comparison report includes:
- Side-by-side performance metrics
- Percentage improvements for each query
- Index adoption statistics
- Top 5 performance improvements
- Queries needing attention
- Recommendations for further optimization

---

## <¯ Expected Performance Targets

Based on the database structure and index strategy, we expect:

| Query Type | Target Improvement | Target Execution Time |
|------------|-------------------|----------------------|
| Simple lookups (by ID) | 60-80% | < 5ms |
| Filtered queries | 70-90% | < 10ms |
| JOIN queries (2 tables) | 50-70% | < 15ms |
| Complex JOINs (3+ tables) | 40-60% | < 25ms |
| Aggregation queries | 30-50% | < 50ms |

---

## =' How to Run Performance Analysis

### Prerequisites
```bash
# Make sure PostgreSQL is running
docker-compose up -d postgres

# Set DATABASE_URL
export DATABASE_URL="postgresql://user:password@localhost:5432/the_copy"
```

### Step 1: Setup Database
```bash
cd /home/user/the-copy/backend
npm run perf:setup
```

### Step 2: Run Baseline Tests
```bash
npm run perf:baseline
```

### Step 3: Apply Indexes
```bash
npm run perf:apply-indexes
```

### Step 4: Run Post-Optimization Tests
```bash
npm run perf:post-optimization
```

### Step 5: Compare Results
```bash
npm run perf:compare
```

---

## =Ú Additional Resources

- [PostgreSQL EXPLAIN Documentation](https://www.postgresql.org/docs/current/sql-explain.html)
- [Drizzle ORM Indexes](https://orm.drizzle.team/docs/indexes-constraints)
- [PostgreSQL Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [Query Performance Optimization](https://www.postgresql.org/docs/current/performance-tips.html)

---

## =Ý Notes

- All measurements are performed on a database with realistic test data
- Results may vary based on hardware and database configuration
- Regular ANALYZE should be run to keep statistics up to date
- Monitor index usage in production to identify unused indexes

---

**Last Updated**: 2025-11-07
**Maintained By**: Database Performance Agent (worktree-1)
