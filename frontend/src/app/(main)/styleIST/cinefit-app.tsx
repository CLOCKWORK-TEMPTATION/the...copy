'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview المكون الرئيسي لتطبيق CineFit
 * 
 * لماذا هذا التصميم؟
 * - فصل المنطق في Hook مخصص (useCineFitApp)
 * - استخدام الحركات (Framer Motion) لتجربة مستخدم سلسة
 * - تقسيم الواجهة لمكونات فرعية لسهولة الصيانة
 */

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// المكونات
import StartScreen from './components/StartScreen';
import FittingRoom from './components/FittingRoom';
import Header from './components/Header';
import Spinner from './components/Spinner';

// الهوكس والأنواع
import { useCineFitApp } from './hooks';
import type { ProfessionalDesignResult } from './types';

// الأيقونات
import { 
  RotateCcwIcon, 
  ShirtIcon, 
  ChevronRightIcon 
} from './components/icons';

// ==========================================
// ثوابت الحركة
// ==========================================

/** إعدادات حركة الظهور والاختفاء */
const TRANSITION_CONFIG = {
  duration: 0.8,
  ease: [0.16, 1, 0.3, 1] as const,
};

/** إعدادات حركة الصورة */
const IMAGE_TRANSITION = {
  duration: 1.5,
  ease: 'easeOut' as const,
};

// ==========================================
// المكونات الفرعية
// ==========================================

/**
 * بطاقة الوضع الرئيسي
 * 
 * لماذا memo؟
 * - لتجنب إعادة الرسم عند تغيير حالة البطاقة الأخرى
 */
interface ModeCardProps {
  title: string;
  description: string;
  imageUrl: string;
  icon: React.ReactNode;
  accentColor: string;
  buttonText: string;
  onClick: () => void;
  cardNumber?: string;
}

