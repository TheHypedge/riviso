import { IsUrl } from 'class-validator';

export class OffPageCrawlDto {
  @IsUrl({}, { message: 'Please provide a valid URL' })
  url: string;
}
