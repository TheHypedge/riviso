import { IsUrl, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyzePageDto {
  @ApiProperty({
    description: 'URL of the page to analyze for CRO opportunities',
    example: 'https://example.com',
  })
  @IsUrl({}, { message: 'Please provide a valid URL' })
  url: string;
}

export class AnalyzePageIntelligenceDto {
  @ApiPropertyOptional({
    description: 'URL of the page to analyze. If not provided, uses the selected website.',
    example: 'https://example.com',
  })
  @IsOptional()
  @ValidateIf((o) => !o.websiteId) // Only validate if websiteId is not provided
  @IsUrl({}, { message: 'Please provide a valid URL' })
  url?: string;

  @ApiPropertyOptional({
    description: 'Website URL or ID to analyze. Can be a full URL.',
    example: 'https://example.com',
  })
  @IsOptional()
  @ValidateIf((o) => !o.url) // Only validate if url is not provided
  @IsString({ message: 'Please provide a website URL or ID' })
  websiteId?: string;
}
