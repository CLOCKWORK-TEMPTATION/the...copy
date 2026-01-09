import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import * as crypto from 'crypto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async createProject(createProjectDto: CreateProjectDto) {
    // Generate a unique access token secret for the project
    const access_token_secret = crypto.randomBytes(32).toString('hex');

    return this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        budget_config: createProjectDto.budget_config,
        active_location: createProjectDto.active_location,
        access_token_secret,
      },
    });
  }

  async getProject(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            role: true,
            created_at: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Don't expose the access token secret
    const { access_token_secret, ...projectData } = project;
    return projectData;
  }

  async updateProject(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
    });
  }

  async getAllProjects() {
    const projects = await this.prisma.project.findMany({
      select: {
        id: true,
        name: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: { users: true },
        },
      },
    });

    return projects;
  }
}
