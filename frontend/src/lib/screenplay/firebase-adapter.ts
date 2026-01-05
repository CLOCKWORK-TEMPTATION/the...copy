/**
 * Firebase Adapter for Screenplay Editor
 *
 * محول Firebase لمحرر السيناريو العربي
 * يوفر طبقة تكامل مع Firestore لحفظ وتحميل السيناريوهات
 *
 * @module lib/screenplay/firebase-adapter
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * وثيقة السيناريو في Firestore
 */
export interface ScreenplayDocument {
  id: string;
  title: string;
  content: string;
  formattedLines: FormattedLine[];
  userId: string;
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    version: string;
    wordCount: number;
    characterCount: number;
    sceneCount: number;
  };
}

/**
 * خط منسق
 */
export interface FormattedLine {
  id: string;
  text: string;
  type: string;
  number: number;
}

/**
 * نتيجة العملية
 */
export interface OperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * ScreenplayFirebaseAdapter - محول Firebase للسيناريوهات
 *
 * يوفر methods كاملة للتعامل مع Firestore
 */
export class ScreenplayFirebaseAdapter {
  /**
   * حفظ سيناريو جديد أو تحديث سيناريو موجود
   * @param userId - معرف المستخدم
   * @param screenplayId - معرف السيناريو
   * @param data - بيانات السيناريو
   * @returns نتيجة العملية
   */
  static async saveScreenplay(
    userId: string,
    screenplayId: string,
    data: Partial<ScreenplayDocument>
  ): Promise<OperationResult> {
    try {
      const docRef = doc(db, 'users', userId, 'screenplays', screenplayId);

      const docData = {
        ...data,
        userId,
        updatedAt: serverTimestamp(),
      };

      await setDoc(docRef, docData, { merge: true });

      return { success: true, data: { id: screenplayId } };
    } catch (error) {
      console.error('Failed to save screenplay:', error);
      return {
        success: false,
        error: `فشل حفظ السيناريو: ${error}`,
      };
    }
  }

