import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '@prisma/client';
import { AuthService } from '../auth/auth.service.js';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @Roles(Role.DIRECTOR)
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.createProject(createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectService.getAllProjects();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.getProject(id);
  }

  @Patch(':id')
  @Roles(Role.DIRECTOR)
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.updateProject(id, updateProjectDto);
  }

  @Post(':id/generate-qr')
  @Roles(Role.DIRECTOR)
  async generateQR(@Param('id') id: string) {
    const qrCode = await this.authService.generateQRCode(id);
    const token = await this.authService.generateQRToken(id);

    return {
      qr_code: qrCode,
      token,
      expires_in: '5 minutes',
    };
  }
}
