import { Request, Response } from "express";
import { db } from "@/db";
import { shots, scenes, projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/utils/logger";
import { z } from "zod";
import type { AuthRequest } from "@/middleware/auth.middleware";
import { GeminiService } from "@/services/gemini.service";

const createShotSchema = z.object({
  sceneId: z.string().min(1, "معرف المشهد مطلوب"),
  shotNumber: z.number().int().positive("رقم اللقطة يجب أن يكون موجباً"),
  shotType: z.string().min(1, "نوع اللقطة مطلوب"),
  cameraAngle: z.string().min(1, "زاوية الكاميرا مطلوبة"),
  cameraMovement: z.string().min(1, "حركة الكاميرا مطلوبة"),
  lighting: z.string().min(1, "الإضاءة مطلوبة"),
  aiSuggestion: z.string().optional(),
});

const updateShotSchema = z.object({
  shotNumber: z.number().int().positive().optional(),
  shotType: z.string().min(1).optional(),
  cameraAngle: z.string().min(1).optional(),
  cameraMovement: z.string().min(1).optional(),
  lighting: z.string().min(1).optional(),
  aiSuggestion: z.string().optional(),
});

export class ShotsController {
  // Get all shots for a scene
  async getShots(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "غير مصرح",
        });
        return;
      }

      const { sceneId } = req.params;

      if (!sceneId) {
        res.status(400).json({
          success: false,
          error: "معرف المشهد مطلوب",
        });
        return;
      }

      // OPTIMIZED: Single JOIN query to verify scene ownership and fetch shots
      // Uses idx_scenes_id_project and idx_projects_id_user indexes
      const [verifyResult] = await db
        .select({
          sceneId: scenes.id,
        })
        .from(scenes)
        .innerJoin(projects, eq(scenes.projectId, projects.id))
        .where(and(eq(scenes.id, sceneId), eq(projects.userId, req.user.id)))
        .limit(1);

      if (!verifyResult) {
        res.status(404).json({
          success: false,
          error: "المشهد غير موجود أو غير مصرح للوصول له",
        });
        return;
      }

      const sceneShots = await db
        .select()
        .from(shots)
        .where(eq(shots.sceneId, sceneId))
        .orderBy(shots.shotNumber);

      res.json({
        success: true,
        data: sceneShots,
      });
    } catch (error) {
      logger.error("Get shots error:", error);
      res.status(500).json({
        success: false,
        error: "حدث خطأ أثناء جلب اللقطات",
      });
    }
  }

  // Get a single shot by ID
  async getShot(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "غير مصرح",
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "معرف اللقطة مطلوب",
        });
        return;
      }

      // OPTIMIZED: Single JOIN query across 3 tables to fetch shot and verify ownership
      // Uses idx_shots_id_scene, idx_scenes_id_project, and idx_projects_id_user indexes
      const [result] = await db
        .select({
          shot: shots,
        })
        .from(shots)
        .innerJoin(scenes, eq(shots.sceneId, scenes.id))
        .innerJoin(projects, eq(scenes.projectId, projects.id))
        .where(and(eq(shots.id, id), eq(projects.userId, req.user.id)))
        .limit(1);

      if (!result) {
        res.status(404).json({
          success: false,
          error: "اللقطة غير موجودة أو غير مصرح للوصول لها",
        });
        return;
      }

      res.json({
        success: true,
        data: result.shot,
      });
    } catch (error) {
      logger.error("Get shot error:", error);
      res.status(500).json({
        success: false,
        error: "حدث خطأ أثناء جلب اللقطة",
      });
    }
  }

  // Create a new shot
  async createShot(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "غير مصرح",
        });
        return;
      }

      const validatedData = createShotSchema.parse(req.body);

      // OPTIMIZED: Single JOIN query to verify scene exists, belongs to user, and get shot count
      // Uses idx_scenes_id_project and idx_projects_id_user indexes
      const [result] = await db
        .select({
          sceneId: scenes.id,
          shotCount: scenes.shotCount,
        })
        .from(scenes)
        .innerJoin(projects, eq(scenes.projectId, projects.id))
        .where(
          and(
            eq(scenes.id, validatedData.sceneId),
            eq(projects.userId, req.user.id)
          )
        )
        .limit(1);

      if (!result) {
        res.status(404).json({
          success: false,
          error: "المشهد غير موجود أو غير مصرح لإنشاء لقطة فيه",
        });
        return;
      }

      const [newShot] = await db
        .insert(shots)
        .values(validatedData)
        .returning();

      if (!newShot) {
        res.status(500).json({
          success: false,
          error: "فشل إنشاء اللقطة",
        });
        return;
      }

      // Update shot count in scene
      await db
        .update(scenes)
        .set({ shotCount: result.shotCount + 1 })
        .where(eq(scenes.id, validatedData.sceneId));

      res.status(201).json({
        success: true,
        message: "تم إنشاء اللقطة بنجاح",
        data: newShot,
      });

      logger.info("Shot created successfully", {
        shotId: newShot.id,
        sceneId: validatedData.sceneId,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: "بيانات غير صالحة",
          details: error.issues,
        });
        return;
      }

      logger.error("Create shot error:", error);
      res.status(500).json({
        success: false,
        error: "حدث خطأ أثناء إنشاء اللقطة",
      });
    }
  }

  // Update a shot
  async updateShot(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "غير مصرح",
        });
        return;
      }

      const { id } = req.params;
      const validatedData = updateShotSchema.parse(req.body);

      if (!id) {
        res.status(400).json({
          success: false,
          error: "معرف اللقطة مطلوب",
        });
        return;
      }

      // OPTIMIZED: Single JOIN query across 3 tables to verify shot exists and user owns it
      // Uses idx_shots_id_scene, idx_scenes_id_project, and idx_projects_id_user indexes
      const [result] = await db
        .select({
          shotId: shots.id,
        })
        .from(shots)
        .innerJoin(scenes, eq(shots.sceneId, scenes.id))
        .innerJoin(projects, eq(scenes.projectId, projects.id))
        .where(and(eq(shots.id, id), eq(projects.userId, req.user.id)))
        .limit(1);

      if (!result) {
        res.status(404).json({
          success: false,
          error: "اللقطة غير موجودة أو غير مصرح لتعديلها",
        });
        return;
      }

      const [updatedShot] = await db
        .update(shots)
        .set(validatedData)
        .where(eq(shots.id, id))
        .returning();

      res.json({
        success: true,
        message: "تم تحديث اللقطة بنجاح",
        data: updatedShot,
      });

      logger.info("Shot updated successfully", { shotId: id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: "بيانات غير صالحة",
          details: error.issues,
        });
        return;
      }

      logger.error("Update shot error:", error);
      res.status(500).json({
        success: false,
        error: "حدث خطأ أثناء تحديث اللقطة",
      });
    }
  }

  // Delete a shot
  async deleteShot(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "غير مصرح",
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "معرف اللقطة مطلوب",
        });
        return;
      }

      // OPTIMIZED: Single JOIN query across 3 tables to verify shot exists and user owns it
      // Also fetches scene data for updating shot count
      // Uses idx_shots_id_scene, idx_scenes_id_project, and idx_projects_id_user indexes
      const [result] = await db
        .select({
          shotId: shots.id,
          sceneId: shots.sceneId,
          shotCount: scenes.shotCount,
        })
        .from(shots)
        .innerJoin(scenes, eq(shots.sceneId, scenes.id))
        .innerJoin(projects, eq(scenes.projectId, projects.id))
        .where(and(eq(shots.id, id), eq(projects.userId, req.user.id)))
        .limit(1);

      if (!result) {
        res.status(404).json({
          success: false,
          error: "اللقطة غير موجودة أو غير مصرح لحذفها",
        });
        return;
      }

      await db.delete(shots).where(eq(shots.id, id));

      // Update shot count in scene
      await db
        .update(scenes)
        .set({ shotCount: Math.max(0, result.shotCount - 1) })
        .where(eq(scenes.id, result.sceneId));

      res.json({
        success: true,
        message: "تم حذف اللقطة بنجاح",
      });

      logger.info("Shot deleted successfully", { shotId: id });
    } catch (error) {
      logger.error("Delete shot error:", error);
      res.status(500).json({
        success: false,
        error: "حدث خطأ أثناء حذف اللقطة",
      });
    }
  }

  // Generate AI-powered shot suggestions
  async generateShotSuggestion(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "غير مصرح",
        });
        return;
      }

      const { sceneDescription, shotType } = req.body;

      if (!sceneDescription || !shotType) {
        res.status(400).json({
          success: false,
          error: "وصف المشهد ونوع اللقطة مطلوبان",
        });
        return;
      }

      const geminiService = new GeminiService();
      const suggestion = await geminiService.getShotSuggestion(
        sceneDescription,
        shotType
      );

      res.json({
        success: true,
        message: "تم توليد اقتراحات اللقطة بنجاح",
        data: {
          suggestion,
          sceneDescription,
          shotType,
        },
      });

      logger.info("Shot suggestion generated successfully", {
        userId: req.user.id,
      });
    } catch (error) {
      logger.error("Generate shot suggestion error:", error);
      res.status(500).json({
        success: false,
        error: "حدث خطأ أثناء توليد اقتراحات اللقطة",
      });
    }
  }
}

export const shotsController = new ShotsController();
