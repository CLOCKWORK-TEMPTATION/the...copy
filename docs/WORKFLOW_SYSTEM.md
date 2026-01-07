# Workflow System Documentation

## Overview

The enhanced Multi-Agent Workflow System provides a robust, type-safe, and flexible framework for orchestrating multiple AI agents in complex drama analysis tasks. This system was built based on recommendations from the GEMINI-3-PRO-REVIEW to improve workflow management, dependency handling, and execution optimization.

## Key Features

### ✅ Type-Safe Workflow Configuration
- Strongly-typed workflow definitions
- Compile-time validation of agent dependencies
- Clear status tracking and error handling

### ✅ Pre-configured Workflows
- 7 ready-to-use workflow presets
- Optimized for different use cases (speed, depth, focus)
- Easy customization and extension

### ✅ Dependency Management
- Automatic dependency resolution
- Configurable confidence thresholds
- Flexible fallback strategies

### ✅ Parallel Execution
- Automatic parallelization where possible
- Configurable concurrency limits
- Optimal resource utilization

### ✅ Advanced Error Handling
- Retry policies with exponential backoff
- Strict vs lenient error handling modes
- Graceful degradation

### ✅ Real-time Monitoring
- Event-driven progress tracking
- Detailed execution metrics
- Performance analytics

## Architecture

```
┌─────────────────────────────────────┐
│   Orchestrator (Enhanced)           │
│  - executeWorkflow()                │
│  - executeCustomWorkflow()          │
└────────────┬────────────────────────┘
             │
             ├──────────────────────────┐
             │                          │
┌────────────▼────────────┐  ┌─────────▼──────────┐
│  Workflow Presets       │  │  Workflow Builder  │
│  - Standard             │  │  - Fluent API      │
│  - Fast                 │  │  - Type-safe       │
│  - Character-focused    │  │  - Flexible        │
│  - Creative             │  └────────┬───────────┘
│  - Advanced             │           │
│  - Quick                │           │
│  - Complete             │           │
└────────────┬────────────┘           │
             │                        │
             └────────┬───────────────┘
                      │
         ┌────────────▼─────────────┐
         │   Workflow Executor      │
         │  - Dependency resolution │
         │  - Parallel execution    │
         │  - Error handling        │
         │  - Progress tracking     │
         └────────────┬─────────────┘
                      │
         ┌────────────▼─────────────┐
         │    Agent Registry        │
         │  - 20+ specialized agents│
         └──────────────────────────┘
```

## Core Components

### 1. Workflow Types (`workflow-types.ts`)

Defines all type-safe interfaces for the workflow system:

- **AgentStatus**: `PENDING | RUNNING | COMPLETED | FAILED | SKIPPED | CANCELLED`
- **WorkflowStatus**: `INITIALIZED | RUNNING | PAUSED | COMPLETED | FAILED | CANCELLED`
- **WorkflowConfig**: Complete workflow configuration
- **WorkflowContext**: Runtime execution context
- **WorkflowMetrics**: Performance and quality metrics

### 2. Workflow Builder (`workflow-builder.ts`)

Fluent API for building custom workflows:

```typescript
const workflow = createWorkflow('My Workflow')
  .addStep(agentId, taskType, options)
  .addDependentStep(agentId, taskType, dependencies)
  .addParallelSteps(steps)
  .withConcurrency(5)
  .withTimeout(300000)
  .withErrorHandling('lenient')
  .build();
```

### 3. Workflow Executor (`workflow-executor.ts`)

Executes workflows with:
- Automatic dependency resolution
- Parallel and sequential execution
- Retry logic with exponential backoff
- Event emission for monitoring
- Comprehensive metrics calculation

### 4. Workflow Presets (`workflow-presets.ts`)

Pre-configured workflows:

