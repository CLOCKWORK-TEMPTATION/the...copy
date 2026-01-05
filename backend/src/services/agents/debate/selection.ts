/**
 * Agent Selection for Debates
 * اختيار الوكلاء للمناظرة
 * المرحلة 3 - Multi-Agent Debate System
 */

import { BaseAgent } from '../shared/BaseAgent';
import { DebateConfig, DebateParticipant, DebateRole } from './types';
import { TaskType } from '../core/enums';

/**
 * Select debating agents from available agents
 * اختيار الوكلاء المشاركين في المناظرة
 */
export function selectDebatingAgents(
  availableAgents: BaseAgent[],
  config?: Partial<DebateConfig>
): DebateParticipant[] {
  console.log(`[AgentSelection] Selecting agents from ${availableAgents.length} available agents`);

  if (availableAgents.length === 0) {
    throw new Error('لا توجد وكلاء متاحة للمناظرة');
  }

  const maxParticipants = config?.maxParticipants || 5;
  const minParticipants = config?.minParticipants || 2;

  // Select agents and assign roles
  const participants: DebateParticipant[] = [];

  // 1. Balance agent types
  const balancedAgents = balanceAgentTypes(availableAgents, maxParticipants);

  // 2. Avoid redundancy (don't select multiple agents of same type)
  const uniqueAgents = avoidRedundancy(balancedAgents);

  // 3. Assign roles to selected agents
  const agentsWithRoles = assignRoles(uniqueAgents);

  // 4. Ensure minimum participants
  if (agentsWithRoles.length < minParticipants) {
    console.warn(
      `[AgentSelection] Only ${agentsWithRoles.length} agents selected, less than minimum ${minParticipants}`
    );

    // Add more agents if available
    const remainingAgents = availableAgents.filter(
      agent => !agentsWithRoles.some(p => p.agent === agent)
    );

    while (
      agentsWithRoles.length < minParticipants &&
      remainingAgents.length > 0
    ) {
      const agent = remainingAgents.shift()!;
      agentsWithRoles.push({
        agent,
        role: DebateRole.OPPONENT,
        voteWeight: 1.0,
      });
    }
  }

  // 5. Limit to max participants
  const finalParticipants = agentsWithRoles.slice(0, maxParticipants);

  console.log(
    `[AgentSelection] Selected ${finalParticipants.length} agents for debate`
  );

  return finalParticipants;
}

/**
 * Assign roles to agents
 * تعيين الأدوار للوكلاء
 */
export function assignRoles(agents: BaseAgent[]): DebateParticipant[] {
  console.log(`[AgentSelection] Assigning roles to ${agents.length} agents`);

  const participants: DebateParticipant[] = [];

  if (agents.length === 0) {
    return participants;
  }

  // First agent is the proposer
  participants.push({
    agent: agents[0],
    role: DebateRole.PROPOSER,
    voteWeight: 1.0,
  });

  // Second agent is the opponent (if exists)
  if (agents.length > 1) {
    participants.push({
      agent: agents[1],
      role: DebateRole.OPPONENT,
      voteWeight: 1.0,
    });
  }

  // Last agent is the synthesizer (if 3+ agents)
  if (agents.length > 2) {
    participants.push({
      agent: agents[agents.length - 1],
      role: DebateRole.SYNTHESIZER,
      voteWeight: 1.2, // Higher weight for synthesizer
    });

    // Middle agents are additional opponents or moderators
    for (let i = 2; i < agents.length - 1; i++) {
      participants.push({
        agent: agents[i],
        role: i % 2 === 0 ? DebateRole.OPPONENT : DebateRole.MODERATOR,
        voteWeight: 1.0,
      });
    }
  }

  return participants;
}

/**
 * Balance agent types for diversity
 * موازنة أنواع الوكلاء لتحقيق التنوع
 */
export function balanceAgentTypes(
  agents: BaseAgent[],
  maxCount: number
): BaseAgent[] {
  console.log(`[AgentSelection] Balancing agent types (max: ${maxCount})`);

  if (agents.length <= maxCount) {
    return agents;
  }

  // Categorize agents by task type
  const analyticAgents: BaseAgent[] = [];
  const creativeAgents: BaseAgent[] = [];
  const integratedAgents: BaseAgent[] = [];
  const otherAgents: BaseAgent[] = [];

  agents.forEach(agent => {
    const config = agent.getConfig();
    const taskType = config.taskType;

    if (isAnalyticTask(taskType)) {
      analyticAgents.push(agent);
    } else if (isCreativeTask(taskType)) {
      creativeAgents.push(agent);
    } else if (
      taskType === TaskType.INTEGRATED ||
      taskType === TaskType.RECOMMENDATIONS_GENERATOR
    ) {
      integratedAgents.push(agent);
    } else {
      otherAgents.push(agent);
    }
  });

  // Select balanced mix
  const balanced: BaseAgent[] = [];
  const slotsPerCategory = Math.floor(maxCount / 3);

  // Take from each category
  balanced.push(...analyticAgents.slice(0, slotsPerCategory));
  balanced.push(...creativeAgents.slice(0, slotsPerCategory));
  balanced.push(...integratedAgents.slice(0, slotsPerCategory));

  // Fill remaining slots with others
  const remaining = maxCount - balanced.length;
  if (remaining > 0) {
    balanced.push(...otherAgents.slice(0, remaining));
  }

  // If still not enough, add more from any category
  if (balanced.length < maxCount) {
    const allRemaining = [
      ...analyticAgents.slice(slotsPerCategory),
      ...creativeAgents.slice(slotsPerCategory),
      ...integratedAgents.slice(slotsPerCategory),
    ];

    balanced.push(...allRemaining.slice(0, maxCount - balanced.length));
  }

  console.log(`[AgentSelection] Balanced to ${balanced.length} agents`);
  return balanced.slice(0, maxCount);
}

