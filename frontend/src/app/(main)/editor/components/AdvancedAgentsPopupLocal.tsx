/**
 * @component AdvancedAgentsPopupLocal
 * @description A simplified version of AdvancedAgentsPopup that doesn't depend on complex configs.
 * Uses local agent definitions instead of external config files.
 */

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  X, Loader2, Brain, Microscope, Lightbulb, Wrench, BookOpen, Eye, Palette, Scale, Trophy, Flag, Compass, Search, Play,
  MessageSquare, Users, BarChart3, Zap, Database, Globe, Target, Sparkles
} from 'lucide-react';

/**
 * @interface Agent
 * @description Represents an agent with its properties.
 */
interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  capabilities: {
    creativeGeneration: boolean;
    analyticalReasoning: boolean;
    emotionalIntelligence: boolean;
    [key: string]: boolean | string | number;
  };
}

/**
 * @interface AgentResult
 * @description Represents the result of an agent's analysis.
 */
interface AgentResult {
  agentName: string;
  result: string;
  timestamp: Date;
}

/**
 * @interface AdvancedAgentsPopupLocalProps
 */
interface AdvancedAgentsPopupLocalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

// Local agent definitions (simplified - no external dependencies)
const LOCAL_AGENTS: Agent[] = [
  {
    id: 'analysis',
    name: 'تحليل السيناريو',
    description: 'تحليل شامل للسيناريو مع التركيز على الحبكة والشخصيات والحوار',
    category: 'CORE',
    capabilities: {
      creativeGeneration: false,
      analyticalReasoning: true,
      emotionalIntelligence: true
    }
  },
  {
    id: 'creative',
    name: 'الإبداع السينمائي',
    description: 'توليد أفكار إبداعية لمشاهد جديدة وتطوير الشخصيات',
    category: 'CREATIVE',
    capabilities: {
      creativeGeneration: true,
      analyticalReasoning: false,
      emotionalIntelligence: true
    }
  },
  {
    id: 'character-deep-analyzer',
    name: 'تحليل الشخصيات العميق',
    description: 'تحليل عميق للشخصيات وتطورها ودوافعها النفسية',
    category: 'ANALYSIS',
    capabilities: {
      creativeGeneration: false,
      analyticalReasoning: true,
      emotionalIntelligence: true
    }
  },
  {
    id: 'dialogue-analyzer',
    name: 'تحليل الحوار المتقدم',
    description: 'تحليل الحوار من حيث الطبيعية والصدق والتأثير العاطفي',
    category: 'ANALYSIS',
    capabilities: {
      creativeGeneration: false,
      analyticalReasoning: true,
      emotionalIntelligence: true
    }
  },
  {
    id: 'scene-generator',
    name: 'مولد المشاهد',
    description: 'توليد مشاهد جديدة بناءً على السياق الحالي للسيناريو',
    category: 'CREATIVE',
    capabilities: {
      creativeGeneration: true,
      analyticalReasoning: true,
      emotionalIntelligence: false
    }
  },
  {
    id: 'conflict-analyzer',
    name: 'تحليل الصراع',
    description: 'تحليل الصراعات وال tension في السيناريو',
    category: 'ANALYSIS',
    capabilities: {
      creativeGeneration: false,
      analyticalReasoning: true,
      emotionalIntelligence: true
    }
  },
  {
    id: 'visual-analyzer',
    name: 'التحليل السينمائي البصري',
    description: 'تحليل الجوانب البصرية والسينمائية للسيناريو',
    category: 'ANALYSIS',
    capabilities: {
      creativeGeneration: true,
      analyticalReasoning: true,
      emotionalIntelligence: false
    }
  },
  {
    id: 'themes-analyzer',
    name: 'تحليل الثيمات والرسائل',
    description: 'استخراج وتحليل الثيمات والرسائل الأساسية في السيناريو',
    category: 'ANALYSIS',
    capabilities: {
      creativeGeneration: false,
      analyticalReasoning: true,
      emotionalIntelligence: true
    }
  }
];

/**
 * @component AdvancedAgentsPopupLocal
 * @description A simplified agent popup for screenplay analysis.
 */