  /**
   * تحميل سيناريو من Firestore
   * @param userId - معرف المستخدم
   * @param screenplayId - معرف السيناريو
   * @returns السيناريو أو null إذا لم يوجد
   */
  static async loadScreenplay(
    userId: string,
    screenplayId: string
  ): Promise<ScreenplayDocument | null> {
    try {
      const docRef = doc(db, 'users', userId, 'screenplays', screenplayId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          userId,
          ...docSnap.data(),
        } as ScreenplayDocument;
      }

      return null;
    } catch (error) {
      console.error('Failed to load screenplay:', error);
      throw new Error(`فشل تحميل السيناريو: ${error}`);
    }
  }

  /**
   * حذف سيناريو
   * @param userId - معرف المستخدم
   * @param screenplayId - معرف السيناريو
   * @returns نتيجة العملية
   */
  static async deleteScreenplay(
    userId: string,
    screenplayId: string
  ): Promise<OperationResult> {
    try {
      const docRef = doc(db, 'users', userId, 'screenplays', screenplayId);
      await deleteDoc(docRef);

      return { success: true };
    } catch (error) {
      console.error('Failed to delete screenplay:', error);
      return {
        success: false,
        error: `فشل حذف السيناريو: ${error}`,
      };
    }
  }

  /**
   * الحصول على جميع سيناريوهات المستخدم
   * @param userId - معرف المستخدم
   * @returns قائمة السيناريوهات
   */
  static async getUserScreenplays(userId: string): Promise<ScreenplayDocument[]> {
    try {
      const q = query(
        collection(db, 'users', userId, 'screenplays'),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const screenplays: ScreenplayDocument[] = [];

      querySnapshot.forEach((doc) => {
        screenplays.push({
          id: doc.id,
          userId,
          ...doc.data(),
        } as ScreenplayDocument);
      });

      return screenplays;
    } catch (error) {
      console.error('Failed to get user screenplays:', error);
      throw new Error(`فشل الحصول على السيناريوهات: ${error}`);
    }
  }

  /**
   * الحصول على سيناريوهات مشروع معين
   * @param userId - معرف المستخدم
   * @param projectId - معرف المشروع
   * @returns قائمة السيناريوهات
   */
  static async getProjectScreenplays(
    userId: string,
    projectId: string
  ): Promise<ScreenplayDocument[]> {
    try {
      const q = query(
        collection(db, 'users', userId, 'screenplays'),
        where('projectId', '==', projectId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const screenplays: ScreenplayDocument[] = [];

      querySnapshot.forEach((doc) => {
        screenplays.push({
          id: doc.id,
          userId,
          ...doc.data(),
        } as ScreenplayDocument);
      });

      return screenplays;
    } catch (error) {
      console.error('Failed to get project screenplays:', error);
      throw new Error(`فشل الحصول على سيناريوهات المشروع: ${error}`);
    }
  }

  /**
   * الاشتراك في التحديثات الفورية لسيناريو
   * @param userId - معرف المستخدم
   * @param screenplayId - معرف السيناريو
   * @param onUpdate - callback عند التحديث
   * @param onError - callback عند الخطأ
   * @returns دالة لإلغاء الاشتراك
   */
  static subscribeToScreenplay(
    userId: string,
    screenplayId: string,
    onUpdate: (data: ScreenplayDocument) => void,
    onError?: (error: Error) => void
  ): () => void {
    const docRef = doc(db, 'users', userId, 'screenplays', screenplayId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate({
            id: docSnap.id,
            userId,
            ...docSnap.data(),
          } as ScreenplayDocument);
        }
      },
      (error) => {
        console.error('Screenplay subscription error:', error);
        onError?.(error);
      }
    );

    return unsubscribe;
  }

  /**
   * البحث عن سيناريوهات
   * @param userId - معرف المستخدم
   * @param searchTerm - كلمة البحث
   * @returns السيناريوهات المطابقة
   */
  static async searchScreenplays(
    userId: string,
    searchTerm: string
  ): Promise<ScreenplayDocument[]> {
    try {
      // ملاحظة: Firestore لا يدعم LIKE queries مباشرة
      // لذلك سنبحث في جميع السيناريوهات ونفلترها
      const allScreenplays = await this.getUserScreenplays(userId);

      const filtered = allScreenplays.filter((sp) =>
        sp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sp.content.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return filtered;
    } catch (error) {
      console.error('Failed to search screenplays:', error);
      throw new Error(`فشل البحث في السيناريوهات: ${error}`);
    }
  }

  /**
   * إنشاء سيناريو جديد
   * @param userId - معرف المستخدم
   * @param title - عنوان السيناريو
   * @param content - محتوى السيناريو
   * @param projectId - معرف المشروع (اختياري)
   * @returns السيناريو الجديد
   */
  static async createScreenplay(
    userId: string,
    title: string,
    content: string = '',
    projectId?: string
  ): Promise<ScreenplayDocument> {
    try {
      // إنشاء معرف جديد
      const newId = `screenplay_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
      const characterCount = content.length;
      const sceneCount = (content.match(/مشهد\s*\d+/gi) || []).length;

      const newScreenplay: Partial<ScreenplayDocument> = {
        id: newId,
        title,
        content,
        formattedLines: [],
        projectId,
        metadata: {
          version: '2.0',
          wordCount,
          characterCount,
          sceneCount,
        },
      };

      const result = await this.saveScreenplay(userId, newId, newScreenplay);

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        id: newId,
        userId,
        title,
        content,
        formattedLines: [],
        projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: newScreenplay.metadata!,
      } as ScreenplayDocument;
    } catch (error) {
      console.error('Failed to create screenplay:', error);
      throw new Error(`فشل إنشاء السيناريو: ${error}`);
    }
  }

  /**
   * تحديث عنوان السيناريو
   * @param userId - معرف المستخدم
   * @param screenplayId - معرف السيناريو
   * @param newTitle - العنوان الجديد
   * @returns نتيجة العملية
   */
  static async updateScreenplayTitle(
    userId: string,
    screenplayId: string,
    newTitle: string
  ): Promise<OperationResult> {
    try {
      const docRef = doc(db, 'users', userId, 'screenplays', screenplayId);

      await updateDoc(docRef, {
        title: newTitle,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to update title:', error);
      return {
        success: false,
        error: `فشل تحديث العنوان: ${error}`,
      };
    }
  }

  /**
   * نسخ سيناريو (duplicate)
   * @param userId - معرف المستخدم
   * @param screenplayId - معرف السيناريو المراد نسخه
   * @returns السيناريو الجديد
   */
  static async duplicateScreenplay(
    userId: string,
    screenplayId: string
  ): Promise<ScreenplayDocument> {
    try {
      const original = await this.loadScreenplay(userId, screenplayId);

      if (!original) {
        throw new Error('السيناريو الأصلي غير موجود');
      }

      const newTitle = `${original.title} (نسخة)`;
      const newContent = original.content;

      return await this.createScreenplay(
        userId,
        newTitle,
        newContent,
        original.projectId
      );
    } catch (error) {
      console.error('Failed to duplicate screenplay:', error);
      throw new Error(`فشل نسخ السيناريو: ${error}`);
    }
  }

  /**
   * تصدير سيناريوهات المستخدم (للنسخ الاحتياطي)
   * @param userId - معرف المستخدم
   * @returns جميع السيناريوهات
   */
  static async exportAllScreenplays(
    userId: string
  ): Promise<ScreenplayDocument[]> {
    try {
      return await this.getUserScreenplays(userId);
    } catch (error) {
      console.error('Failed to export screenplays:', error);
      throw new Error(`فشل تصدير السيناريوهات: ${error}`);
    }
  }

  /**
   * استيراد سيناريوهات (من نسخة احتياطية)
   * @param userId - معرف المستخدم
   * @param screenplays - قائمة السيناريوهات المراد استيرادها
   * @returns عدد السيناريوهات المستوردة
   */
  static async importScreenplays(
    userId: string,
    screenplays: ScreenplayDocument[]
  ): Promise<number> {
    let importedCount = 0;

    for (const screenplay of screenplays) {
      try {
        // إنشاء معرف جديد لكل سيناريو مستورد
        const newId = `imported_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        await this.saveScreenplay(userId, newId, {
          ...screenplay,
          id: newId,
          userId,
        });

        importedCount++;
      } catch (error) {
        console.error(`Failed to import screenplay: ${screenplay.title}`, error);
      }
    }

    return importedCount;
  }

  /**
   * حساب إحصائيات المستخدم
   * @param userId - معرف المستخدم
   * @returns الإحصائيات
   */
  static async getUserStats(userId: string): Promise<{
    totalScreenplays: number;
    totalWords: number;
    totalCharacters: number;
    totalScenes: number;
  }> {
    try {
      const screenplays = await this.getUserScreenplays(userId);

      const totalWords = screenplays.reduce(
        (sum, sp) => sum + (sp.metadata?.wordCount || 0),
        0
      );

      const totalCharacters = screenplays.reduce(
        (sum, sp) => sum + (sp.metadata?.characterCount || 0),
        0
      );

      const totalScenes = screenplays.reduce(
        (sum, sp) => sum + (sp.metadata?.sceneCount || 0),
        0
      );

      return {
        totalScreenplays: screenplays.length,
        totalWords,
        totalCharacters,
        totalScenes,
      };
    } catch (error) {
      console.error('Failed to get user stats:', error);
      throw new Error(`فشل الحصول على الإحصائيات: ${error}`);
    }
  }
}

/**
 * التصدير الافتراضي
 */
export default ScreenplayFirebaseAdapter;
