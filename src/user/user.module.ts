import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
//import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  //imports: [PrismaModule],        // PrismaModule을 global로 설정했기 때문에 생략 가능
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
