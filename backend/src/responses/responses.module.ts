import { Module } from '@nestjs/common';
import { ResponsesController } from './responses.controller';
import { ResponsesService } from './responses.service';
import { PrismaService } from '../prisma.service';
import { OpenAIModule } from '../openai/openai.module';

@Module({
  imports: [OpenAIModule],
  controllers: [ResponsesController],
  providers: [ResponsesService, PrismaService],
})
export class ResponsesModule {}
