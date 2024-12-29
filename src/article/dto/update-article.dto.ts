import { PartialType } from '@nestjs/mapped-types';
import { CreateArticleDto } from './create-article.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {}

export class UpdateArticleWithImagesDto extends UpdateArticleDto {
  @IsOptional()
  @IsString()
  existingImages?: string; // 직렬화된 기존 이미지

  @IsOptional()
  @IsString() // string으로 받아서 서버에서 JSON.parse() 처리
  removedImages?: string;
}
