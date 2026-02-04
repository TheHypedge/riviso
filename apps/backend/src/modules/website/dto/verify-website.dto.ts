import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartVerificationDto {
  @ApiProperty({
    description: 'Verification method',
    enum: ['dns', 'meta'],
    example: 'dns',
  })
  @IsEnum(['dns', 'meta'])
  method: 'dns' | 'meta';
}

export class MapGscPropertyDto {
  @ApiProperty({
    description: 'GSC property URL (e.g., sc-domain:example.com or https://example.com)',
    example: 'sc-domain:example.com',
  })
  @IsString()
  gscPropertyUrl: string;
}
