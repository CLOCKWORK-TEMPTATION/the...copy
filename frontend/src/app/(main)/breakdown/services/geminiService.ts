import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { SceneBreakdown, ScriptSegmentResponse, ScenarioAnalysis } from "../types";
import { analyzeCastEnhanced } from "./castService"; // Note: Fixed import path from previous castBreakdownService to castService if needed, assuming castService exists
import { runAllBreakdownAgents } from "./breakdownAgents";

// ============================================
// CONFIGURATION
// ============================================

const SEGMENTATION_MODEL = 'gemini-3-pro-preview';
const CHAT_MODEL = 'gemini-3-pro-preview';
const SCENARIO_MODEL = 'gemini-3-pro-preview';
const ANALYSIS_MODEL = 'gemini-3-pro-preview';

/**
 * Initialize Google GenAI with API key from environment
 */
const getAI = (): GoogleGenAI => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

const ai = getAI();

// ============================================
// CHAT SESSION
// ============================================

/**
 * Creates a new chat session for the production assistant.
 */
export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: CHAT_MODEL,
    config: {
      systemInstruction: `أنت مساعد ذكي ومتخصص في الإنتاج السينمائي (Proactive Production Co-Pilot).
مهمتك:
- مساعدة المستخدم في استكشاف سيناريوهات 'ماذا لو'
- تحسين الميزانية وتقييم المخاطر
- تحليل السيناريوهات وتقديم نصائح إنتاجية
- كن استباقياً في اقتراح التحسينات

You are a smart film production assistant specialized in:
- 'What if' scenario exploration
- Budget optimization and risk assessment
- Script analysis and production advice
- Be proactive in suggesting improvements`,
    }
  });
};

// ============================================
// SCRIPT SEGMENTATION
// ============================================

/**
 * Segments raw script text into individual scenes.
 */
