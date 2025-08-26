import { Module } from '@nestjs/common';
import { ResponsesController } from './responses.controller';
import { ResponsesService } from './responses.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ResponsesController],
  providers: [ResponsesService, PrismaService],
})
export class ResponsesModule {}
