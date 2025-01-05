import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserRepository {
  private readonly user: PrismaService['user'];
  constructor(private readonly prisma: PrismaService) {
    this.user = prisma.user;
  }

  async findMany(): Promise<User[]> {
    return this.user.findMany({});
  }

  async findById(id: string): Promise<User | null> {
    return this.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserDto): Promise<User> {
    return this.user.create({ data });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<User> {
    return this.user.delete({ where: { id } });
  }
}
