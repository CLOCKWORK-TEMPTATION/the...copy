/**
 * مكون التهيئة للعمال في الخلفية
 * يتم تحميله في بداية التطبيق لتهيئة جميع Web Workers
 */

"use client";

import { useEffect, useState } from "react";
import { backgroundWorkersInitializer } from "./initializer";
import type { WorkersStatus } from "./initializer";

export function BackgroundWorkersProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<WorkersStatus>({
    pipelineAgent: false,
    particleWorkers: false,
    allInitialized: false,
  });
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        console.log("🚀 بدء تهيئة العمال في الخلفية...");
        const newStatus = await backgroundWorkersInitializer.initializeAll();
        
        if (isMounted) {
          setStatus(newStatus);
          setIsInitializing(false);
          console.log("✅ اكتملت تهيئة العمال في الخلفية");
        }
      } catch (error) {
        console.error("❌ خطأ في تهيئة العمال:", error);
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    initialize();

    // Cleanup عند إلغاء تحميل المكون
    return () => {
      isMounted = false;
      // لا نوقف العمال هنا لأنها global
    };
  }, []);

  // يمكن إضافة UI لحالة التحميل إذا لزم الأمر
  // لكن الأفضل عدم حجب التطبيق انتظاراً للعمال

  return <>{children}</>;
}
