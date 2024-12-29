import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  UpdateProductDto,
  UpdateProductWithImagesDto,
} from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { QueryProductDto } from './dto/query-product.dto';
import { currentUser } from 'src/auth/decorators/current-user.decorator';
import { ProductOwnerGuard } from './guards/product-owner.guards';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';
import { ConfigService } from '@nestjs/config';

@Controller('products')
export class ProductController {
  // 업로드 가능한 이미지 최대 개수
  private static readonly MAX_IMAGE_COUNT = 5;

  constructor(
    private readonly productService: ProductService,
    private readonly configService: ConfigService,
  ) {}

  /***************************************************************************
   * 상품 등록 API
   * *************************************************************************
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor(
      'images',
      ProductController.MAX_IMAGE_COUNT,
      new UploadService().getFileInterceptorOptions(),
    ),
  )
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @currentUser('userId') userId: string,
  ) {
    console.log('Request Body:', createProductDto);
    console.log('Uploaded File:', files); // 업로드된 파일 정보 출력

    const serverUrl = this.configService.get('SERVER_URL');

    const imageUrls = files.map(
      (file) => `${serverUrl}/uploads/images/${file.filename}`,
    );

    const productWithImage = {
      ...createProductDto,
      images: imageUrls.length > 0 ? imageUrls : createProductDto.images,
    };
    return this.productService.createProduct(productWithImage, userId);
  }

  /***************************************************************************
   * 상품 목록 조회 API
   * *************************************************************************
   */
  @Get()
  async findAll(
    // @Query(new ValidationPipe({ transform: true })) query: ProductQueryDto,
    // main.ts 에서 ValidationPipe를 글로벌로 설정했기 때문에 아래와 같이 사용 가능
    @Query() query: QueryProductDto,
  ) {
    return this.productService.getProducts(query);
  }

  /***************************************************************************
   * 상품 상세 조회 API
   * *************************************************************************
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

  /***************************************************************************
   * 상품 정보 수정 API
   * *************************************************************************
   */
  @Patch(':id')
  @UseGuards(ProductOwnerGuard)
  @UseInterceptors(
    FilesInterceptor(
      'images',
      ProductController.MAX_IMAGE_COUNT,
      new UploadService().getFileInterceptorOptions(),
    ),
  )
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UpdateProductWithImagesDto,
  ) {
    const serverUrl = this.configService.get<string>('SERVER_URL');

    // 업로드된 새 이미지 URL 생성
    const uploadedUrls = files.map(
      (file) => `${serverUrl}/uploads/images/${file.filename}`,
    );

    // 기존 이미지 URL
    const existingImages = body.existingImages
      ? JSON.parse(body.existingImages)
      : [];

    // 제거된 이미지 URL (string -> array 변환)
    const removedImages = body.removedImages
      ? JSON.parse(body.removedImages)
      : [];

    // 기존 이미지에서 제거된 이미지를 제외
    const finalImages = existingImages.filter(
      (img: string) => !removedImages.includes(img),
    );

    // 최종 이미지 리스트: 기존 이미지(필터링) + 새 이미지
    const mergedImages = [...finalImages, ...uploadedUrls];

    const updatedProductData = {
      ...body,
      images: mergedImages, // 병합된 이미지 URL
    };

    return this.productService.updateProduct(id, updatedProductData);
  }

  /***************************************************************************
   * 상품 삭제 API
   * *************************************************************************
   */
  @Delete(':id')
  @UseGuards(ProductOwnerGuard)
  async remove(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
