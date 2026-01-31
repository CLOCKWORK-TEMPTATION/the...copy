/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview هوك إدارة حالة تطبيق CineFit الرئيسي
 * 
 * لماذا نفصل المنطق في Hook؟
 * - يسهّل اختبار المنطق بشكل منفصل عن الواجهة
 * - يقلل تعقيد المكوّن الرئيسي ويجعله أوضح
 * - يسمح بإعادة استخدام المنطق في مكونات أخرى
 */

'use client';

import { useReducer, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { generateProfessionalDesign } from '../services/geminiService';
import { getFriendlyErrorMessage } from '../lib/utils';
import type { 
  AppMode, 
  DirectorView, 
  DesignBrief, 
  ProfessionalDesignResult, 
  DesignToFit 
} from '../types';

// ==========================================
// أنواع الحالة والإجراءات
// ==========================================

/**
 * حالة التطبيق الكاملة
 * لماذا نستخدم واجهة موحدة؟
 * - لتجميع كل الحالات المتصلة في مكان واحد
 */
interface CineFitState {
  /** الوضع الحالي: الرئيسية، المخرج، أو غرفة القياس */
  mode: AppMode;
  /** العرض الفرعي في وضع المخرج */
  directorView: DirectorView;
  /** نتيجة التصميم من الذكاء الاصطناعي */
  directorResult: ProfessionalDesignResult | null;
  /** رسالة الخطأ الحالية */
  error: string | null;
  /** بيانات التصميم للانتقال لغرفة القياس */
  designToFit: DesignToFit | undefined;
  /** حالة التحميل */
  isLoading: boolean;
}

/**
 * الحالة الابتدائية
 */
const initialState: CineFitState = {
  mode: 'home',
  directorView: 'brief',
  directorResult: null,
  error: null,
  designToFit: undefined,
  isLoading: false,
};

/**
 * أنواع الإجراءات الممكنة
 * لماذا نستخدم Union Types؟
 * - لضمان أن كل action لها payload صحيح
 */
type CineFitAction =
  | { type: 'SET_MODE'; payload: AppMode }
  | { type: 'SET_DIRECTOR_VIEW'; payload: DirectorView }
  | { type: 'SET_DIRECTOR_RESULT'; payload: ProfessionalDesignResult | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DESIGN_TO_FIT'; payload: DesignToFit | undefined }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET_DIRECTOR' }
  | { type: 'MOVE_TO_FITTING' };

// ==========================================
// دالة الـ Reducer
// ==========================================

/**
 * معالج تحديثات الحالة
 * لماذا Reducer بدلاً من useState؟
 * - يجمع كل تحديثات الحالة المرتبطة في مكان واحد
 * - يسهّل تتبع التغييرات والتصحيح
 * - يمنع حالات السباق (Race Conditions)
 */
function cineFitReducer(state: CineFitState, action: CineFitAction): CineFitState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    
    case 'SET_DIRECTOR_VIEW':
      return { ...state, directorView: action.payload };
    
    case 'SET_DIRECTOR_RESULT':
      return { ...state, directorResult: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_DESIGN_TO_FIT':
      return { ...state, designToFit: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'RESET_DIRECTOR':
      return {
        ...state,
        directorResult: null,
        directorView: 'brief',
        error: null,
      };
    
    case 'MOVE_TO_FITTING':
      if (!state.directorResult) return state;
      return {
        ...state,
        mode: 'fitting',
        designToFit: {
          url: state.directorResult.conceptArtUrl,
          name: state.directorResult.lookTitle,
          weather: `${state.directorResult.realWeather.condition}, ${state.directorResult.realWeather.temp}°F`,
        },
      };
    
    default:
      return state;
  }
}

// ==========================================
// الـ Hook الرئيسي
// ==========================================

/**
 * هوك إدارة حالة CineFit
 * 
 * لماذا نُرجع كائناً منظماً؟
 * - يسهّل الـ Destructuring في المكون
 * - يوضح الفصل بين الحالة والإجراءات
 */
export function useCineFitApp() {
  const [state, dispatch] = useReducer(cineFitReducer, initialState);

  /**
   * معالجة اكتمال البريف وتوليد التصميم
   * لماذا useCallback؟
   * - لتجنب إعادة إنشاء الدالة في كل render
   * - مهم للأداء عند تمرير الدالة لمكونات فرعية
   */
  const handleBriefComplete = useCallback(async (brief: DesignBrief) => {
    dispatch({ type: 'SET_DIRECTOR_VIEW', payload: 'processing' });
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const data = await generateProfessionalDesign(brief);
      dispatch({ type: 'SET_DIRECTOR_RESULT', payload: data });
      dispatch({ type: 'SET_DIRECTOR_VIEW', payload: 'lookbook' });
      toast.success('تم توليد التصميم بنجاح');
    } catch (err) {
      const errorMessage = getFriendlyErrorMessage(err, 'فشل توليد التصميم');
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_DIRECTOR_VIEW', payload: 'brief' });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  /**
   * إعادة تعيين وضع المخرج
   */
  const handleDirectorStartOver = useCallback(() => {
    dispatch({ type: 'RESET_DIRECTOR' });
  }, []);

  /**
   * الانتقال لغرفة القياس
   */
  const handleMoveToFitting = useCallback(() => {
    dispatch({ type: 'MOVE_TO_FITTING' });
  }, []);

  /**
   * تغيير الوضع الرئيسي
   */
  const setMode = useCallback((mode: AppMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  /**
   * الخروج من غرفة القياس
   */
  const handleExitFitting = useCallback(() => {
    dispatch({ type: 'SET_MODE', payload: 'home' });
    dispatch({ type: 'SET_DESIGN_TO_FIT', payload: undefined });
  }, []);

  return {
    // الحالة
    state,
    
    // الإجراءات
    actions: {
      handleBriefComplete,
      handleDirectorStartOver,
      handleMoveToFitting,
      setMode,
      handleExitFitting,
    },
  };
}
