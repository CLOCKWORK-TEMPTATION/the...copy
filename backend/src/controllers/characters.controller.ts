import { Request, Response } from 'express';
import { db } from '@/db';
import { characters, projects } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '@/utils/logger';
import { z } from 'zod';
import type { AuthRequest } from '@/middleware/auth.middleware';

const createCharacterSchema = z.object({
  projectId: z.string().min(1, 'معرف المشروع مطلوب'),
  name: z.string().min(1, 'اسم الشخصية مطلوب'),
  appearances: z.number().int().nonnegative().default(0),
  consistencyStatus: z.string().default('good'),
  lastSeen: z.string().optional(),
  notes: z.string().optional(),
});

const updateCharacterSchema = z.object({
  name: z.string().min(1).optional(),
  appearances: z.number().int().nonnegative().optional(),
  consistencyStatus: z.string().optional(),
  lastSeen: z.string().optional(),
  notes: z.string().optional(),
});

export class CharactersController {
  // Get all characters for a project
  async getCharacters(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'غير مصرح',
        });
        return;
      }

      const { projectId } = req.params;

      // Verify project belongs to user
      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'معرف المشروع مطلوب',
        });
        return;
      }

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

      const projectCharacters = await db
        .select()
        .from(characters)
        .where(eq(characters.projectId, projectId));

      res.json({
        success: true,
        data: projectCharacters,
      });
    } catch (error) {
      logger.error('Get characters error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ أثناء جلب الشخصيات',
      });
    }
  }

  // Get a single character by ID
  async getCharacter(req: AuthRequest, res: Response): Promise<void> {
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
          error: 'معرف الشخصية مطلوب',
        });
        return;
      }

      const [character] = await db
        .select()
        .from(characters)
        .where(eq(characters.id, id));

      if (!character) {
        res.status(404).json({
          success: false,
          error: 'الشخصية غير موجودة',
        });
        return;
      }

      // Verify project belongs to user
      const [project] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, character.projectId), eq(projects.userId, req.user.id)));

      if (!project) {
        res.status(403).json({
          success: false,
          error: 'غير مصرح للوصول لهذه الشخصية',
        });
        return;
      }

      res.json({
        success: true,
        data: character,
      });
    } catch (error) {
      logger.error('Get character error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ أثناء جلب الشخصية',
      });
    }
  }

  // Create a new character
  async createCharacter(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'غير مصرح',
        });
        return;
      }

      const validatedData = createCharacterSchema.parse(req.body);

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

      const [newCharacter] = await db
        .insert(characters)
        .values(validatedData)
        .returning();

      if (!newCharacter) {
        res.status(500).json({
          success: false,
          error: 'فشل إنشاء الشخصية',
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'تم إنشاء الشخصية بنجاح',
        data: newCharacter,
      });

      logger.info('Character created successfully', { characterId: newCharacter.id, projectId: validatedData.projectId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'بيانات غير صالحة',
          details: error.issues,
        });
        return;
      }

      logger.error('Create character error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ أثناء إنشاء الشخصية',
      });
    }
  }

  // Update a character
  async updateCharacter(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'غير مصرح',
        });
        return;
      }

      const { id } = req.params;
      const validatedData = updateCharacterSchema.parse(req.body);

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'معرف الشخصية مطلوب',
        });
        return;
      }

      // Check if character exists
      const [existingCharacter] = await db
        .select()
        .from(characters)
        .where(eq(characters.id, id));

      if (!existingCharacter) {
        res.status(404).json({
          success: false,
          error: 'الشخصية غير موجودة',
        });
        return;
      }

      // Verify project belongs to user
      const [project] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, existingCharacter.projectId), eq(projects.userId, req.user.id)));

      if (!project) {
        res.status(403).json({
          success: false,
          error: 'غير مصرح لتعديل هذه الشخصية',
        });
        return;
      }

      const [updatedCharacter] = await db
        .update(characters)
        .set(validatedData)
        .where(eq(characters.id, id))
        .returning();

      res.json({
        success: true,
        message: 'تم تحديث الشخصية بنجاح',
        data: updatedCharacter,
      });

      logger.info('Character updated successfully', { characterId: id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'بيانات غير صالحة',
          details: error.issues,
        });
        return;
      }

      logger.error('Update character error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ أثناء تحديث الشخصية',
      });
    }
  }

  // Delete a character
  async deleteCharacter(req: AuthRequest, res: Response): Promise<void> {
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
          error: 'معرف الشخصية مطلوب',
        });
        return;
      }

      // Check if character exists
      const [existingCharacter] = await db
        .select()
        .from(characters)
        .where(eq(characters.id, id));

      if (!existingCharacter) {
        res.status(404).json({
          success: false,
          error: 'الشخصية غير موجودة',
        });
        return;
      }

      // Verify project belongs to user
      const [project] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, existingCharacter.projectId), eq(projects.userId, req.user.id)));

      if (!project) {
        res.status(403).json({
          success: false,
          error: 'غير مصرح لحذف هذه الشخصية',
        });
        return;
      }

      await db.delete(characters).where(eq(characters.id, id));

      res.json({
        success: true,
        message: 'تم حذف الشخصية بنجاح',
      });

      logger.info('Character deleted successfully', { characterId: id });
    } catch (error) {
      logger.error('Delete character error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ أثناء حذف الشخصية',
      });
    }
  }
}

export const charactersController = new CharactersController();
