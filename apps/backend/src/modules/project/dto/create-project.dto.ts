import { IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'My Website' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'example.com' })
  @IsString()
  domain: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  workspaceId?: string;
}
