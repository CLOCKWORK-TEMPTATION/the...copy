'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview سياق إدارة حالة المشروع
 * 
 * لماذا Context بدلاً من Props Drilling؟
 * - الحالة تُستخدم في مكونات متعددة متباعدة
 * - تجنب تمرير Props عبر عدة مستويات
 * - تسهيل إضافة مستهلكين جدد للحالة
 */

import React, { 
  createContext, 
  useContext, 
  useReducer, 
  useCallback, 
  useMemo,
  type ReactNode 
} from 'react';

// ==========================================
// أنواع البيانات
// ==========================================

/**
 * أدوار المستخدم في المشروع
 * لماذا نحدد الأدوار؟
 * - لإظهار/إخفاء ميزات حسب صلاحيات المستخدم
 */
type Role = 'Director' | 'Costume Designer' | 'Producer';

/**
 * حالة المشروع الكاملة
 */
interface ProjectState {
  /** اسم المشروع الحالي */
  projectName: string;
  /** دور المستخدم الحالي */
  currentRole: Role;
  /** المشهد النشط حالياً */
  activeScene: string;
  /** قائمة الإشعارات */
  notifications: string[];
}

/**
 * واجهة السياق (الحالة + الإجراءات)
 */
interface ProjectContextType extends ProjectState {
  /** تغيير دور المستخدم */
  setRole: (role: Role) => void;
  /** إضافة إشعار جديد */
  addNotification: (msg: string) => void;
  /** تحديث المشهد النشط */
  updateScene: (scene: string) => void;
}

// ==========================================
// إعداد الـ Context
// ==========================================

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// ==========================================
// Reducer
// ==========================================

/**
 * أنواع الإجراءات الممكنة
 */
type ProjectAction =
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'ADD_NOTIFICATION'; payload: string }
  | { type: 'UPDATE_SCENE'; payload: string };

/**
 * الحالة الابتدائية
 */
const initialState: ProjectState = {
  projectName: 'The Last Shadow - Season 1',
  currentRole: 'Costume Designer',
  activeScene: 'INT. HANGAR - NIGHT',
  notifications: [
    'تم اعتماد الميزانية للمشهد 4',
    'تنبيه: تغيير في إضاءة موقع التصوير',
  ],
};

/**
 * معالج تحديثات الحالة
 */
function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, currentRole: action.payload };
    
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [action.payload, ...state.notifications].slice(0, 10) // حد أقصى 10 إشعارات
      };
    
    case 'UPDATE_SCENE':
      return { ...state, activeScene: action.payload };
    
    default:
      return state;
  }
}

// ==========================================
// Provider Component
// ==========================================

interface ProjectProviderProps {
  children: ReactNode;
}

/**
 * مزود سياق المشروع
 * 
 * لماذا نفصل الإجراءات في useCallback؟
 * - لتجنب إعادة إنشائها في كل render
 * - لمنع إعادة رسم المكونات المستهلكة بلا داعٍ
 */
export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  const setRole = useCallback((role: Role) => {
    dispatch({ type: 'SET_ROLE', payload: role });
  }, []);

  const addNotification = useCallback((msg: string) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: msg });
  }, []);

  const updateScene = useCallback((scene: string) => {
    dispatch({ type: 'UPDATE_SCENE', payload: scene });
  }, []);

  // تجميع القيمة في useMemo لتحسين الأداء
  const value = useMemo<ProjectContextType>(() => ({
    ...state,
    setRole,
    addNotification,
    updateScene,
  }), [state, setRole, addNotification, updateScene]);

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

// ==========================================
// Hook للاستخدام
// ==========================================

/**
 * استخدام سياق المشروع
 * 
 * لماذا نتحقق من undefined؟
 * - لضمان استخدام الـ Hook داخل Provider
 * - لتقديم رسالة خطأ واضحة للمطور
 * 
 * @throws Error إذا استُخدم خارج ProjectProvider
 */
export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  
  if (context === undefined) {
    throw new Error('يجب استخدام useProject داخل ProjectProvider');
  }
  
  return context;
};
