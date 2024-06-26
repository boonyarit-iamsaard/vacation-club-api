import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from 'nestjs-prisma';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const generatedPassword = this.generatePassword();
    const hashedPassword = await argon2.hash(generatedPassword);
    // TODO: send an email to the user with the generated password
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: {
        id,
        deletedAt: null,
      },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: null,
      },
    });
  }

  private generatePassword(
    length: number = 8,
    includeNumber: boolean = true,
    includeSpecial: boolean = true,
  ) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let password = '';
    let charSource = '';

    if (includeNumber) {
      charSource += '0123456789';
    }
    if (includeSpecial) {
      charSource += '!@#$%^&*()_+=-';
    }
    charSource += charset;

    for (let i = 0; i < length; i++) {
      const randomNumber = Math.floor(Math.random() * charSource.length);
      password += charSource[randomNumber];
    }
    return password;
  }
}
