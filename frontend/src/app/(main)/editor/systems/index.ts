/**
 * System Classes Index
 * Exports all system classes for the screenplay editor.
 */

export { StateManager } from './StateManager';
export { AutoSaveManager } from './AutoSaveManager';
export { AdvancedSearchEngine } from './AdvancedSearchEngine';
export { CollaborationSystem } from './CollaborationSystem';
export { AIWritingAssistant } from './AIWritingAssistant';
export { ProjectManager } from './ProjectManager';
export { VisualPlanningSystem } from './VisualPlanningSystem';

// Type definitions for system configurations
export interface SystemConfig {
  autoSaveInterval?: number;
  aiApiKey?: string;
  aiEndpoint?: string;
}

// Factory function to create all systems
export function createSystems(config: SystemConfig = {}) {
  return {
    stateManager: new StateManager(),
    autoSaveManager: new AutoSaveManager(config.autoSaveInterval),
    searchEngine: new AdvancedSearchEngine(),
    collaborationSystem: new CollaborationSystem(),
    aiAssistant: new AIWritingAssistant({
      apiKey: config.aiApiKey,
      apiEndpoint: config.aiEndpoint,
    }),
    projectManager: new ProjectManager(),
    visualPlanning: new VisualPlanningSystem(),
  };
}
