import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  images: string[];

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  tags: string[];
}
