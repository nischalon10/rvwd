import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { FormsModule } from './forms/forms.module';
import { ResponsesModule } from './responses/responses.module';

@Module({
  imports: [FormsModule, ResponsesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
