import { IsString, IsOptional, IsUUID } from 'class-validator';

export class SelectGscPropertyDto {
  @IsString()
  googleAccountId: string;

  @IsString()
  propertyUrl: string;

  @IsOptional()
  @IsUUID()
  websiteId?: string;
}
