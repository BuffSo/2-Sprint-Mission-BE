import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { ProductQueryDto as QueryProductDto } from './dto/query-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request & { user: { userId: string } },
  ) {
    const userId = req.user.userId;
    console.log('userId', userId);
    return this.productService.createProduct(createProductDto, userId);
  }

  @Get()
  async findAll(
    // @Query(new ValidationPipe({ transform: true })) query: ProductQueryDto,
    // main.ts 에서 ValidationPipe를 글로벌로 설정했기 때문에 아래와 같이 사용 가능
    @Query() query: QueryProductDto,
  ) {
    return this.productService.getProducts(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.productService.remove(id);
  // }
}
