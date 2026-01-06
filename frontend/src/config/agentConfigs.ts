/**
 * @file This file centralizes all agent configurations, making them easily accessible throughout the application.
 */

import { ANALYSIS_AGENT_CONFIG } from '../agents/analysis/analysisAgent';
import { CHARACTER_DEEP_ANALYZER_AGENT_CONFIG } from '../agents/analysis/characterDeepAnalyzerAgent';
import { TaskCategory, TaskType } from '../types/types';

// Mock configs for agents we haven't fully implemented yet but are referenced in the UI or list
const CREATIVE_AGENT_CONFIG = {
    id: 'creative',
    name: 'المولد الإبداعي',
    description: 'توليد أفكار إبداعية ومشاهد',
    category: TaskCategory.CREATIVE,
    capabilities: { creativeGeneration: true }
};

const SCENE_GENERATOR_AGENT_CONFIG = {
    id: 'scene-generator',
    name: 'مولد المشاهد',
    description: 'كتابة مشاهد كاملة بناءاً على وصف مختصر',
    category: TaskCategory.CREATIVE,
    capabilities: { creativeGeneration: true }
};

export const AGENT_CONFIGS = Object.freeze([
    ANALYSIS_AGENT_CONFIG,
    CHARACTER_DEEP_ANALYZER_AGENT_CONFIG,
    CREATIVE_AGENT_CONFIG,
    SCENE_GENERATOR_AGENT_CONFIG
]);
