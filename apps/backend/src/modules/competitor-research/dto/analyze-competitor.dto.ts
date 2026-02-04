import { IsString, IsUrl, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyzeCompetitorDto {
  @ApiProperty({
    description: 'URL of the competitor website to analyze',
    example: 'https://example.com/page',
  })
  @IsUrl({ require_protocol: true }, { message: 'Please enter a valid URL including http:// or https://' })
  url: string;

  @ApiPropertyOptional({
    description: 'URL of your own website for side-by-side comparison',
    example: 'https://mywebsite.com/page',
  })
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'Please enter a valid URL for comparison' })
  compareUrl?: string;
}

export class CompareWebsitesDto {
  @ApiProperty({
    description: 'URL of the first website',
    example: 'https://website1.com',
  })
  @IsUrl({ require_protocol: true })
  url1: string;

  @ApiProperty({
    description: 'URL of the second website',
    example: 'https://website2.com',
  })
  @IsUrl({ require_protocol: true })
  url2: string;
}
