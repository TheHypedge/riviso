import { Injectable, NotFoundException } from '@nestjs/common';
// Commented out for demo without database
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { ProjectEntity } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project, ProjectStats, Status } from '@riviso/shared-types';

@Injectable()
export class ProjectService {
  // In-memory mock projects
  private mockProjects: Map<string, Project> = new Map();

  constructor(
    // @InjectRepository(ProjectEntity)
    // private projectRepository: Repository<ProjectEntity>,
  ) {
    // Initialize with demo project
    const demoProject: Project = {
      id: 'project-demo-123',
      workspaceId: 'workspace-demo',
      name: 'Demo Website',
      domain: 'https://demo.riviso.com',
      status: Status.ACTIVE,
      integrations: {},
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.mockProjects.set(demoProject.id, demoProject);
  }

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    const project: Project = {
      id: `project-${Date.now()}`,
      workspaceId: createProjectDto.workspaceId || `workspace-${userId}`,
      name: createProjectDto.name,
      domain: createProjectDto.domain,
      status: Status.ACTIVE,
      integrations: {},
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.mockProjects.set(project.id, project);
    return project;
  }

  async findAll(userId: string): Promise<Project[]> {
    return Array.from(this.mockProjects.values());
  }

  async findOne(id: string): Promise<Project> {
    const project = this.mockProjects.get(id);
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async getStats(id: string): Promise<ProjectStats> {
    // Mock implementation
    return {
      totalKeywords: 150,
      averageRank: 12.5,
      organicTraffic: 5420,
      conversions: 89,
      lastUpdated: new Date().toISOString(),
    };
  }
}
