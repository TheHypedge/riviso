import { IsString, IsOptional, IsArray, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GscDimension } from '@riviso/shared-types';

export class GscQueryDto {
  @ApiProperty({ description: 'Website ID to map to GSC property' })
  @IsString()
  websiteId: string;

  @ApiProperty({ description: 'Start date (YYYY-MM-DD)', example: '2026-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date (YYYY-MM-DD)', example: '2026-01-25' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ 
    description: 'Dimensions to group by',
    enum: GscDimension,
    isArray: true,
    example: [GscDimension.DATE, GscDimension.QUERY]
  })
  @IsOptional()
  @IsArray()
  @IsEnum(GscDimension, { each: true })
  dimensions?: GscDimension[];

  @ApiPropertyOptional({ description: 'Filter by query (exact match)' })
  @IsOptional()
  @IsString()
  queryFilter?: string;

  @ApiPropertyOptional({ description: 'Filter by page URL (contains)' })
  @IsOptional()
  @IsString()
  pageFilter?: string;

  @ApiPropertyOptional({ description: 'Filter by country code (ISO 3166-1 alpha-2)' })
  @IsOptional()
  @IsString()
  countryFilter?: string;

  @ApiPropertyOptional({ description: 'Filter by device type', enum: ['DESKTOP', 'MOBILE', 'TABLET'] })
  @IsOptional()
  @IsEnum(['DESKTOP', 'MOBILE', 'TABLET'])
  deviceFilter?: string;

  @ApiPropertyOptional({ description: 'Filter by search appearance type' })
  @IsOptional()
  @IsString()
  searchAppearanceFilter?: string;

  @ApiPropertyOptional({ description: 'Minimum position filter', minimum: 1, maximum: 100 })
  @IsOptional()
  @Min(1)
  @Max(100)
  minPosition?: number;

  @ApiPropertyOptional({ description: 'Maximum position filter', minimum: 1, maximum: 100 })
  @IsOptional()
  @Min(1)
  @Max(100)
  maxPosition?: number;

  @ApiPropertyOptional({ description: 'Minimum CTR threshold (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @Min(0)
  @Max(100)
  minCtr?: number;

  @ApiPropertyOptional({ description: 'Minimum impressions', minimum: 0 })
  @IsOptional()
  @Min(0)
  minImpressions?: number;

  @ApiPropertyOptional({ description: 'Row limit (max 25000)', default: 1000, minimum: 1, maximum: 25000 })
  @IsOptional()
  @Min(1)
  @Max(25000)
  rowLimit?: number;
}
