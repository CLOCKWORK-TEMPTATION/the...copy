import { Request, Response } from 'express';
import { db } from '@/db';
import { projects, NewProject } from '@/db/schema';
import { AnalysisService } from '@/services/analysis.service';
import { eq, desc, and } from 'drizzle-orm';
import { logger } from '@/utils/logger';
import { z } from 'zod';
import type { AuthRequest } from '@/middleware/auth.middleware';

const createProjectSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب'),
  scriptContent: z.string().optional(),
});

const updateProjectSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب').optional(),
  scriptContent: z.string().optional(),
});

export class ProjectsController {
  // Get all projects for the authenticated user
  async getProjects(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'غير مصرح',
        });
        return;
      }

      const userProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.userId, req.user.id))
        .orderBy(desc(projects.updatedAt));

      res.json({
        success: true,
        data: userProjects,
      });
    } catch (error) {
      logger.error('Get projects error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ أثناء جلب المشاريع',
      });
    }
  }

  // Get a single project by ID
  async getProject(req: AuthRequest, res: Response): Promise<void> {
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
          error: 'معرف المشروع مطلوب',
        });
        return;
      }

      const [project] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, id), eq(projects.userId, req.user.id)));

      if (!project) {
        res.status(404).json({
          success: false,
          error: 'المشروع غير موجود',
        });
        return;
      }

      res.json({
        success: true,
        data: project,
      });
    } catch (error) {
      logger.error('Get project error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ أثناء جلب المشروع',
      });
    }
  }

  // Create a new project
  async createProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'غير مصرح',
        });
        return;
      }

      const validatedData = createProjectSchema.parse(req.body);

      const [newProject] = await db
        .insert(projects)
        .values({
          title: validatedData.title,
          scriptContent: validatedData.scriptContent,
          userId: req.user.id,
        })
        .returning();

      if (!newProject) {
        res.status(500).json({
          success: false,
          error: 'فشل إنشاء المشروع',
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'تم إنشاء المشروع بنجاح',
        data: newProject,
      });

      logger.info('Project created successfully', { projectId: newProject.id, userId: req.user.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'بيانات غير صالحة',
          details: error.issues,
        });
        return;
      }

      logger.error('Create project error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ أثناء إنشاء المشروع',
      });
    }
  }

  // Update a project
  async updateProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'غير مصرح',
        });
        return;
      }

      const { id } = req.params;
      const validatedData = updateProjectSchema.parse(req.body);

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'معرف المشروع مطلوب',
        });
        return;
      }

      // Check if project exists and belongs to user
      const [existingProject] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, id), eq(projects.userId, req.user.id)));

      if (!existingProject) {
        res.status(404).json({
          success: false,
          error: 'المشروع غير موجود',
        });
        return;
      }

      const [updatedProject] = await db
        .update(projects)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, id))
        .returning();

      res.json({
        success: true,
        message: 'تم تحديث المشروع بنجاح',
        data: updatedProject,
      });

      logger.info('Project updated successfully', { projectId: id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'بيانات غير صالحة',
          details: error.issues,
        });
        return;
      }

      logger.error('Update project error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ أثناء تحديث المشروع',
      });
    }
  }

  // Delete a project
  async deleteProject(req: AuthRequest, res: Response): Promise<void> {
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
          error: 'معرف المشروع مطلوب',
        });
        return;
      }

      // Check if project exists and belongs to user
      const [existingProject] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, id), eq(projects.userId, req.user.id)));

      if (!existingProject) {
        res.status(404).json({
          success: false,
          error: 'المشروع غير موجود',
        });
        return;
      }

      await db.delete(projects).where(eq(projects.id, id));

      res.json({
        success: true,
        message: 'تم حذف المشروع بنجاح',
      });

      logger.info('Project deleted successfully', { projectId: id });
    } catch (error) {
      logger.error('Delete project error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ أثناء حذف المشروع',
      });
    }
  }

  // Analyze script and extract scenes/characters (AI-powered)
  async analyzeScript(req: AuthRequest, res: Response): Promise<void> {
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
          error: 'معرف المشروع مطلوب',
        });
        return;
      }

      // Check if project exists and belongs to user
      const [project] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, id), eq(projects.userId, req.user.id)));

      if (!project) {
        res.status(404).json({
          success: false,
          error: 'المشروع غير موجود',
        });
        return;
      }

      if (!project.scriptContent) {
        res.status(400).json({
          success: false,
          error: 'لا يوجد نص سيناريو للتحليل',
        });
        return;
      }

      // Implement AI-based script analysis using Gemini
      // This extracts scenes, characters, and suggestions
      // For now, return a placeholder response

      const analysisService = new AnalysisService();
      const analysisResult = await analysisService.runFullPipeline({
        projectName: project.title,
        fullText: project.scriptContent,
        language: 'ar',
        context: {},
        flags: {
          runStations: true,
          fastMode: false,
          skipValidation: false,
          verboseLogging: false,
        },
        agents: { temperature: 0.2 },
      });

      res.json({
        success: true,
        message: 'تم تحليل السيناريو بنجاح',
        data: {
          analysis: analysisResult,
          projectId: id,
        },
      });

      logger.info('Script analysis requested', { projectId: id });
    } catch (error) {
      logger.error('Analyze script error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ أثناء تحليل السيناريو',
      });
    }
  }
}

export const projectsController = new ProjectsController();
