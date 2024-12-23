import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description?: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags: string[];
}
