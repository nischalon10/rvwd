import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findIdByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? { userId: user.id } : { error: 'User not found' };
  }
}