const AdvancedAgentsPopupLocal: React.FC<AdvancedAgentsPopupLocalProps> = ({ isOpen, onClose, content }) => {
  const [activeTab, setActiveTab] = useState<'agents' | 'results'>('agents');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AgentResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>(LOCAL_AGENTS);

  /**
   * @effect
   * @description Filters agents based on search term.
   */
  useEffect(() => {
    if (searchTerm) {
      const filtered = LOCAL_AGENTS.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAgents(filtered);
    } else {
      setFilteredAgents(LOCAL_AGENTS);
    }
  }, [searchTerm]);

  /**
   * @function runAgentAnalysis
   * @description Runs analysis for a given agent (simulated).
   */
  const runAgentAnalysis = async (agent: Agent) => {
    setSelectedAgent(agent);
    setIsAnalyzing(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      let result = '';
      switch (agent.id) {
        case 'analysis':
          result = `تحليل نقدى شامل للنص:

النقاط الإيجابية:
✓ بنية السرد قوية
✓ الحوار واقعي ومباشر
✓ وصف المشاهد واضح

نقاط للتحسين:
• إضافة المزيد من التفاصيل الحسية
• تطوير الشخصيات الثانوية
• مراجعة الانتقالات

التوصيات:
- إضافة مشهد تحول في منتصف النص
- تطوير خلفية الشخصيات`;
          break;
        case 'creative':
          result = `اقتراحات إبداعية:

1. مشهد إضافي مقترح:
   - إضافة مشهد توتر في منتصف القصة

2. تطوير الشخصية:
   - إضافة خلفية معقدة للشخصية الرئيسية

3. تحسين الحوار:
   - مراجعة بعض العبارات للطبيعية`;
          break;
        case 'character-deep-analyzer':
          result = `تحليل شخصيات عميق:

الشخصية الرئيسية:
- الدوافع: البحث عن الهوية
- الصراعات الداخلية: الخوف مقابل الرغبة
- نقاط القوة: العزيمة
- نقاط الضعف: عدم الثقة

الشخصيات الثانوية:
- تحتاج إلى المزيد من التطوير`;
          break;
        case 'dialogue-analyzer':
          result = `تحليل الحوار:

جودة الحوار:
- الطبيعية: جيدة
- الأصالة: عالية
- التأثير العاطفي: متوسطة

نقاط للتحسين:
- بعض العبارات يمكن أن تكون أكثر طبيعية
- إضافة المزيد من التنوع في أساليب الكلام`;
          break;
        default:
          result = `تحليل من وكيل ${agent.name}:

هذا تحليل تجريبي للنص المقدم. في التطبيق الكامل، سيتم التكامل مع الذكاء الاصطناعي المتقدم.`;
      }

      const newResult: AgentResult = {
        agentName: agent.name,
        result,
        timestamp: new Date()
      };

      setAnalysisResults(prev => [newResult, ...prev]);
      setActiveTab('results');
    } catch (error) {
      console.error('Agent analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * @function getCategoryIcon
   */
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CORE': return <Brain className="w-5 h-5" />;
      case 'ANALYSIS': return <Microscope className="w-5 h-5" />;
      case 'CREATIVE': return <Lightbulb className="w-5 h-5" />;
      default: return <Database className="w-5 h-5" />;
    }
  };

  /**
   * @function getCategoryColor
   */
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CORE': return 'bg-blue-100 text-blue-800';
      case 'ANALYSIS': return 'bg-purple-100 text-purple-800';
      case 'CREATIVE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold flex items-center">
            <Brain className="mr-2" />
            الوكلاء المتقدمة لتحليل السيناريو
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'agents' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setActiveTab('agents')}
          >
            <Wrench className="inline mr-2 w-4 h-4" />
            الوكلاء المتاحة
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'results' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setActiveTab('results')}
          >
            <BarChart3 className="inline mr-2 w-4 h-4" />
            نتائج التحليل
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Agents List */}
          {activeTab === 'agents' && (
            <div className="flex-1 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="البحث عن وكيل..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Agents Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow dark:bg-gray-750"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold flex items-center">
                            {getCategoryIcon(agent.category)}
                            <span className="mr-2">{agent.name}</span>
                          </h3>
                          <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${getCategoryColor(agent.category)}`}>
                            {agent.category}
                          </span>
                        </div>
                        {agent.capabilities.creativeGeneration && (
                          <Lightbulb className="w-5 h-5 text-yellow-500" />
                        )}
                        {agent.capabilities.analyticalReasoning && (
                          <Microscope className="w-5 h-5 text-purple-500" />
                        )}
                      </div>

                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {agent.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {agent.capabilities.creativeGeneration && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">إبداعي</span>
                        )}
                        {agent.capabilities.analyticalReasoning && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">تحليلي</span>
                        )}
                        {agent.capabilities.emotionalIntelligence && (
                          <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">عاطفي</span>
                        )}
                      </div>

                      <button
                        onClick={() => runAgentAnalysis(agent)}
                        disabled={isAnalyzing && selectedAgent?.id === agent.id}
                        className={`mt-4 w-full py-2 px-4 rounded-lg flex items-center justify-center ${
                          isAnalyzing && selectedAgent?.id === agent.id
                            ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {isAnalyzing && selectedAgent?.id === agent.id ? (
                          <>
                            <Loader2 className="animate-spin ml-2 w-4 h-4" />
                            جاري التحليل...
                          </>
                        ) : (
                          <>
                            <Play className="ml-2 w-4 h-4" />
                            تشغيل التحليل
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {activeTab === 'results' && (
            <div className="flex-1 flex flex-col">
              {analysisResults.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                    لم يتم إجراء أي تحليل بعد
                  </h3>
                  <p className="text-gray-400 dark:text-gray-500">
                    اختر وكيلًا من القائمة وقم بتشغيل التحليل لرؤية النتائج هنا
                  </p>
                  <button
                    onClick={() => setActiveTab('agents')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    الذهاب إلى الوكلاء
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {analysisResults.map((result, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 dark:bg-gray-750"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold flex items-center">
                            <Brain className="mr-2 w-4 h-4" />
                            {result.agentName}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {result.timestamp.toLocaleTimeString('ar-EG')}
                          </span>
                        </div>
                        <div className="mt-2 bg-gray-50 dark:bg-gray-700 p-3 rounded whitespace-pre-line text-sm">
                          {result.result}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredAgents.length} وكيل متاح
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAgentsPopupLocal;
