import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SendVerificationCodeDto } from './dto/send-verification-code.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { UserRepository } from './user.repository';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private redisService: RedisService,
    private emailService: EmailService,
  ) {}

  // 민감한 데이터 필터링 함수
  public filterSensitiveUserData(user: User) {
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      image: user.image,
      password: user.password ? true : false, // 비밀번호 존재 여부만 전달
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

  /**
   * 인증 코드 발송
   */
  async sendVerificationCode(
    userId: string,
    dto: SendVerificationCodeDto,
  ): Promise<{ message: string }> {
    // 사용자 조회
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 이메일이 사용자 본인의 이메일인지 확인
    if (user.email !== dto.email) {
      throw new BadRequestException('본인의 이메일만 사용할 수 있습니다.');
    }

    // 타입별 유효성 검사
    if (dto.type === 'password-setup' && user.password) {
      throw new BadRequestException(
        '이미 비밀번호가 설정되어 있습니다. 비밀번호 변경을 이용해주세요.',
      );
    }

    if (dto.type === 'password-reset' && !user.password) {
      throw new BadRequestException(
        '비밀번호가 설정되지 않은 계정입니다. 비밀번호 설정을 이용해주세요.',
      );
    }

    // 6자리 인증 코드 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Redis에 저장 (10분 TTL)
    await this.redisService.setVerificationCode(dto.email, dto.type, code);

    // 이메일 발송
    await this.emailService.sendVerificationCode(dto.email, code, dto.type);

    return {
      message: '인증 코드가 이메일로 발송되었습니다. (유효시간: 10분)',
    };
  }

  /**
   * 비밀번호 변경/설정
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    // 사용자 조회 (비밀번호 포함)
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 인증 코드 검증
    const type = user.password ? 'password-reset' : 'password-setup';
    const isValid = await this.redisService.verifyAndDeleteCode(
      user.email,
      type,
      dto.verificationCode,
    );

    if (!isValid) {
      throw new BadRequestException(
        '인증 코드가 올바르지 않거나 만료되었습니다.',
      );
    }

    // 현재 비밀번호 확인 (비밀번호 변경인 경우)
    if (user.password) {
      if (!dto.currentPassword) {
        throw new BadRequestException('현재 비밀번호를 입력해주세요.');
      }

      const isPasswordValid = await bcrypt.compare(
        dto.currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('현재 비밀번호가 올바르지 않습니다.');
      }
    }

    // 새 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // 비밀번호 업데이트
    await this.userRepository.update(userId, {
      password: hashedPassword,
    });

    // 알림 이메일 발송
    await this.emailService.sendPasswordChangeNotification(
      user.email,
      user.password ? 'change' : 'setup',
    );

    return {
      message: user.password
        ? '비밀번호가 성공적으로 변경되었습니다.'
        : '비밀번호가 성공적으로 설정되었습니다.',
    };
  }
}
