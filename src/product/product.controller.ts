import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { QueryProductDto } from './dto/query-product.dto';
import { currentUser } from 'src/auth/decorators/current-user.decorator';
import { use } from 'passport';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /*************************************************************************************
   * 상품 등록 API
   * ***********************************************************************************
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createProductDto: CreateProductDto,
    //@Req() req: Request & { user: { userId: string } },
    @currentUser('userId') userId: string,
  ) {
    return this.productService.createProduct(createProductDto, userId);
  }

  /*************************************************************************************
   * 상품 목록 조회 API
   * ***********************************************************************************
   */
  @Get()
  async findAll(
    // @Query(new ValidationPipe({ transform: true })) query: ProductQueryDto,
    // main.ts 에서 ValidationPipe를 글로벌로 설정했기 때문에 아래와 같이 사용 가능
    @Query() query: QueryProductDto,
  ) {
    return this.productService.getProducts(query);
  }

  /*************************************************************************************
   * 상품 상세 조회 API
   * ***********************************************************************************
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @currentUser('userId') userId: string,
  ) {
    return this.productService.getProductById(id, userId);
    //return this.productService.findOne(id);
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
