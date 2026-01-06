// Seven Stations Pipeline Orchestrator
// Coordinates the execution of the Seven Stations AI analysis pipeline

import {
  pipelineExecutor,
  type PipelineStep,
  type PipelineExecution,
} from "./executor";
import type { AnalysisType } from "@/types/enums";
import { pipelineAgentManager } from "@/workers/pipeline-agent-manager";

// Station interface for pipeline execution
interface Station {
  id: string;
  name: string;
  description: string;
  type: string;
  capabilities?: string[];
  estimatedDuration?: number;
}

// Define the Seven Stations
const SEVEN_STATIONS: Station[] = [
  {
    id: "station-1",
    name: "Station 1",
    description: "Text Analysis",
    type: "characters",
  },
  {
    id: "station-2",
    name: "Station 2",
    description: "Conceptual Analysis",
    type: "themes",
  },
  {
    id: "station-3",
    name: "Station 3",
    description: "Network Builder",
    type: "structure",
  },
  {
    id: "station-4",
    name: "Station 4",
    description: "Efficiency Optimizer",
    type: "screenplay",
  },
  {
    id: "station-5",
    name: "Station 5",
    description: "Dynamic Analysis",
    type: "detailed",
  },
  {
    id: "station-6",
    name: "Station 6",
    description: "Diagnostics and Treatment",
    type: "full",
  },
  {
    id: "station-7",
    name: "Station 7",
    description: "Finalization",
    type: "full",
  },
];

function getAllStations(): Station[] {
  return SEVEN_STATIONS;
}

export interface SevenStationsResult {
  stationId: string;
  stationName: string;
  result: any;
  success: boolean;
  duration: number;
}

export interface SevenStationsExecution {
  id: string;
  stations: SevenStationsResult[];
  overallSuccess: boolean;
  totalDuration: number;
  startTime: Date;
  endTime?: Date;
  progress: number;
}

// Seven Stations Orchestrator
export class SevenStationsOrchestrator {
  private activeExecutions = new Map<string, SevenStationsExecution>();
  private useBackgroundAgent = true; // Flag to enable/disable background processing

  // Execute Seven Stations analysis pipeline
  async runSevenStationsPipeline(
    scriptId: string,
    scriptContent: string,
    options: {
      skipStations?: string[];
      priorityStations?: string[];
      timeout?: number;
      useBackgroundAgent?: boolean;
    } = {}
  ): Promise<SevenStationsExecution> {
    const executionId = `seven-stations-${scriptId}-${Date.now()}`;

    const execution: SevenStationsExecution = {
      id: executionId,
      stations: [],
      overallSuccess: false,
      totalDuration: 0,
      startTime: new Date(),
      progress: 0,
    };

    this.activeExecutions.set(executionId, execution);

    try {
      // Get available stations
      const availableStations = getAllStations();

      // Filter stations based on options
      let stationsToRun = availableStations.filter(
        (station: Station) => !options.skipStations?.includes(station.id)
      );

      // Prioritize stations if specified
      if (options.priorityStations) {
        const priority = new Set(options.priorityStations);
        stationsToRun.sort((a: Station, b: Station) => {
          const aPriority = priority.has(a.id) ? 1 : 0;
          const bPriority = priority.has(b.id) ? 1 : 0;
          return bPriority - aPriority;
        });
      }

      // Convert stations to pipeline steps
      const steps: PipelineStep[] = stationsToRun.map((station: Station) => ({
        id: station.id,
        name: station.name,
        description: station.description,
        type: station.type as AnalysisType,
        config: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        timeout: options.timeout || 60000, // 1 minute default
        retries: 2,
      }));

      // Determine if we should use background agent
      const shouldUseBackgroundAgent = 
        options.useBackgroundAgent ?? this.useBackgroundAgent;

      if (shouldUseBackgroundAgent && pipelineAgentManager.isInitialized()) {
        // Delegate to background agent worker
        await this.executeInBackgroundAgent(
          executionId,
          steps,
          { scriptContent, scriptId },
          execution,
          availableStations
        );
      } else {
        // Execute in main thread (fallback)
        await this.executeInMainThread(
          executionId,
          steps,
          { scriptContent, scriptId },
          execution,
          availableStations
        );
      }
    } catch (error) {
      execution.overallSuccess = false;
      execution.endTime = new Date();
      execution.totalDuration = Date.now() - execution.startTime.getTime();
      console.error("Seven Stations pipeline failed");
    }

    return execution;
  }

