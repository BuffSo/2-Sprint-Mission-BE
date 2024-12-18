import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcript from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // 민감한 데이터 필터링 함수
  public filterSensitiveUserData(user: User) {
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const { email, nickname, password } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcript.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        nickname,
        password: hashedPassword,
      },
    });
    return this.filterSensitiveUserData(user);
  }

  async findAll() {
    return await this.prisma.user.findMany({
      select: { id: true, email: true, nickname: true },
    });
  }

  async getByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('요청하신 사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nickname: true,
        image: true,
        updatedAt: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('요청하신 사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('요청하신 id의 사용자를 찾을 수 없습니다.');
    }

    // 비밀번호 해싱 처리
    const updatedData = {
      ...updateUserDto,
      ...(updateUserDto.password && {
        password: await bcript.hash(updateUserDto.password, 10),
      }),
    };

    // Prisma 부분 업데이트
    return await this.prisma.user.update({
      where: { id },
      data: updatedData,
      select: {
        id: true,
        email: true,
        nickname: true,
        image: true,
        updatedAt: true,
      },
    });
  }
}
