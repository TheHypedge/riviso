import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConnectIntegrationDto {
  @ApiProperty({ example: 'project-123' })
  @IsString()
  projectId: string;

  @ApiProperty({
    example: 'google_analytics',
    enum: ['google_analytics', 'google_search_console', 'openai', 'anthropic'],
  })
  @IsEnum([
    'google_analytics',
    'google_search_console',
    'openai',
    'anthropic',
  ])
  integrationType: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  credentials?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  config?: any;
}
