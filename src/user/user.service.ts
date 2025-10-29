import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

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

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 해싱 (password가 제공된 경우에만)
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const user = await this.userRepository.create({
      email,
      nickname,
      password: hashedPassword,
    });

    return this.filterSensitiveUserData(user);
  }

  async findAll() {
    return await this.userRepository.findMany();
  }

  async getById(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('요청하신 사용자를 찾을 수 없습니다.');
    }

    return this.filterSensitiveUserData(user);
  }

  async getByEmail(email: string, includeSensitive = false) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException('요청하신 사용자를 찾을 수 없습니다.');
    }

    return includeSensitive ? user : this.filterSensitiveUserData(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException('요청하신 id의 사용자를 찾을 수 없습니다.');
    }

    // 비밀번호 해싱 처리
    const updatedData = {
      ...updateUserDto,
      ...(updateUserDto.password && {
        password: await bcrypt.hash(updateUserDto.password, 10),
      }),
    };

    const updatedUser = await this.userRepository.update(id, updatedData);

    return this.filterSensitiveUserData(updatedUser);
  }
}
