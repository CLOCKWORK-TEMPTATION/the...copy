import { Request, Response } from 'express';
import { db } from '@/db';
import { scenes, projects } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { logger } from '@/utils/logger';
import { z } from 'zod';
import type { AuthRequest } from '@/middleware/auth.middleware';

const createSceneSchema = z.object({
  projectId: z.string().min(1, 'معرف المشروع مطلوب'),
  sceneNumber: z.number().int().positive('رقم المشهد يجب أن يكون موجباً'),
  title: z.string().min(1, 'عنوان المشهد مطلوب'),
  location: z.string().min(1, 'الموقع مطلوب'),
  timeOfDay: z.string().min(1, 'وقت اليوم مطلوب'),
  characters: z.array(z.string()).min(1, 'يجب إضافة شخصية واحدة على الأقل'),
  description: z.string().optional(),
  shotCount: z.number().int().nonnegative().default(0),
  status: z.string().default('planned'),
});

const updateSceneSchema = z.object({
  sceneNumber: z.number().int().positive().optional(),
  title: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  timeOfDay: z.string().min(1).optional(),
  characters: z.array(z.string()).min(1).optional(),
  description: z.string().optional(),
  shotCount: z.number().int().nonnegative().optional(),
  status: z.string().optional(),
});

export class ScenesController {
  // Get all scenes for a project
  async getScenes(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'غير مصرح',
        });
        return;
      }

      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'معرف المشروع مطلوب',
        });
        return;
      }

      // Verify project belongs to user
      const [project] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, projectId), eq(projects.userId, req.user.id)));

      if (!project) {
        res.status(404).json({
          success: false,
          error: 'المشروع غير موجود',
        });
        return;
      }

      const projectScenes = await db
        .select()
        .from(scenes)
        .where(eq(scenes.projectId, projectId))
        .orderBy(scenes.sceneNumber);

      res.json({
        success: true,
        data: projectScenes,
      });
    } catch (error) {
      logger.error('Get scenes error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ أثناء جلب المشاهد',
      });
    }
  }

  // Get a single scene by ID
  async getScene(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'غير مصرح',
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'معرف المشهد مطلوب',
        });
        return;
      }

      // OPTIMIZED: Single JOIN query to fetch scene and verify ownership
      // Uses idx_scenes_id_project and idx_projects_id_user indexes
      const [result] = await db
        .select({
          scene: scenes,
        })
        .from(scenes)
        .innerJoin(projects, eq(scenes.projectId, projects.id))
        .where(and(eq(scenes.id, id), eq(projects.userId, req.user.id)))
        .limit(1);

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'المشهد غير موجود أو غير مصرح للوصول له',
        });
        return;
      }

      res.json({
        success: true,
        data: result.scene,
      });
    } catch (error) {
      logger.error('Get scene error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ أثناء جلب المشهد',
      });
    }
  }

  // Create a new scene
  async createScene(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'غير مصرح',
        });
        return;
      }

      const validatedData = createSceneSchema.parse(req.body);

      // Verify project belongs to user
      const [project] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, validatedData.projectId), eq(projects.userId, req.user.id)));

      if (!project) {
        res.status(404).json({
          success: false,
          error: 'المشروع غير موجود',
        });
        return;
      }

      const [newScene] = await db
        .insert(scenes)
        .values(validatedData)
        .returning();

      if (!newScene) {
        res.status(500).json({
          success: false,
          error: 'فشل إنشاء المشهد',
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'تم إنشاء المشهد بنجاح',
        data: newScene,
      });

      logger.info('Scene created successfully', { sceneId: newScene.id, projectId: validatedData.projectId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'بيانات غير صالحة',
          details: error.issues,
        });
        return;
      }

      logger.error('Create scene error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ أثناء إنشاء المشهد',
      });
    }
  }

  // Update a scene
  async updateScene(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'غير مصرح',
        });
        return;
      }

      const { id } = req.params;
      const validatedData = updateSceneSchema.parse(req.body);

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'معرف المشهد مطلوب',
        });
        return;
      }

      // OPTIMIZED: Single JOIN query to verify scene exists and user owns it
      // Uses idx_scenes_id_project and idx_projects_id_user indexes
      const [result] = await db
        .select({
          sceneId: scenes.id,
        })
        .from(scenes)
        .innerJoin(projects, eq(scenes.projectId, projects.id))
        .where(and(eq(scenes.id, id), eq(projects.userId, req.user.id)))
        .limit(1);

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'المشهد غير موجود أو غير مصرح لتعديله',
        });
        return;
      }

      const [updatedScene] = await db
        .update(scenes)
        .set(validatedData)
        .where(eq(scenes.id, id))
        .returning();

      res.json({
        success: true,
        message: 'تم تحديث المشهد بنجاح',
        data: updatedScene,
      });

      logger.info('Scene updated successfully', { sceneId: id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'بيانات غير صالحة',
          details: error.issues,
        });
        return;
      }

      logger.error('Update scene error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ أثناء تحديث المشهد',
      });
    }
  }

  // Delete a scene
  async deleteScene(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'غير مصرح',
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'معرف المشهد مطلوب',
        });
        return;
      }

      // OPTIMIZED: Single JOIN query to verify scene exists and user owns it
      // Uses idx_scenes_id_project and idx_projects_id_user indexes
      const [result] = await db
        .select({
          sceneId: scenes.id,
        })
        .from(scenes)
        .innerJoin(projects, eq(scenes.projectId, projects.id))
        .where(and(eq(scenes.id, id), eq(projects.userId, req.user.id)))
        .limit(1);

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'المشهد غير موجود أو غير مصرح لحذفه',
        });
        return;
      }

      await db.delete(scenes).where(eq(scenes.id, id));

      res.json({
        success: true,
        message: 'تم حذف المشهد بنجاح',
      });

      logger.info('Scene deleted successfully', { sceneId: id });
    } catch (error) {
      logger.error('Delete scene error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ أثناء حذف المشهد',
      });
    }
  }
}

export const scenesController = new ScenesController();
