import { IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePreferencesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  email?: {
    enabled: boolean;
    rankingChanges?: boolean;
    seoAlerts?: boolean;
    croInsights?: boolean;
    weeklyReport?: boolean;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  slack?: {
    enabled: boolean;
    webhookUrl?: string;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  inApp?: {
    enabled: boolean;
  };
}
