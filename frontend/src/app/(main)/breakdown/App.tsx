import React, { useState, useEffect } from 'react';
import { Clapperboard, FileText, Upload, Sparkles, AlertCircle } from 'lucide-react';
import { MOCK_SCRIPT, AGENTS } from './constants';
import * as geminiService from './services/geminiService';
import { Scene, SceneBreakdown, ScenarioAnalysis, Version } from './types';
import ResultsView from './components/ResultsView';
import ChatBot from './components/ChatBot';

function App() {
  const [scriptText, setScriptText] = useState(MOCK_SCRIPT);
  const [view, setView] = useState<'input' | 'results'>('input');
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleProcessScript = async () => {
    if (!scriptText.trim()) return;
    
    setIsSegmenting(true);
    setError(null);

    try {
      const response = await geminiService.segmentScript(scriptText);
      
      if (!response || !response.scenes || !Array.isArray(response.scenes)) {
        throw new Error('Invalid response format from API. Expected scenes array.');
      }
      
      const formattedScenes: Scene[] = response.scenes.map((s: any, index: number) => {
        if (!s.header || !s.content) {
          throw new Error(`Scene ${index + 1} is missing required fields (header or content).`);
        }
        return {
          id: index + 1,
          header: s.header || '',
          content: s.content || '',
          isAnalyzed: false,
          versions: []
        };
      });

      if (formattedScenes.length === 0) {
        throw new Error('لم يتم اكتشاف أي مشاهد في السيناريو. تأكد من تنسيق السيناريو.');
      }

      setScenes(formattedScenes);
      setView('results');
    } catch (err) {
      console.error('Script processing error:', err);
      const errorMsg = err instanceof Error ? err.message : 'خطأ غير معروف';
      setError(`خطأ: ${errorMsg}`);
    } finally {
      setIsSegmenting(false);
    }
  };

  const handleUpdateScene = (id: number, breakdown: SceneBreakdown | undefined, scenarios?: ScenarioAnalysis) => {
    setScenes(prev => prev.map(scene => {
      if (scene.id === id) {
        const oldVersions = scene.versions || [];
        let newVersions = [...oldVersions];

        // If we have existing data, save it as a version before overwriting
        if (scene.isAnalyzed && (scene.analysis || scene.scenarios)) {
           newVersions.unshift({
             id: Date.now().toString(),
             timestamp: Date.now(),
             label: `نسخة ${oldVersions.length + 1} - ${new Date().toLocaleTimeString('ar-EG')}`,
             analysis: scene.analysis,
             scenarios: scene.scenarios
           });
        }

        return { 
            ...scene, 
            isAnalyzed: !!breakdown || !!scene.analysis, 
            analysis: breakdown || scene.analysis,
            scenarios: scenarios || scene.scenarios,
            versions: newVersions
        };
      }
      return scene;
    }));
  };

  const handleRestoreVersion = (sceneId: number, versionId: string) => {
    setScenes(prev => prev.map(scene => {
      if (scene.id === sceneId && scene.versions) {
        const versionToRestore = scene.versions.find(v => v.id === versionId);
        if (!versionToRestore) return scene;

        // Archive current state before restoring
        const currentVersion: Version = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          label: `نسخة ما قبل الاستعادة (${new Date().toLocaleTimeString('ar-EG')})`,
          analysis: scene.analysis,
          scenarios: scene.scenarios
        };

        const newVersions = [currentVersion, ...scene.versions];

        return {
          ...scene,
          analysis: versionToRestore.analysis,
          scenarios: versionToRestore.scenarios,
          versions: newVersions
        };
      }
      return scene;
    }));
  };

  const handleReset = () => {
    setView('input');
    setScenes([]);
    setError(null);
  };

  // Filter only breakdown agents for the landing page grid
  const previewAgents = AGENTS.filter(a => a.type === 'breakdown').slice(0, 4);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Clapperboard className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 hidden sm:block">
              BreakBreak AI
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             {view === 'results' && (
              <button 
                onClick={handleReset}
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
              >
                تحليل جديد
              </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {view === 'input' ? (
          <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-bold text-white leading-tight">
                نظام تفريغ السيناريو السينمائي <br/>
                <span className="text-blue-500">بالذكاء الاصطناعي</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-xl mx-auto">
                قم بلصق السيناريو الخاص بك، وسيقوم النظام بتقسيمه وتفعيل "مساعد الإنتاج الاستباقي" لتوليد سيناريوهات العمل.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="bg-slate-800 rounded-2xl p-1 shadow-2xl shadow-blue-900/10 border border-slate-700">
              <div className="bg-slate-900 rounded-xl overflow-hidden relative group">
                <textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  placeholder="مشهد داخلي. المطبخ - ليل..."
                  className="w-full h-96 p-6 bg-slate-900 text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-base leading-relaxed"
                  dir="auto"
                />
                
                {/* Visual Hint Overlay */}
                <div className="absolute top-4 left-4 bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-mono text-slate-400 border border-slate-700 pointer-events-none">
                  INT. SCRIPT EDITOR
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleProcessScript}
                disabled={isSegmenting || !scriptText.trim()}
                className={`
                  relative overflow-hidden group
                  bg-gradient-to-r from-blue-600 to-indigo-600 
                  hover:from-blue-500 hover:to-indigo-500
                  text-white px-10 py-4 rounded-full font-bold text-lg
                  shadow-xl shadow-blue-900/30 transition-all transform hover:scale-105
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                `}
              >
                <div className="flex items-center gap-3">
                  {isSegmenting ? (
                    <>
                      <Sparkles className="w-5 h-5 animate-spin" />
                      جاري معالجة السيناريو...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      ابدأ التحليل والتفريغ
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-slate-800">
               {previewAgents.map(agent => (
                 <div key={agent.key} className="flex flex-col items-center gap-2 text-center p-4 bg-slate-800/30 rounded-lg">
                    <div className={`p-2 rounded-full ${agent.color} bg-opacity-20 text-slate-200`}>
                      {agent.icon}
                    </div>
                    <span className="text-xs text-slate-400">{agent.label}</span>
                 </div>
               ))}
            </div>

          </div>
        ) : (
          <ResultsView 
            scenes={scenes} 
            onUpdateScene={handleUpdateScene} 
            onRestoreVersion={handleRestoreVersion}
          />
        )}
        
        {/* ChatBot Overlay */}
        <ChatBot />
      </main>
    </div>
  );
}

export default App;