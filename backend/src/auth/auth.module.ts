import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AuthController],
  providers: [GoogleStrategy, PrismaService],
})
export class AuthModule {}