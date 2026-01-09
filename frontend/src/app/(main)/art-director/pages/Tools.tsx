import { useState, useEffect } from 'react';
import { 
  Eye, Languages, DollarSign, Sun, AlertTriangle, FileCheck,
  Palette, MapPin, Recycle, BarChart3, FileText, Play, Loader2,
  Box, Clapperboard, GraduationCap, Cuboid, Video
} from 'lucide-react';
import './Tools.css';

interface Plugin {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  version: string;
}

interface ToolConfig {
  icon: any;
  color: string;
  inputs: { name: string; label: string; type: string; placeholder?: string; options?: { value: string; label: string }[] }[];
  endpoint: string;
  requestType: string;
}

const toolConfigs: Record<string, ToolConfig> = {
  'visual-analyzer': {
    icon: Eye,
    color: '#e94560',
    endpoint: '/api/analyze/visual-consistency',
    requestType: 'analyze',
    inputs: [
      { name: 'sceneId', label: 'رقم المشهد', type: 'text', placeholder: 'مثال: scene-001' },
      { name: 'referenceColors', label: 'الألوان المرجعية', type: 'text', placeholder: 'مثال: #FF5733, #3498DB' },
      { name: 'lightingCondition', label: 'حالة الإضاءة', type: 'select', options: [
        { value: 'daylight', label: 'ضوء النهار' },
        { value: 'sunset', label: 'غروب الشمس' },
        { value: 'night', label: 'ليلي' },
        { value: 'artificial', label: 'إضاءة صناعية' }
      ]}
    ]
  },
  'terminology-translator': {
    icon: Languages,
    color: '#4ade80',
    endpoint: '/api/translate/cinema-terms',
    requestType: 'translate',
    inputs: [
      { name: 'term', label: 'المصطلح', type: 'text', placeholder: 'مثال: Key Light' },
      { name: 'sourceLang', label: 'اللغة المصدر', type: 'select', options: [
        { value: 'en', label: 'الإنجليزية' },
        { value: 'ar', label: 'العربية' }
      ]},
      { name: 'targetLang', label: 'اللغة الهدف', type: 'select', options: [
        { value: 'ar', label: 'العربية' },
        { value: 'en', label: 'الإنجليزية' }
      ]}
    ]
  },
  'budget-optimizer': {
    icon: DollarSign,
    color: '#fbbf24',
    endpoint: '/api/optimize/budget',
    requestType: 'optimize',
    inputs: [
      { name: 'totalBudget', label: 'الميزانية الإجمالية', type: 'number', placeholder: '100000' },
      { name: 'categories', label: 'الفئات (مفصولة بفواصل)', type: 'text', placeholder: 'ديكور, إضاءة, أثاث' },
      { name: 'priority', label: 'الأولوية', type: 'select', options: [
        { value: 'quality', label: 'الجودة' },
        { value: 'cost', label: 'التوفير' },
        { value: 'balanced', label: 'متوازن' }
      ]}
    ]
  },
  'lighting-simulator': {
    icon: Sun,
    color: '#60a5fa',
    endpoint: '/api/simulate/lighting',
    requestType: 'simulate',
    inputs: [
      { name: 'timeOfDay', label: 'وقت اليوم', type: 'select', options: [
        { value: 'dawn', label: 'الفجر' },
        { value: 'morning', label: 'الصباح' },
        { value: 'noon', label: 'الظهر' },
        { value: 'afternoon', label: 'بعد الظهر' },
        { value: 'sunset', label: 'الغروب' },
        { value: 'night', label: 'الليل' }
      ]},
      { name: 'location', label: 'نوع الموقع', type: 'select', options: [
        { value: 'interior', label: 'داخلي' },
        { value: 'exterior', label: 'خارجي' }
      ]},
      { name: 'mood', label: 'المزاج المطلوب', type: 'text', placeholder: 'مثال: درامي، رومانسي' }
    ]
  },
  'risk-analyzer': {
    icon: AlertTriangle,
    color: '#ef4444',
    endpoint: '/api/analyze/risks',
    requestType: 'analyze',
    inputs: [
      { name: 'projectPhase', label: 'مرحلة المشروع', type: 'select', options: [
        { value: 'pre-production', label: 'ما قبل الإنتاج' },
        { value: 'production', label: 'الإنتاج' },
        { value: 'post-production', label: 'ما بعد الإنتاج' }
      ]},
      { name: 'budget', label: 'الميزانية', type: 'number', placeholder: '500000' },
      { name: 'timeline', label: 'الجدول الزمني (أيام)', type: 'number', placeholder: '60' }
    ]
  },
  'production-readiness-report': {
    icon: FileCheck,
    color: '#a78bfa',
    endpoint: '/api/analyze/production-readiness',
    requestType: 'build-prompt',
    inputs: [
      { name: 'projectName', label: 'اسم المشروع', type: 'text', placeholder: 'اسم الفيلم أو المسلسل' },
      { name: 'department', label: 'القسم', type: 'select', options: [
        { value: 'art', label: 'قسم الفن' },
        { value: 'lighting', label: 'الإضاءة' },
        { value: 'props', label: 'الإكسسوارات' },
        { value: 'all', label: 'جميع الأقسام' }
      ]},
      { name: 'checklistType', label: 'نوع القائمة', type: 'select', options: [
        { value: 'full', label: 'كاملة' },
        { value: 'quick', label: 'سريعة' }
      ]}
    ]
  },
  'creative-inspiration': {
    icon: Palette,
    color: '#ec4899',
    endpoint: '/api/inspiration/analyze',
    requestType: 'analyze',
    inputs: [
      { name: 'sceneDescription', label: 'وصف المشهد', type: 'textarea', placeholder: 'صف المشهد بالتفصيل...' },
      { name: 'mood', label: 'المزاج', type: 'select', options: [
        { value: 'romantic', label: 'رومانسي' },
        { value: 'dramatic', label: 'درامي' },
        { value: 'mysterious', label: 'غامض' },
        { value: 'cheerful', label: 'مرح' }
      ]},
      { name: 'era', label: 'الحقبة', type: 'text', placeholder: 'مثال: الثمانينيات' }
    ]
  },
  'location-coordinator': {
    icon: MapPin,
    color: '#14b8a6',
    endpoint: '/api/locations/search',
    requestType: 'search',
    inputs: [
      { name: 'query', label: 'البحث', type: 'text', placeholder: 'ابحث عن موقع...' },
      { name: 'type', label: 'النوع', type: 'select', options: [
        { value: 'interior', label: 'داخلي' },
        { value: 'exterior', label: 'خارجي' },
        { value: 'natural', label: 'طبيعي' },
        { value: 'studio', label: 'استوديو' }
      ]}
    ]
  },
  'set-reusability': {
    icon: Recycle,
    color: '#22c55e',
    endpoint: '/api/sets/reusability',
    requestType: 'analyze',
    inputs: [
      { name: 'setName', label: 'اسم الديكور', type: 'text', placeholder: 'اسم قطعة الديكور' },
      { name: 'condition', label: 'الحالة', type: 'select', options: [
        { value: 'excellent', label: 'ممتاز' },
        { value: 'good', label: 'جيد' },
        { value: 'fair', label: 'مقبول' },
        { value: 'poor', label: 'سيء' }
      ]},
      { name: 'category', label: 'الفئة', type: 'select', options: [
        { value: 'furniture', label: 'أثاث' },
        { value: 'props', label: 'إكسسوارات' },
        { value: 'structural', label: 'هياكل' }
      ]}
    ]
  },
  'productivity-analyzer': {
    icon: BarChart3,
    color: '#f97316',
    endpoint: '/api/analyze/productivity',
    requestType: 'analyze',
    inputs: [
      { name: 'period', label: 'الفترة', type: 'select', options: [
        { value: 'daily', label: 'يومي' },
        { value: 'weekly', label: 'أسبوعي' },
        { value: 'monthly', label: 'شهري' }
      ]},
      { name: 'department', label: 'القسم', type: 'text', placeholder: 'اسم القسم' }
    ]
  },
  'documentation-generator': {
    icon: FileText,
    color: '#8b5cf6',
    endpoint: '/api/documentation/generate',
    requestType: 'generate-book',
    inputs: [
      { name: 'projectName', label: 'اسم المشروع', type: 'text', placeholder: 'اسم الفيلم' },
      { name: 'projectNameAr', label: 'اسم المشروع (عربي)', type: 'text', placeholder: 'الاسم بالعربية' },
      { name: 'director', label: 'المخرج', type: 'text', placeholder: 'اسم المخرج' },
      { name: 'productionCompany', label: 'شركة الإنتاج', type: 'text', placeholder: 'اسم الشركة' }
    ]
  },
  'mr-previz-studio': {
    icon: Box,
    color: '#06b6d4',
    endpoint: '/api/xr/previz/create-scene',
    requestType: 'create-scene',
    inputs: [
      { name: 'name', label: 'اسم المشهد', type: 'text', placeholder: 'مثال: المشهد الافتتاحي' },
      { name: 'description', label: 'الوصف', type: 'textarea', placeholder: 'وصف تفصيلي للمشهد...' },
      { name: 'environment', label: 'البيئة', type: 'select', options: [
        { value: 'indoor', label: 'داخلي' },
        { value: 'outdoor', label: 'خارجي' },
        { value: 'studio', label: 'استوديو' },
        { value: 'virtual', label: 'افتراضي' }
      ]},
      { name: 'width', label: 'العرض (متر)', type: 'number', placeholder: '10' },
      { name: 'height', label: 'الارتفاع (متر)', type: 'number', placeholder: '3' },
      { name: 'depth', label: 'العمق (متر)', type: 'number', placeholder: '10' }
    ]
  },
  'virtual-set-editor': {
    icon: Clapperboard,
    color: '#f43f5e',
    endpoint: '/api/xr/set-editor/create',
    requestType: 'create-set',
    inputs: [
      { name: 'name', label: 'اسم الديكور', type: 'text', placeholder: 'مثال: غرفة المعيشة' },
      { name: 'description', label: 'الوصف', type: 'textarea', placeholder: 'وصف الديكور...' },
      { name: 'realTimeRendering', label: 'عرض فوري', type: 'select', options: [
        { value: 'true', label: 'نعم' },
        { value: 'false', label: 'لا' }
      ]}
    ]
  },
  'cinema-skills-trainer': {
    icon: GraduationCap,
    color: '#10b981',
    endpoint: '/api/training/scenarios',
    requestType: 'list-scenarios',
    inputs: [
      { name: 'category', label: 'الفئة', type: 'select', options: [
        { value: 'all', label: 'جميع السيناريوهات' },
        { value: 'lighting', label: 'الإضاءة' },
        { value: 'camera', label: 'الكاميرا' },
        { value: 'art-direction', label: 'إدارة الفن' },
        { value: 'set-design', label: 'تصميم الديكور' }
      ]},
      { name: 'difficulty', label: 'المستوى', type: 'select', options: [
        { value: 'all', label: 'جميع المستويات' },
        { value: 'beginner', label: 'مبتدئ' },
        { value: 'intermediate', label: 'متوسط' },
        { value: 'advanced', label: 'متقدم' }
      ]}
    ]
  },
  'immersive-concept-art': {
    icon: Cuboid,
    color: '#f59e0b',
    endpoint: '/api/concept-art/create-project',
    requestType: 'create-project',
    inputs: [
      { name: 'name', label: 'اسم المشروع', type: 'text', placeholder: 'مثال: التصميم المفاهيمي للفيلم' },
      { name: 'description', label: 'الوصف', type: 'textarea', placeholder: 'وصف رؤية المشروع...' },
      { name: 'style', label: 'النمط الفني', type: 'select', options: [
        { value: 'realistic', label: 'واقعي' },
        { value: 'stylized', label: 'منمق' },
        { value: 'painterly', label: 'فني' },
        { value: 'sci-fi', label: 'خيال علمي' },
        { value: 'fantasy', label: 'خيالي' }
      ]},
      { name: 'targetPlatform', label: 'المنصة المستهدفة', type: 'select', options: [
        { value: 'vr', label: 'الواقع الافتراضي' },
        { value: 'ar', label: 'الواقع المعزز' },
        { value: 'desktop', label: 'سطح المكتب' }
      ]}
    ]
  },
  'virtual-production-engine': {
    icon: Video,
    color: '#8b5cf6',
    endpoint: '/api/virtual-production/create',
    requestType: 'create-production',
    inputs: [
      { name: 'name', label: 'اسم الإنتاج', type: 'text', placeholder: 'مثال: مشروع LED Wall' },
      { name: 'description', label: 'الوصف', type: 'textarea', placeholder: 'وصف الإنتاج الافتراضي...' },
      { name: 'ledWallWidth', label: 'عرض شاشة LED (متر)', type: 'number', placeholder: '12' },
      { name: 'ledWallHeight', label: 'ارتفاع شاشة LED (متر)', type: 'number', placeholder: '4' },
      { name: 'cameraType', label: 'نوع الكاميرا', type: 'select', options: [
        { value: 'cinema', label: 'سينمائية' },
        { value: 'broadcast', label: 'بث' },
        { value: 'dslr', label: 'DSLR' }
      ]}
    ]
  }
};