const ModeCard = memo<ModeCardProps>(({
  title,
  description,
  imageUrl,
  icon,
  accentColor,
  buttonText,
  onClick,
  cardNumber,
}) => (
  <button
    onClick={onClick}
    className={`group relative h-[500px] overflow-hidden rounded-sm border border-zinc-800 bg-zinc-900/40 hover:border-${accentColor}/50 transition-all duration-500 hover:shadow-2xl hover:shadow-${accentColor}/10 text-left`}
  >
    {/* خلفية الصورة مع التدرج */}
    <div
      className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0"
      style={{ backgroundImage: `url('${imageUrl}')` }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

    <div className="absolute bottom-0 left-0 p-10 w-full z-20">
      <div className={`w-10 h-10 border border-zinc-600 rounded-full flex items-center justify-center mb-6 group-hover:border-${accentColor} group-hover:bg-${accentColor} group-hover:text-black transition-all`}>
        {cardNumber ? (
          <span className="font-serif italic text-lg">{cardNumber}</span>
        ) : (
          icon
        )}
      </div>
      <h2 className="text-5xl font-serif text-white mb-3 group-hover:translate-x-2 transition-transform duration-500">
        {title}
      </h2>
      <p className="text-zinc-400 font-light max-w-sm text-sm leading-relaxed mb-6 group-hover:text-zinc-200">
        {description}
      </p>
      <div className={`flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-${accentColor} group-hover:text-white transition-colors`}>
        {buttonText}
        <ChevronRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </button>
));

ModeCard.displayName = 'ModeCard';

/**
 * عرض نتيجة التصميم (Lookbook)
 */
interface LookbookViewProps {
  result: ProfessionalDesignResult;
  onMoveToFitting: () => void;
  onStartOver: () => void;
}

const LookbookView = memo<LookbookViewProps>(({
  result,
  onMoveToFitting,
  onStartOver,
}) => (
  <div className="w-full flex-grow flex flex-col lg:flex-row bg-zinc-950">
    {/* الجانب البصري (يسار) */}
    <div className="w-full lg:w-1/2 relative h-[60vh] lg:h-auto overflow-hidden group">
      <motion.img
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={IMAGE_TRANSITION}
        src={result.conceptArtUrl}
        alt="صورة مفهوم الشخصية"
        className="w-full h-full object-cover object-top opacity-90 transition-transform duration-[10s] group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/50 via-transparent to-transparent opacity-50" />

      {/* شارة الطقس */}
      <div className="absolute top-8 right-8 text-right">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1">
          بيانات الموقع
        </p>
        <div className="text-2xl font-serif text-white">
          {result.realWeather.temp > 0 ? `${result.realWeather.temp}°F` : 'غير متاح'}
        </div>
        <div className="text-xs text-[#d4b483] font-medium uppercase tracking-wider">
          {result.realWeather.condition}
        </div>
      </div>

      {/* عنوان التصميم */}
      <div className="absolute bottom-12 left-12 max-w-lg z-20">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-[1px] bg-[#d4b483]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4b483]">
            المفهوم النهائي
          </span>
        </div>
        <h2
          className="text-5xl md:text-7xl font-serif text-white leading-[0.9] mb-4"
          style={{ direction: 'rtl' }}
        >
          {result.lookTitle}
        </h2>

        <button
          onClick={onMoveToFitting}
          className="mt-6 group/btn flex items-center gap-4 pl-0 pr-6 py-3 text-white hover:text-[#d4b483] transition-colors"
        >
          <div className="w-12 h-12 rounded-full border border-white/20 group-hover/btn:border-[#d4b483] flex items-center justify-center backdrop-blur-md transition-all">
            <ShirtIcon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-bold uppercase tracking-widest opacity-50">
              المرحلة التالية
            </span>
            <span className="block text-sm font-serif italic">
              الهندسة وفحص القياس
            </span>
          </div>
        </button>
      </div>
    </div>

    {/* جانب البيانات (يمين) */}
    <div className="w-full lg:w-1/2 p-8 lg:p-20 overflow-y-auto max-h-screen custom-scrollbar relative">
      <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
        <h1 className="text-9xl font-serif text-white">REF</h1>
      </div>

      <div className="space-y-16" style={{ direction: 'rtl' }}>
        {/* السرد الدرامي */}
        <section>
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6 text-left border-b border-zinc-800 pb-2">
            القصد الدرامي
          </h3>
          <p className="text-xl md:text-2xl font-serif text-zinc-200 leading-relaxed pl-10 border-r-2 border-[#d4b483] pr-6">
            "{result.dramaticDescription}"
          </p>
        </section>

        {/* المبررات */}
        <section>
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6 text-left border-b border-zinc-800 pb-2">
            مبررات التصميم
          </h3>
          <ul className="grid grid-cols-1 gap-4">
            {result.rationale.map((point, idx) => (
              <li
                key={idx}
                className="bg-zinc-900/50 p-4 border border-zinc-800/50 rounded flex gap-4 hover:border-zinc-700 transition-colors"
              >
                <span className="text-[#d4b483] mt-1 text-lg">✦</span>
                <span className="text-sm text-zinc-300 font-light leading-relaxed">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* تفكيك الزي */}
          <section>
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6 text-left border-b border-zinc-800 pb-2">
              تفكيك الزي
            </h3>
            <dl className="space-y-4 text-sm">
              {[
                { k: 'ملابس أساسية', v: result.breakdown.basics },
                { k: 'طبقات', v: result.breakdown.layers },
                { k: 'خامات', v: result.breakdown.materials },
                { k: 'ألوان', v: result.breakdown.colorPalette },
              ].map((item, i) => (
                <div key={i} className="group">
                  <dt className="text-xs font-bold text-zinc-500 mb-1">
                    {item.k}
                  </dt>
                  <dd className="text-zinc-200 border-r border-zinc-800 pr-3 group-hover:border-[#d4b483] transition-colors">
                    {item.v}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* ملاحظات الإنتاج */}
          <section>
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6 text-left border-b border-zinc-800 pb-2">
              لوجستيات الإنتاج
            </h3>
            <div className="bg-zinc-900 p-6 rounded-lg space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-xs text-zinc-500">نسخ الاستمرارية</span>
                <span className="font-mono text-[#d4b483]">
                  {result.productionNotes.copies}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-xs text-zinc-500">التعتيق</span>
                <span className="font-mono text-zinc-300">
                  {result.productionNotes.distressing}
                </span>
              </div>
              {result.productionNotes.cameraWarnings && (
                <div className="pt-2">
                  <span className="text-[9px] text-red-500 uppercase font-bold block mb-1">
                    تحذير الكاميرا
                  </span>
                  <p className="text-xs text-zinc-400">
                    {result.productionNotes.cameraWarnings}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* التذييل */}
      <div
        className="mt-20 flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity"
        style={{ direction: 'ltr' }}
      >
        <button
          onClick={onStartOver}
          className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white flex items-center gap-2"
        >
          <RotateCcwIcon className="w-3 h-3" /> إلغاء وإعادة البدء
        </button>
        <span className="text-[9px] font-mono text-zinc-600">
          AI MODEL: GEMINI 3.0 PRO
        </span>
      </div>
    </div>
  </div>
));

LookbookView.displayName = 'LookbookView';

// ==========================================
// المكون الرئيسي
// ==========================================

/**
 * تطبيق CineFit الرئيسي
 * 
 * لماذا هذا الهيكل؟
 * - الحالة مُدارة في Hook منفصل (فصل المخاوف)
 * - المكونات الفرعية مُحسّنة بـ memo
 * - الحركات مركزية ومتسقة
 */
const CineFitApp: React.FC = () => {
  const { state, actions } = useCineFitApp();

  // وضع غرفة القياس
  if (state.mode === 'fitting') {
    return (
      <FittingRoom
        onBack={actions.handleExitFitting}
        initialGarmentUrl={state.designToFit?.url}
        initialGarmentName={state.designToFit?.name}
        initialWeather={state.designToFit?.weather}
      />
    );
  }

  return (
    <div className="font-sans bg-zinc-950 text-zinc-100 min-h-screen flex flex-col selection:bg-[#d4b483] selection:text-black">
      {/* إشعارات Toast */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fafafa',
            border: '1px solid #27272a',
          },
        }}
      />

      <Header />

      <main className="flex-grow flex flex-col items-center justify-center relative">
        {/* خلفية الإضاءة المحيطة */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#d4b483]/5 blur-[120px] rounded-full mix-blend-screen" />
        </div>

        <AnimatePresence mode="wait">
          {/* الصفحة الرئيسية */}
          {state.mode === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={TRANSITION_CONFIG}
              className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 p-6 z-10 mt-20"
            >
              <ModeCard
                title="Design Brief"
                description="ترجمة متطلبات السيناريو للغة بصرية. تحليل قوس الشخصية، الحقبة، والجو العام."
                imageUrl="https://images.unsplash.com/photo-1533158307587-828f0a76ef93?q=80&w=1974&auto=format&fit=crop"
                icon={<span className="font-serif italic text-lg">1</span>}
                accentColor="[#d4b483]"
                buttonText="ابدأ التحليل"
                onClick={() => actions.setMode('director')}
                cardNumber="1"
              />

              <ModeCard
                title="The Atelier"
                description="القياس الافتراضي واختبار الإجهاد. فحص الخامات مقابل الإضاءة، المشاهد الخطرة، ومتطلبات الكاميرا."
                imageUrl="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2574&auto=format&fit=crop"
                icon={<ShirtIcon className="w-4 h-4" />}
                accentColor="purple-400"
                buttonText="ادخل الاستوديو"
                onClick={() => actions.setMode('fitting')}
              />
            </motion.div>
          )}

          {/* وضع المخرج */}
          {state.mode === 'director' && (
            <motion.div
              key="director"
              className="w-full min-h-screen flex flex-col pt-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* زر العودة */}
              <div className="fixed top-8 left-8 z-50">
                <button
                  onClick={() => actions.setMode('home')}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                >
                  <span className="w-6 h-[1px] bg-zinc-500 group-hover:bg-white" />
                  رجوع
                </button>
              </div>

              {/* عروض المخرج الفرعية */}
              {state.directorView === 'brief' && (
                <div className="flex-grow flex items-center justify-center">
                  <StartScreen onComplete={actions.handleBriefComplete} />
                  {state.error && (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 p-4 bg-red-900/80 backdrop-blur text-red-100 border border-red-800 rounded shadow-2xl flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <p className="text-xs font-mono">{state.error}</p>
                    </div>
                  )}
                </div>
              )}

              {state.directorView === 'processing' && (
                <div className="flex-grow flex items-center justify-center">
                  <div className="text-center">
                    <Spinner />
                    <h3 className="mt-8 text-3xl font-serif text-[#d4b483] tracking-wide animate-pulse">
                      جاري التصميم...
                    </h3>
                    <div className="mt-8 flex flex-col gap-2 items-center">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                        البحث في الحقبة...
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600">
                        اختيار الخامات...
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-700">
                        بناء الصورة الظلية...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {state.directorView === 'lookbook' && state.directorResult && (
                <LookbookView
                  result={state.directorResult}
                  onMoveToFitting={actions.handleMoveToFitting}
                  onStartOver={actions.handleDirectorStartOver}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CineFitApp;
