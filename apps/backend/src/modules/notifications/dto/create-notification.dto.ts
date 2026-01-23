import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ example: 'user-123' })
  @IsString()
  userId: string;

  @ApiProperty({
    example: 'ranking_change',
    enum: ['ranking_change', 'seo_alert', 'cro_insight', 'system'],
  })
  @IsEnum(['ranking_change', 'seo_alert', 'cro_insight', 'system'])
  type: string;

  @ApiProperty({ example: 'Keyword ranking improved' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Your keyword moved from #5 to #3' })
  @IsString()
  message: string;

  @ApiProperty({ required: false, example: ['email', 'in_app'] })
  @IsOptional()
  @IsArray()
  channels?: string[];
}
