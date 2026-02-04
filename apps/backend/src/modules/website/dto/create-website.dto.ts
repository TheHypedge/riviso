import { IsString, IsUrl, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWebsiteDto {
  @ApiProperty({
    description: 'Website URL (e.g., https://example.com or example.com)',
    example: 'https://example.com',
  })
  @IsString()
  @IsUrl({ require_protocol: false })
  url: string;

  @ApiPropertyOptional({
    description: 'Website name (defaults to domain)',
    example: 'My Website',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Workspace ID (optional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  workspaceId?: string;
}