| Preset | Description | Agents | Duration | Use Case |
|--------|-------------|--------|----------|----------|
| **standard** | Sequential 7-agent analysis | 7 | ~10 min | Comprehensive analysis |
| **fast** | Parallel quick analysis | 5 | ~5 min | Quick feedback |
| **character** | Deep character analysis | 4 | ~7 min | Character-focused projects |
| **creative** | Creative content generation | 5 | ~8 min | Content creation |
| **advanced** | Specialized modules | 6 | ~12 min | Advanced analysis |
| **quick** | Rapid basic analysis | 3 | ~2 min | Immediate insights |
| **complete** | All available agents | 15+ | ~15 min | Full comprehensive review |

## Usage Guide

### Using Preset Workflows

```typescript
import { multiAgentOrchestrator } from './orchestrator';

const input = {
  input: 'نص السيناريو...',
  context: { projectName: 'مشروع تجريبي' },
};

// Execute standard workflow
const result = await multiAgentOrchestrator.executeWorkflow('standard', input);

console.log('Status:', result.status);
console.log('Success Rate:', result.metrics.successRate);
console.log('Avg Confidence:', result.metrics.confidenceDistribution.avg);
```

### Building Custom Workflows

```typescript
import { createWorkflow } from './core';
import { TaskType } from './core/enums';

const customWorkflow = createWorkflow('Custom Analysis')
  // Step 1: Character analysis
  .addStep('character-deep-analyzer', TaskType.CHARACTER_DEEP_ANALYZER, {
    timeout: 60000,
    retryPolicy: { maxRetries: 3, backoffMs: 2000 },
  })
  
  // Step 2: Dialogue analysis (depends on step 1)
  .addDependentStep(
    'dialogue-advanced-analyzer',
    TaskType.DIALOGUE_ADVANCED_ANALYZER,
    [{ 
      agentId: 'character-deep-analyzer', 
      taskType: TaskType.CHARACTER_DEEP_ANALYZER,
      minConfidence: 0.7 
    }]
  )
  
  // Step 3: Parallel theme and visual analysis
  .addParallelSteps([
    { agentId: 'themes-messages-analyzer', taskType: TaskType.THEMES_MESSAGES_ANALYZER },
    { agentId: 'visual-cinematic-analyzer', taskType: TaskType.VISUAL_CINEMATIC_ANALYZER },
  ])
  
  .withConcurrency(3)
  .withTimeout(180000)
  .withErrorHandling('lenient')
  .build();

const result = await multiAgentOrchestrator.executeCustomWorkflow(customWorkflow, input);
```

### Event Monitoring

```typescript
import { workflowExecutor } from './core';

// Subscribe to events
workflowExecutor.on('step-started', (event) => {
  console.log(`Step started: ${event.stepId}`);
});

workflowExecutor.on('step-completed', (event) => {
  console.log(`Step completed: ${event.stepId}`);
  console.log('Confidence:', event.data?.output?.confidence);
});

workflowExecutor.on('workflow-completed', (event) => {
  console.log('Workflow completed!');
  console.log('Metrics:', event.data?.metrics);
});
```

## Workflow Configuration Options

### Step Options

```typescript
{
  dependencies: AgentDependency[];     // Required dependencies
  parallel: boolean;                   // Run in parallel with others
  timeout: number;                     // Step timeout in ms
  skipOnError: boolean;               // Skip if error occurs
  retryPolicy: {
    maxRetries: number;               // Max retry attempts
    backoffMs: number;                // Backoff between retries
  };
}
```

### Workflow Options

```typescript
{
  maxConcurrency: number;             // Max parallel agents
  globalTimeout: number;              // Total workflow timeout
  errorHandling: 'strict' | 'lenient'; // Error handling strategy
}
```

### Dependency Configuration

```typescript
{
  agentId: string;                    // Agent identifier
  taskType: TaskType;                 // Task type
  required: boolean;                  // Is dependency required?
  minConfidence: number;              // Min confidence threshold
  fallbackBehavior: 'skip' | 'retry' | 'fail'; // Fallback strategy
}
```

