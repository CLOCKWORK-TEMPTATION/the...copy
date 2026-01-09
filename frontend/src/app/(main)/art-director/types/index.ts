// CineArchitect AI - Core Types
// أنواع البيانات الأساسية

export interface Plugin {
  id: string;
  name: string;
  nameAr: string;
  version: string;
  description: string;
  descriptionAr: string;
  category: PluginCategory;
  initialize(): Promise<void>;
  execute(input: PluginInput): Promise<PluginOutput>;
  shutdown(): Promise<void>;
}

export type PluginCategory =
  | 'ai-analytics'           // أدوات الذكاء الاصطناعي التحليلية
  | 'collaboration'          // أدوات التعاون
  | 'resource-management'    // إدارة الموارد
  | 'xr-immersive'          // الواقع الممتد
  | 'learning'              // التعلم والمعرفة
  | 'sustainability'        // الاستدامة
  | 'documentation'         // التوثيق
  | 'safety'                // الأمان
  | 'marketing';            // التسويق

export interface PluginInput {
  type: string;
  data: Record<string, unknown>;
  options?: Record<string, unknown>;
}

export interface PluginOutput {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  warnings?: string[];
}

export interface Project {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  scenes: Scene[];
  budget: Budget;
  team: TeamMember[];
  locations: Location[];
  assets: Asset[];
}

export interface Scene {
  id: string;
  number: number;
  name: string;
  description: string;
  location: string;
  timeOfDay: 'day' | 'night' | 'dawn' | 'dusk';
  characters: string[];
  props: string[];
  notes: string;
  colorPalette?: ColorPalette;
  lightingSetup?: LightingSetup;
}

export interface ColorPalette {
  primary: string[];
  secondary: string[];
  accent: string[];
  mood: string;
}

export interface LightingSetup {
  type: 'natural' | 'artificial' | 'mixed';
  keyLight?: Light;
  fillLight?: Light;
  backLight?: Light;
  practicals?: Light[];
  notes: string;
}

export interface Light {
  type: string;
  intensity: number;
  colorTemperature: number;
  position: string;
}

export interface Budget {
  total: number;
  currency: string;
  categories: BudgetCategory[];
  spent: number;
  remaining: number;
}

export interface BudgetCategory {
  name: string;
  nameAr: string;
  allocated: number;
  spent: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  roleAr: string;
  department: string;
  email: string;
  phone?: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  type: 'studio' | 'outdoor' | 'interior' | 'exterior';
  availability: DateRange[];
  permits: Permit[];
  photos: string[];
  notes: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface Permit {
  type: string;
  status: 'pending' | 'approved' | 'denied';
  expiresAt?: Date;
}

export interface Asset {
  id: string;
  name: string;
  type: 'prop' | 'costume' | 'set-piece' | 'vehicle' | 'equipment';
  status: 'available' | 'in-use' | 'maintenance' | 'retired';
  location: string;
  photos: string[];
  notes: string;
}

export interface VisualAnalysisResult {
  consistent: boolean;
  issues: VisualIssue[];
  suggestions: string[];
  score: number;
}

export interface VisualIssue {
  type: 'color' | 'lighting' | 'continuity' | 'costume' | 'prop';
  severity: 'low' | 'medium' | 'high';
  description: string;
  descriptionAr: string;
  location: string;
  suggestion: string;
}

export interface TranslationResult {
  original: string;
  translated: string;
  sourceLanguage: string;
  targetLanguage: string;
  context: string;
  alternatives?: string[];
}

export interface RiskAnalysis {
  overallRisk: 'low' | 'medium' | 'high';
  risks: Risk[];
  mitigations: Mitigation[];
  contingencyPlans: ContingencyPlan[];
}

export interface Risk {
  id: string;
  type: 'financial' | 'logistical' | 'weather' | 'safety' | 'legal' | 'technical';
  description: string;
  descriptionAr: string;
  probability: number;
  impact: number;
  score: number;
}

export interface Mitigation {
  riskId: string;
  action: string;
  actionAr: string;
  responsible: string;
  deadline?: Date;
}

export interface ContingencyPlan {
  riskId: string;
  trigger: string;
  actions: string[];
  resources: string[];
}