function Tools() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/plugins')
      .then(res => res.json())
      .then(data => setPlugins(data.plugins || []))
      .catch(console.error);
  }, []);

  const handleExecute = async () => {
    if (!selectedTool) return;
    
    const config = toolConfigs[selectedTool];
    if (!config) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: 'حدث خطأ في الاتصال' });
    }
    setLoading(false);
  };

  const renderInput = (input: any) => {
    if (input.type === 'select') {
      return (
        <select
          className="input"
          value={formData[input.name] || ''}
          onChange={(e) => setFormData({ ...formData, [input.name]: e.target.value })}
        >
          <option value="">اختر...</option>
          {input.options?.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }
    if (input.type === 'textarea') {
      return (
        <textarea
          className="input"
          placeholder={input.placeholder}
          value={formData[input.name] || ''}
          onChange={(e) => setFormData({ ...formData, [input.name]: e.target.value })}
        />
      );
    }
    return (
      <input
        type={input.type}
        className="input"
        placeholder={input.placeholder}
        value={formData[input.name] || ''}
        onChange={(e) => setFormData({ ...formData, [input.name]: e.target.value })}
      />
    );
  };

  return (
    <div className="tools-page fade-in">
      <header className="page-header">
        <Play size={32} className="header-icon" />
        <div>
          <h1>جميع الأدوات</h1>
          <p>تشغيل واختبار جميع أدوات CineArchitect الـ 16</p>
        </div>
      </header>

      <div className="tools-layout">
        <aside className="tools-sidebar">
          <h3>الأدوات المتاحة ({plugins.length})</h3>
          <div className="tools-list">
            {plugins.map((plugin) => {
              const config = toolConfigs[plugin.id];
              const Icon = config?.icon || Play;
              const color = config?.color || '#e94560';
              
              return (
                <button
                  key={plugin.id}
                  className={`tool-item ${selectedTool === plugin.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedTool(plugin.id);
                    setFormData({});
                    setResult(null);
                  }}
                  style={{ '--tool-color': color } as any}
                >
                  <Icon size={20} style={{ color }} />
                  <div className="tool-info">
                    <span className="tool-name-ar">{plugin.nameAr}</span>
                    <span className="tool-category">{plugin.category}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="tools-main">
          {!selectedTool ? (
            <div className="no-tool-selected">
              <Play size={64} />
              <h2>اختر أداة للبدء</h2>
              <p>اختر أداة من القائمة الجانبية لتشغيلها</p>
            </div>
          ) : (
            <div className="tool-workspace">
              <div className="tool-header">
                {(() => {
                  const plugin = plugins.find(p => p.id === selectedTool);
                  const config = toolConfigs[selectedTool];
                  const Icon = config?.icon || Play;
                  return (
                    <>
                      <Icon size={32} style={{ color: config?.color }} />
                      <div>
                        <h2>{plugin?.nameAr}</h2>
                        <p>{plugin?.name}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="tool-form card">
                <h3>المدخلات</h3>
                <div className="form-grid">
                  {toolConfigs[selectedTool]?.inputs.map((input) => (
                    <div key={input.name} className="form-group">
                      <label>{input.label}</label>
                      {renderInput(input)}
                    </div>
                  ))}
                </div>
                <button 
                  className="btn execute-btn" 
                  onClick={handleExecute}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="spinner" />
                      جاري التنفيذ...
                    </>
                  ) : (
                    <>
                      <Play size={18} />
                      تنفيذ
                    </>
                  )}
                </button>
              </div>

              {result && (
                <div className="tool-result card fade-in">
                  <h3>النتيجة</h3>
                  <div className={`result-status ${result.success ? 'success' : 'error'}`}>
                    {result.success ? 'تم بنجاح' : 'حدث خطأ'}
                  </div>
                  <pre className="result-json">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Tools;