/**
 * Avoid redundancy - select unique agent types
 * تجنب التكرار - اختيار أنواع وكلاء فريدة
 */
export function avoidRedundancy(agents: BaseAgent[]): BaseAgent[] {
  console.log(`[AgentSelection] Removing redundant agents`);

  const seenTaskTypes = new Set<TaskType>();
  const uniqueAgents: BaseAgent[] = [];

  for (const agent of agents) {
    const config = agent.getConfig();
    const taskType = config.taskType;

    // Allow multiple analytic and creative agents, but avoid exact duplicates
    if (!seenTaskTypes.has(taskType)) {
      uniqueAgents.push(agent);
      seenTaskTypes.add(taskType);
    } else {
      // Allow one duplicate for major categories
      if (
        isAnalyticTask(taskType) &&
        uniqueAgents.filter(a => isAnalyticTask(a.getConfig().taskType))
          .length < 2
      ) {
        uniqueAgents.push(agent);
      } else if (
        isCreativeTask(taskType) &&
        uniqueAgents.filter(a => isCreativeTask(a.getConfig().taskType))
          .length < 2
      ) {
        uniqueAgents.push(agent);
      }
    }
  }

  console.log(
    `[AgentSelection] Reduced from ${agents.length} to ${uniqueAgents.length} unique agents`
  );

  return uniqueAgents;
}

/**
 * Select agents by task types
 * اختيار الوكلاء حسب أنواع المهام
 */
export function selectAgentsByTaskTypes(
  agents: BaseAgent[],
  taskTypes: TaskType[]
): BaseAgent[] {
  return agents.filter(agent => {
    const config = agent.getConfig();
    return taskTypes.includes(config.taskType);
  });
}

/**
 * Select most confident agents
 * اختيار الوكلاء الأكثر ثقة
 */
export function selectMostConfidentAgents(
  agents: BaseAgent[],
  count: number
): BaseAgent[] {
  // Note: We can't measure confidence without executing tasks
  // For now, return first N agents
  // In a real implementation, we might use historical confidence scores

  return agents.slice(0, count);
}

/**
 * Create debate participants with custom roles
 * إنشاء مشاركين بأدوار مخصصة
 */
export function createParticipantsWithRoles(
  agentRolePairs: Array<{ agent: BaseAgent; role: DebateRole }>
): DebateParticipant[] {
  return agentRolePairs.map(pair => ({
    agent: pair.agent,
    role: pair.role,
    voteWeight: pair.role === DebateRole.SYNTHESIZER ? 1.2 : 1.0,
  }));
}

// ===== Helper Functions =====

/**
 * Check if task type is analytic
 */
function isAnalyticTask(taskType: TaskType): boolean {
  const analyticTasks = [
    TaskType.ANALYSIS,
    TaskType.CHARACTER_ANALYSIS,
    TaskType.CHARACTER_DEEP_ANALYZER,
    TaskType.PLOT_ANALYSIS,
    TaskType.THEME_ANALYSIS,
    TaskType.DIALOGUE_ANALYSIS,
    TaskType.DIALOGUE_ADVANCED_ANALYZER,
    TaskType.DIALOGUE_FORENSICS,
    TaskType.STRUCTURE_ANALYSIS,
    TaskType.VISUAL_CINEMATIC_ANALYZER,
    TaskType.THEMES_MESSAGES_ANALYZER,
    TaskType.THEMATIC_MINING,
    TaskType.CULTURAL_HISTORICAL_ANALYZER,
    TaskType.PRODUCIBILITY_ANALYZER,
    TaskType.TARGET_AUDIENCE_ANALYZER,
    TaskType.LITERARY_QUALITY_ANALYZER,
  ];

  return analyticTasks.includes(taskType);
}

/**
 * Check if task type is creative
 */
function isCreativeTask(taskType: TaskType): boolean {
  const creativeTasks = [
    TaskType.CREATIVE,
    TaskType.CHARACTER_DEVELOPMENT,
    TaskType.CHARACTER_VOICE,
    TaskType.CHARACTER_NETWORK,
    TaskType.PLOT_DEVELOPMENT,
    TaskType.PLOT_PREDICTOR,
    TaskType.DIALOGUE_ENHANCEMENT,
    TaskType.SCENE_EXPANSION,
    TaskType.SCENE_GENERATOR,
    TaskType.CONFLICT_ENHANCEMENT,
    TaskType.CONFLICT_DYNAMICS,
    TaskType.COMPLETION,
    TaskType.ADAPTIVE_REWRITING,
    TaskType.WORLD_BUILDER,
    TaskType.TENSION_OPTIMIZER,
    TaskType.RHYTHM_MAPPING,
    TaskType.STYLE_FINGERPRINT,
  ];

  return creativeTasks.includes(taskType);
}
