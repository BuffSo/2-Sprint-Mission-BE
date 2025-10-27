// src/upload/upload.service.ts
import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class UploadService {
  getFileInterceptorOptions() {
    return {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (
        req: any,
        file: { mimetype: string },
        callback: (arg0: HttpException, arg1: boolean) => void,
      ) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new HttpException(
              '이미지 파일만 업로드할 수 있습니다!',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB 제한
      },
    };
  }
}