export const segmentScript = async (scriptText: string): Promise<ScriptSegmentResponse> => {
  const segmentationSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      scenes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            header: { type: Type.STRING, description: "Scene heading/slugline" },
            content: { type: Type.STRING, description: "Full scene content excluding header" }
          },
          required: ["header", "content"]
        }
      }
    },
    required: ["scenes"]
  };

  const prompt = `You are an expert film script supervisor.
Analyze the following script text and break it down into individual scenes.
A scene usually starts with a SCENE HEADING (Slugline) like "INT. ROOM - DAY" or "EXT. STREET - NIGHT" or Arabic equivalents like "مشهد داخلي" or "مشهد خارجي".

Return a JSON object with a "scenes" array where each scene has:
- "header": The scene heading (slugline)
- "content": The full text of the scene (action, dialogue, parentheticals) excluding the header`;

  try {
    const response = await ai.models.generateContent({
      model: SEGMENTATION_MODEL,
      contents: [
        { role: 'user', parts: [{ text: prompt }] },
        { role: 'user', parts: [{ text: `SCRIPT:\n${scriptText}` }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: segmentationSchema
      }
    });

    const result = response.text ? JSON.parse(response.text) : { scenes: [] };
    return result;
  } catch (error) {
    console.error("Error segmenting script:", error);
    throw new Error("Failed to segment script.");
  }
};

// ============================================
// MAIN SCENE ANALYSIS ORCHESTRATOR
// ============================================

/**
 * Main Scene Analysis - Orchestrates Cast and 11 Specialized Technical Agents.
 * 
 * This function triggers:
 * 1. The Cast Agent (Complex character analysis)
 * 2. The Breakdown Orchestrator (Runs 11 specific agents for Props, VFX, etc. in parallel)
 */
export const analyzeScene = async (sceneContent: string): Promise<SceneBreakdown> => {
  try {
    // Run Cast Agent and Technical Agents in parallel
    const [castResult, technicalResult] = await Promise.all([
      analyzeCastEnhanced(sceneContent),
      runAllBreakdownAgents(sceneContent)
    ]);

    // Merge results - convert ExtendedCastMember[] to CastMember[] for the main view
    const simplifiedCast = castResult.members.map(m => ({
      name: m.name,
      role: m.roleCategory,
      age: m.ageRange,
      gender: m.gender,
      description: m.visualDescription,
      motivation: m.motivation
    }));

    return {
      cast: simplifiedCast,
      ...technicalResult
    };

  } catch (error) {
    console.error("Analysis Orchestration Error:", error);
    throw new Error("Failed to complete scene analysis.");
  }
};

// ============================================
// SCENARIO GENERATION (Agent Negotiation)
// ============================================

export interface ScenarioAnalysisOptions {
  includeRecommended?: boolean;
  scenarioCount?: number;
  prioritizeBudget?: boolean;
  prioritizeCreative?: boolean;
  prioritizeSchedule?: boolean;
}

/**
 * THE CORE OF THE CO-PILOT: Agent Negotiation & Scenario Generation.
 * Generates production scenarios through multi-agent optimization.
 */
export const analyzeProductionScenarios = async (
  sceneContent: string,
  options: ScenarioAnalysisOptions = {}
): Promise<ScenarioAnalysis> => {
  const {
    scenarioCount = 3,
    prioritizeBudget = false,
    prioritizeCreative = false,
    prioritizeSchedule = false
  } = options;

  let priorityGuidance = '';
  if (prioritizeBudget) priorityGuidance = ' Prioritize cost savings in all scenarios.';
  if (prioritizeCreative) priorityGuidance = ' Prioritize artistic impact in all scenarios.';
  if (prioritizeSchedule) priorityGuidance = ' Prioritize time efficiency in all scenarios.';

  const prompt = `You are the 'Central Orchestrator Agent' (COA) for a film production AI system.
Your goal is to perform "Agent Negotiation Protocol" to generate production scenarios.

The Negotiating Agents:
1. Budget Agent (BFA): Minimizes cost, finds savings opportunities
2. Creative Agent (CIA): Maximizes artistic impact and visual quality
3. Risk Agent (RAA): Minimizes logistical problems and safety risks
4. Scheduling Agent (SOA): Minimizes shooting time and resource conflicts
5. Logistics Agent (PLA): Handles equipment, locations, and permits

TASK:
1. Identify conflicts in the scene (e.g., Creative wants expensive VFX vs Budget wants to save)
2. Use Multi-Objective Optimization to find "Pareto-optimal" solutions
3. Generate exactly ${scenarioCount} distinct scenarios representing different trade-offs${priorityGuidance}

SCENARIOS TO GENERATE:
1. "Balanced Execution": The negotiated middle ground, acceptable to all agents
2. "Lean & Efficient": Priority to BFA/SOA (Cost/Time savings, some creative compromise)
3. "Visionary Max": Priority to CIA (Maximum Impact, higher cost/risk)

For each scenario, provide:
- metrics: 0-100 scores (higher is better)
  * budget: Cost efficiency (100 = very cheap, 0 = very expensive)
  * schedule: Time efficiency (100 = quick to shoot, 0 = time-consuming)
  * risk: Safety score (100 = very safe, 0 = risky)
  * creative: Artistic quality (100 = high impact, 0 = basic execution)
- agentInsights: Commentary from each agent about their stance
- recommended: true for the recommended scenario (usually Balanced)`;

  const scenarioSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      scenarios: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "Unique scenario identifier" },
            name: { type: Type.STRING, description: "Scenario name" },
            description: { type: Type.STRING, description: "Detailed description of the approach" },
            recommended: { type: Type.BOOLEAN, description: "Whether this is the recommended option" },
            metrics: {
              type: Type.OBJECT,
              properties: {
                budget: { type: Type.NUMBER, description: "Cost efficiency score 0-100" },
                schedule: { type: Type.NUMBER, description: "Time efficiency score 0-100" },
                risk: { type: Type.NUMBER, description: "Safety score 0-100" },
                creative: { type: Type.NUMBER, description: "Artistic quality score 0-100" },
              },
              required: ["budget", "schedule", "risk", "creative"]
            },
            agentInsights: {
              type: Type.OBJECT,
              properties: {
                logistics: { type: Type.STRING, description: "Logistics agent commentary" },
                budget: { type: Type.STRING, description: "Budget agent commentary" },
                schedule: { type: Type.STRING, description: "Schedule agent commentary" },
                creative: { type: Type.STRING, description: "Creative agent commentary" },
                risk: { type: Type.STRING, description: "Risk agent commentary" },
              },
              required: ["logistics", "budget", "schedule", "creative", "risk"]
            }
          },
          required: ["id", "name", "description", "recommended", "metrics", "agentInsights"]
        }
      }
    },
    required: ["scenarios"]
  };

  try {
    const response = await ai.models.generateContent({
      model: SCENARIO_MODEL,
      contents: [
        { role: 'user', parts: [{ text: prompt }] },
        { role: 'user', parts: [{ text: `SCENE TO ANALYZE:\n${sceneContent}` }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: scenarioSchema
      }
    });

    const result = response.text ? JSON.parse(response.text) : { scenarios: [] };
    return result as ScenarioAnalysis;

  } catch (error) {
    console.error("Error analyzing scenarios:", error);
    return { scenarios: [] };
  }
};

// ============================================
// SINGLE AGENT ANALYSIS (Legacy/Ad-hoc)
// ============================================

export interface SingleAgentAnalysis {
  agentKey: string;
  analysis: string[];
  suggestions: string[];
  warnings: string[];
}

/**
 * Run a single agent's detailed analysis on request (e.g., when clicking "Ask Agent")
 */
export const runSingleAgent = async (
  agentKey: string,
  sceneContent: string
): Promise<SingleAgentAnalysis> => {
  const agentDescriptions: Record<string, string> = {
    costumes: "Wardrobe and costume analysis",
    makeup: "Makeup, hair, and special effects makeup",
    graphics: "Screen content and graphics needs",
    vehicles: "Vehicle and transportation analysis",
    locations: "Location scouting and set requirements",
    extras: "Background actors and crowd coordination",
    props: "Props and handheld objects",
    stunts: "Stunt coordination and safety",
    animals: "Animal handling and coordination",
    spfx: "Practical special effects planning",
    vfx: "Visual effects and CGI planning",
    creative: "Creative impact and artistic opportunities",
    budget: "Budget estimation and cost optimization",
    risk: "Risk assessment and safety planning",
    schedule: "Scheduling and time optimization",
    logistics: "Production logistics and coordination"
  };

  const prompt = `You are the ${agentKey.toUpperCase()} Agent for film production.
Your specialty: ${agentDescriptions[agentKey] || agentKey}

Analyze the following scene and provide:
1. analysis: Key findings about your specialty area
2. suggestions: Actionable recommendations
3. warnings: Potential problems to watch for

Return ONLY valid JSON.`;

  const agentSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      analysis: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Key findings from analysis"
      },
      suggestions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Actionable recommendations"
      },
      warnings: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Potential problems and warnings"
      }
    },
    required: ["analysis", "suggestions", "warnings"]
  };

  try {
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: [
        { role: 'user', parts: [{ text: prompt }] },
        { role: 'user', parts: [{ text: `SCENE:\n${sceneContent}` }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: agentSchema
      }
    });

    const result = response.text ? JSON.parse(response.text) : { analysis: [], suggestions: [], warnings: [] };
    return {
      agentKey,
      ...result
    };
  } catch (error) {
    console.error(`Error running ${agentKey} agent:`, error);
    return {
      agentKey,
      analysis: [],
      suggestions: [],
      warnings: []
    };
  }
};