## Workflow Metrics

The system provides comprehensive metrics after execution:

```typescript
{
  totalExecutionTime: number;         // Total time in ms
  avgAgentExecutionTime: number;      // Average agent time
  parallelizationEfficiency: number;  // Efficiency ratio
  successRate: number;                // Success percentage
  confidenceDistribution: {
    min: number;                      // Lowest confidence
    max: number;                      // Highest confidence
    avg: number;                      // Average confidence
    median: number;                   // Median confidence
  };
}
```

## Best Practices

### 1. Choose the Right Workflow

- **Quick analysis needed?** → Use `quick` preset
- **Deep character study?** → Use `character` preset  
- **Creating new content?** → Use `creative` preset
- **Full comprehensive review?** → Use `complete` preset

### 2. Optimize Dependencies

- Only specify required dependencies
- Set appropriate confidence thresholds
- Use fallback behaviors wisely

### 3. Balance Parallelism

- Don't exceed `maxConcurrency: 5` for most cases
- Consider memory and API limits
- Use parallel steps for independent tasks only

### 4. Handle Errors Gracefully

- Use `'lenient'` for non-critical workflows
- Use `'strict'` when quality is paramount
- Set `skipOnError: true` for optional steps

### 5. Monitor Performance

- Subscribe to workflow events
- Track execution metrics
- Optimize based on bottlenecks

## Migration Guide

### From Legacy Orchestration

**Before:**
```typescript
const result = await multiAgentOrchestrator.executeAgents({
  fullText: text,
  projectName: name,
  taskTypes: [TaskType.CHARACTER, TaskType.DIALOGUE],
  options: { parallel: true },
});
```

**After:**
```typescript
const result = await multiAgentOrchestrator.executeWorkflow('quick', {
  input: text,
  context: { projectName: name },
});
```

### Benefits of Migration

✅ Type safety and compile-time validation  
✅ Better dependency management  
✅ Improved error handling  
✅ Performance metrics and monitoring  
✅ Reusable workflow configurations  

## Troubleshooting

### Issue: Workflow times out

**Solution:** Increase `globalTimeout` or individual step timeouts:

```typescript
.withTimeout(600000) // 10 minutes
.addStep(agent, type, { timeout: 120000 }) // 2 min per step
```

### Issue: Dependency not met

**Solution:** Check confidence thresholds and fallback behavior:

```typescript
.addDependentStep(agent, type, [{
  agentId: 'prev-agent',
  taskType: TaskType.CHARACTER,
  minConfidence: 0.6, // Lower threshold
  fallbackBehavior: 'skip', // Skip instead of fail
}])
```

### Issue: Low parallelization efficiency

**Solution:** Reduce dependencies and increase parallel steps:

```typescript
.addParallelSteps([...]) // More parallel groups
.withConcurrency(7) // Higher concurrency
```

## Performance Considerations

### Memory Usage
- Each agent uses ~100-200MB
- Limit concurrency based on available memory
- Consider using `quick` or `fast` workflows for limited resources

### API Rate Limits
- Gemini API has rate limits
- Use concurrency limits appropriately
- Implement exponential backoff in retry policies

### Optimization Tips
1. Use parallel execution where possible
2. Set appropriate timeouts
3. Enable caching in agent options
4. Monitor and optimize based on metrics

## Future Enhancements

- [ ] Workflow versioning and migration
- [ ] Workflow templates repository
- [ ] Visual workflow editor
- [ ] A/B testing framework
- [ ] Workflow analytics dashboard
- [ ] Distributed execution support

## Support

For issues, questions, or contributions:
- Check `workflow-examples.ts` for usage examples
- Review agent documentation in respective folders
- Consult team lead for workflow design decisions

---

**Version:** 1.0.0  
**Last Updated:** 2026-01-07  
**Maintainer:** The Copy Development Team
