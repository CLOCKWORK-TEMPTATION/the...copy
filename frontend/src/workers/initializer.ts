/**
 * مدير تهيئة عمال الخلفية (Background Workers Initialization)
 * يتولى إعداد وتشغيل جميع العمال في الخلفية عند بدء التطبيق
 */

import { pipelineAgentManager } from "@/workers/pipeline-agent-manager";
import { ParticleWorkerManager } from "@/workers/worker-manager";

export interface WorkersStatus {
  pipelineAgent: boolean;
  particleWorkers: boolean;
  allInitialized: boolean;
}

class BackgroundWorkersInitializer {
  private initialized = false;
  private status: WorkersStatus = {
    pipelineAgent: false,
    particleWorkers: false,
    allInitialized: false,
  };

  /**
   * تهيئة جميع العمال في الخلفية
   */
  async initializeAll(): Promise<WorkersStatus> {
    if (this.initialized) {
      return this.status;
    }

    console.log("[Background Workers] بدء تهيئة العمال في الخلفية...");

    try {
      // تهيئة Pipeline Agent
      await this.initializePipelineAgent();

      // تهيئة Particle Workers (اختياري - فقط للصفحات التي تحتاجها)
      // يتم تهيئتها عند الطلب في الصفحات المعنية

      this.initialized = true;
      this.status.allInitialized = this.status.pipelineAgent;

      console.log("[Background Workers] اكتملت التهيئة:", this.status);
      
      return this.status;
    } catch (error) {
      console.error("[Background Workers] فشلت التهيئة:", error);
      throw error;
    }
  }

  /**
   * تهيئة Pipeline Agent Worker
   */
  private async initializePipelineAgent(): Promise<void> {
    try {
      console.log("[Pipeline Agent] جاري التهيئة...");
      await pipelineAgentManager.initialize();
      this.status.pipelineAgent = true;
      console.log("[Pipeline Agent] تمت التهيئة بنجاح ✓");
    } catch (error) {
      console.error("[Pipeline Agent] فشلت التهيئة:", error);
      this.status.pipelineAgent = false;
      // لا نرمي الخطأ - نسمح للتطبيق بالعمل بدون Background Agent
    }
  }

  /**
   * الحصول على حالة التهيئة
   */
  getStatus(): WorkersStatus {
    return { ...this.status };
  }

  /**
   * التحقق من جاهزية Pipeline Agent
   */
  isPipelineAgentReady(): boolean {
    return this.status.pipelineAgent && pipelineAgentManager.isInitialized();
  }

  /**
   * إيقاف جميع العمال
   */
  terminateAll(): void {
    console.log("[Background Workers] إيقاف جميع العمال...");
    
    if (this.status.pipelineAgent) {
      pipelineAgentManager.terminate();
      this.status.pipelineAgent = false;
    }

    this.initialized = false;
    this.status.allInitialized = false;
    
    console.log("[Background Workers] تم إيقاف جميع العمال");
  }
}

// Singleton instance
export const backgroundWorkersInitializer = new BackgroundWorkersInitializer();

/**
 * Hook لاستخدام حالة العمال في React Components
 */
export function useBackgroundWorkersStatus(): WorkersStatus {
  return backgroundWorkersInitializer.getStatus();
}
