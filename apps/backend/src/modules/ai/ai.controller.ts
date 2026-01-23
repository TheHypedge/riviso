import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { AiPromptDto } from './dto/ai-prompt.dto';

@ApiTags('AI Chat')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send message to AI assistant' })
  async chat(@Body() promptDto: AiPromptDto, @Request() req: any) {
    return this.aiService.processPrompt(promptDto, req.user.id);
  }

  @Get('sessions/:userId')
  @ApiOperation({ summary: 'Get chat sessions for user' })
  async getSessions(@Param('userId') userId: string) {
    return this.aiService.getSessions(userId);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get chat session details' })
  async getSession(@Param('sessionId') sessionId: string) {
    return this.aiService.getSession(sessionId);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get available prompt templates' })
  async getTemplates() {
    return this.aiService.getTemplates();
  }
}
