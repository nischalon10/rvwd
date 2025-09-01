import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, StrategyOptions } from 'passport-google-oauth20';
import { PrismaService } from '../prisma.service'; // adjust path if needed

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private prisma: PrismaService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function
  ) {
    const email = profile.emails[0].value;
    const name = profile.displayName;

    // Upsert user in Prisma
    const user = await this.prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name },
    });

    done(null, user);
  }
}