import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { IntegrationProvider } from '@riviso/shared-types';

const PROVIDERS: IntegrationProvider[] = [
  'google_search_console',
  'google_ads',
  'meta',
  'google_analytics',
  'google_tag_manager',
];

function isProvider(s: string): s is IntegrationProvider {
  return PROVIDERS.includes(s as IntegrationProvider);
}

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getCurrentUser(@Request() req: { user: { id: string } }) {
    return this.userService.findById(req.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update profile (name, email, phone, avatar)' })
  async updateProfile(
    @Request() req: { user: { id: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  @Post('me/change-password')
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @Request() req: { user: { id: string } },
    @Body() dto: ChangePasswordDto,
  ) {
    await this.userService.changePassword(req.user.id, dto);
    return { success: true };
  }

  @Post('me/complete-onboarding')
  @ApiOperation({ summary: 'Mark onboarding as completed' })
  async completeOnboarding(@Request() req: { user: { id: string } }) {
    await this.userService.completeOnboarding(req.user.id);
    return { success: true };
  }

  @Get('me/website-limit')
  @ApiOperation({ summary: 'Check if user can add more websites' })
  checkWebsiteLimit(@Request() req: { user: { id: string } }) {
    return this.userService.canAddWebsite(req.user.id);
  }

  @Get('me/integrations')
  @ApiOperation({ summary: 'List connected integrations' })
  getIntegrations(@Request() req: { user: { id: string } }) {
    return { integrations: this.userService.getIntegrations(req.user.id) };
  }

  @Post('me/integrations/:provider/connect')
  @ApiOperation({ summary: 'Mark integration as connected' })
  connectIntegration(
    @Request() req: { user: { id: string } },
    @Param('provider') provider: string,
    @Body() body: { externalId?: string },
  ) {
    if (!isProvider(provider)) throw new BadRequestException('Invalid provider');
    this.userService.connectIntegration(req.user.id, provider, body?.externalId);
    return { success: true, provider };
  }

  @Delete('me/integrations/:provider')
  @ApiOperation({ summary: 'Disconnect integration' })
  disconnectIntegration(
    @Request() req: { user: { id: string } },
    @Param('provider') provider: string,
  ) {
    if (!isProvider(provider)) throw new BadRequestException('Invalid provider');
    this.userService.disconnectIntegration(req.user.id, provider);
    return { success: true, provider };
  }
}
