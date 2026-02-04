import { Controller, Get, Delete, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '@riviso/shared-types';
import { Request } from '@nestjs/common';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly authService: AuthService) {}

  private checkAdminAccess(user: { id: string; role?: UserRole }): void {
    const fullUser = this.authService.findById(user.id);
    if (!fullUser || fullUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'System statistics' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getSystemStats(@Request() req: { user: { id: string; role?: UserRole } }) {
    this.checkAdminAccess(req.user);
    return this.authService.getSystemStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getAllUsers(@Request() req: { user: { id: string; role?: UserRole } }) {
    this.checkAdminAccess(req.user);
    return this.authService.getAllUsers();
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user (admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deleteUser(
    @Request() req: { user: { id: string; role?: UserRole } },
    @Param('id') userId: string,
  ) {
    this.checkAdminAccess(req.user);
    return this.authService.deleteUser(userId);
  }
}
