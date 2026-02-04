import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum InputType {
  KEYWORD = 'keyword',
  TOPIC = 'topic',
  URL = 'url',
  CONTENT = 'content',
}

export enum AnalysisDepth {
  QUICK = 'quick',
  STANDARD = 'standard',
  DEEP = 'deep',
}

export class AnalyzeKeywordDto {
  @ApiProperty({
    description: 'The keyword, topic, URL, or content to analyze',
    example: 'best project management software',
  })
  @IsString()
  @IsNotEmpty({ message: 'Input is required' })
  input: string;

  @ApiProperty({
    description: 'Type of input being analyzed',
    enum: InputType,
    example: InputType.KEYWORD,
  })
  @IsEnum(InputType)
  inputType: InputType;

  @ApiPropertyOptional({
    description: 'Include user question clusters',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeQuestions?: boolean = true;

  @ApiPropertyOptional({
    description: 'Include topic map visualization data',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  includeTopicMap?: boolean = false;

  @ApiPropertyOptional({
    description: 'Generate content brief',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  generateBrief?: boolean = false;

  @ApiPropertyOptional({
    description: 'Include competitor content analysis',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  competitorAnalysis?: boolean = true;

  @ApiPropertyOptional({
    description: 'Analysis depth',
    enum: AnalysisDepth,
    default: AnalysisDepth.STANDARD,
  })
  @IsOptional()
  @IsEnum(AnalysisDepth)
  depth?: AnalysisDepth = AnalysisDepth.STANDARD;
}

export class GenerateBriefDto {
  @ApiProperty({
    description: 'Target keyword for the content brief',
    example: 'project management best practices',
  })
  @IsString()
  @IsNotEmpty()
  keyword: string;

  @ApiPropertyOptional({
    description: 'Specific content angle or focus',
    example: 'For remote teams',
  })
  @IsOptional()
  @IsString()
  angle?: string;
}

export class GenerateFaqDto {
  @ApiProperty({
    description: 'Topic for FAQ generation',
    example: 'SEO optimization',
  })
  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiPropertyOptional({
    description: 'Maximum number of FAQs to generate',
    default: 10,
  })
  @IsOptional()
  maxItems?: number = 10;
}

export class GenerateEditorialPlanDto {
  @ApiProperty({
    description: 'Main topic or keyword focus',
    example: 'digital marketing',
  })
  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiPropertyOptional({
    description: 'Number of content items to plan',
    default: 10,
  })
  @IsOptional()
  itemCount?: number = 10;

  @ApiPropertyOptional({
    description: 'Planning timeframe in weeks',
    default: 4,
  })
  @IsOptional()
  timeframeWeeks?: number = 4;
}