  /**
   * Execute pipeline in background agent worker
   */
  private async executeInBackgroundAgent(
    executionId: string,
    steps: PipelineStep[],
    inputData: Record<string, any>,
    execution: SevenStationsExecution,
    availableStations: Station[]
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      pipelineAgentManager.executePipeline(
        executionId,
        steps,
        inputData,
        {
          onProgress: (progress, completedSteps, status) => {
            execution.progress = progress;
          },
          onComplete: (results) => {
            // Convert worker results to Seven Stations format
            execution.stations = Object.entries(results).map(([stepId, result]: [string, any]) => {
              const station = availableStations.find((s: Station) => s.id === stepId)!;
              return {
                stationId: stepId,
                stationName: station.name,
                result: result.data,
                success: true,
                duration: result.duration || 0,
              };
            });

            execution.overallSuccess = true;
            execution.totalDuration = Date.now() - execution.startTime.getTime();
            execution.endTime = new Date();
            execution.progress = 100;
            resolve();
          },
          onError: (error) => {
            execution.overallSuccess = false;
            execution.endTime = new Date();
            execution.totalDuration = Date.now() - execution.startTime.getTime();
            console.error("Background agent execution failed:", error);
            reject(new Error(error));
          },
          onCancel: () => {
            execution.overallSuccess = false;
            execution.endTime = new Date();
            execution.totalDuration = Date.now() - execution.startTime.getTime();
            reject(new Error("Execution cancelled"));
          },
        }
      );
    });
  }

  /**
   * Execute pipeline in main thread (fallback)
   */
  private async executeInMainThread(
    executionId: string,
    steps: PipelineStep[],
    inputData: Record<string, any>,
    execution: SevenStationsExecution,
    availableStations: Station[]
  ): Promise<void> {
    const pipelineResult = await pipelineExecutor.executePipeline(
      executionId,
      steps,
      inputData
    );

    // Convert results to Seven Stations format
    execution.stations = Array.from(pipelineResult.results.entries()).map(
      ([stepId, result]) => {
        const station = availableStations.find((s: Station) => s.id === stepId)!;
        return {
          stationId: stepId,
          stationName: station.name,
          result: result.data,
          success: result.success,
          duration: result.duration,
        };
      }
    );

    execution.overallSuccess = pipelineResult.status === "completed";
    execution.totalDuration = pipelineResult.endTime
      ? pipelineResult.endTime.getTime() - pipelineResult.startTime.getTime()
      : Date.now() - execution.startTime.getTime();
    if (pipelineResult.endTime) {
      execution.endTime = pipelineResult.endTime;
    }
    execution.progress = 100;
  }

  // Get station details
  getStationDetails() {
    return getAllStations().map((station: Station) => ({
      id: station.id,
      name: station.name,
      description: station.description,
      type: station.type,
      capabilities: station.capabilities,
      estimatedDuration: station.estimatedDuration,
    }));
  }

  // Get execution status
  getExecution(executionId: string): SevenStationsExecution | undefined {
    return this.activeExecutions.get(executionId);
  }

  // Cancel execution
  cancelExecution(executionId: string): boolean {
    const execution = this.activeExecutions.get(executionId);
    if (execution && !execution.endTime) {
      execution.overallSuccess = false;
      execution.endTime = new Date();
      execution.totalDuration = Date.now() - execution.startTime.getTime();

      // Cancel in background agent if initialized
      if (pipelineAgentManager.isInitialized()) {
        pipelineAgentManager.cancelExecution(executionId);
      }

      // Cancel underlying pipeline executor
      return pipelineExecutor.cancelExecution(executionId);
    }
    return false;
  }

  // Get active executions
  getActiveExecutions(): SevenStationsExecution[] {
    return Array.from(this.activeExecutions.values()).filter(
      (execution) => !execution.endTime
    );
  }

  // Clean up old executions (older than specified hours)
  cleanupOldExecutions(maxAgeHours: number = 24): number {
    const cutoffTime = Date.now() - maxAgeHours * 60 * 60 * 1000;
    let removed = 0;

    for (const [id, execution] of this.activeExecutions.entries()) {
      if (execution.endTime && execution.endTime.getTime() < cutoffTime) {
        this.activeExecutions.delete(id);
        removed++;
      }
    }

    return removed;
  }
}

/**
 * Run pipeline with interfaces
 *
 * PARTIAL IMPLEMENTATION: Basic orchestration exists
 * TODO PRODUCTION: Add comprehensive interface support
 *
 * Missing production features:
 * 1. Interface-based station communication protocol
 * 2. State persistence between stations
 * 3. Rollback/recovery mechanisms
 * 4. Advanced error handling and retry logic
 * 5. Progress tracking and monitoring
 * 6. Resource cleanup on failure
 */
export async function runPipelineWithInterfaces(
  content: string,
  options?: any
): Promise<any> {
  // Current implementation: basic pipeline execution
  // Production TODO: Add interface validation, state management, and monitoring
  const orchestrator = new SevenStationsOrchestrator();
  return orchestrator.runSevenStationsPipeline(
    "default",
    content,
    options || {}
  );
}

// Export singleton instance
export const sevenStationsOrchestrator = new SevenStationsOrchestrator();
