import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class UpdateProductWithImagesDto extends UpdateProductDto {
  @IsOptional()
  @IsString()
  existingImages?: string; // 직렬화된 기존 이미지

  @IsOptional()
  @IsString() // string으로 받아서 서버에서 JSON.parse() 처리
  removedImages?: string;
}
