/**
 * Frontend Workflow Integration
 * Client-side workflow management and monitoring
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

export type WorkflowPreset = 
  | 'standard'
  | 'fast'
  | 'character'
  | 'creative'
  | 'advanced'
  | 'quick'
  | 'complete';

export interface WorkflowProgress {
  workflowId: string;
  status: 'initialized' | 'running' | 'completed' | 'failed';
  currentStep?: string;
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  progress: number; // 0-100
  estimatedTimeRemaining?: number;
}

export interface WorkflowResult {
  status: string;
  results: Record<string, any>;
  metrics: {
    totalExecutionTime: number;
    avgAgentExecutionTime: number;
    parallelizationEfficiency: number;
    successRate: number;
    confidenceDistribution: {
      min: number;
      max: number;
      avg: number;
      median: number;
    };
  };
}

/**
 * Hook for executing workflows
 */
export function useWorkflow() {
  const [progress, setProgress] = useState<WorkflowProgress | null>(null);

  const executeWorkflow = useMutation({
    mutationFn: async ({
      preset,
      input,
      context,
    }: {
      preset: WorkflowPreset;
      input: string;
      context?: Record<string, any>;
    }) => {
      const response = await fetch('/api/workflow/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset,
          input: { input, context },
        }),
      });

      if (!response.ok) {
        throw new Error('فشل تنفيذ الورك فلو');
      }

      return response.json() as Promise<WorkflowResult>;
    },
    onSuccess: (data) => {
      setProgress({
        workflowId: 'completed',
        status: 'completed',
        totalSteps: 0,
        completedSteps: 0,
        failedSteps: 0,
        progress: 100,
      });
    },
  });

  const reset = useCallback(() => {
    setProgress(null);
  }, []);

  return {
    execute: executeWorkflow.mutate,
    executeAsync: executeWorkflow.mutateAsync,
    result: executeWorkflow.data,
    isLoading: executeWorkflow.isPending,
    error: executeWorkflow.error,
    progress,
    reset,
  };
}

/**
 * Hook for monitoring workflow progress
 */
export function useWorkflowProgress(workflowId: string | null) {
  return useQuery({
    queryKey: ['workflow-progress', workflowId],
    queryFn: async () => {
      if (!workflowId) return null;

      const response = await fetch(`/api/workflow/progress/${workflowId}`);
      if (!response.ok) {
        throw new Error('فشل جلب حالة الورك فلو');
      }

      return response.json() as Promise<WorkflowProgress>;
    },
    enabled: !!workflowId,
    refetchInterval: 1000, // Poll every second
  });
}

/**
 * Hook for getting available workflow presets
 */
export function useWorkflowPresets() {
  return useQuery({
    queryKey: ['workflow-presets'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/presets');
      if (!response.ok) {
        throw new Error('فشل جلب قوالب الورك فلو');
      }

      return response.json() as Promise<
        Array<{
          id: WorkflowPreset;
          name: string;
          description: string;
          estimatedDuration: number;
          agentCount: number;
        }>
      >;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for workflow history
 */
export function useWorkflowHistory() {
  return useQuery({
    queryKey: ['workflow-history'],
    queryFn: async () => {
      const response = await fetch('/api/workflow/history');
      if (!response.ok) {
        throw new Error('فشل جلب سجل الورك فلو');
      }

      return response.json() as Promise<
        Array<{
          id: string;
          preset: WorkflowPreset;
          projectName: string;
          createdAt: string;
          duration: number;
          status: string;
          successRate: number;
        }>
      >;
    },
  });
}

/**
 * Workflow execution helper
 */
export async function executeWorkflowDirect(
  preset: WorkflowPreset,
  input: string,
  context?: Record<string, any>
): Promise<WorkflowResult> {
  const response = await fetch('/api/workflow/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preset,
      input: { input, context },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'فشل تنفيذ الورك فلو');
  }

  return response.json();
}

/**
 * Custom workflow builder client
 */
export class ClientWorkflowBuilder {
  private config: any = {
    steps: [],
  };

  constructor(name: string, description?: string) {
    this.config.name = name;
    this.config.description = description;
  }

  addStep(agentId: string, taskType: string, options?: any) {
    this.config.steps.push({
      agentId,
      taskType,
      ...options,
    });
    return this;
  }

  withConcurrency(max: number) {
    this.config.maxConcurrency = max;
    return this;
  }

  withTimeout(ms: number) {
    this.config.globalTimeout = ms;
    return this;
  }

  async execute(input: string, context?: Record<string, any>) {
    const response = await fetch('/api/workflow/execute-custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: this.config,
        input: { input, context },
      }),
    });

    if (!response.ok) {
      throw new Error('فشل تنفيذ الورك فلو المخصص');
    }

    return response.json() as Promise<WorkflowResult>;
  }
}

/**
 * Create custom workflow builder
 */
export function createClientWorkflow(name: string, description?: string) {
  return new ClientWorkflowBuilder(name, description);
}
