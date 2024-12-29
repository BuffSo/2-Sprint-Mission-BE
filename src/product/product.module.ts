import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { UploadModule } from '../upload/upload.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [UploadModule, LoggerModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
