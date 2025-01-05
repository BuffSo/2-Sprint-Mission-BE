import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
//import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  //imports: [PrismaModule],        // PrismaModule을 global로 설정했기 때문에 생략 가능
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
