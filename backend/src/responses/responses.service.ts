import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateResponseDto,
  ResponseDto,
  SubmitResponseResponseDto,
} from './dto/responses.dto';

@Injectable()
export class ResponsesService {
  constructor(private prisma: PrismaService) {}

  async submitResponse(
    createResponseDto: CreateResponseDto,
  ): Promise<SubmitResponseResponseDto> {
    const startTime = Date.now();

    // First, verify the form exists and is active
    const form = await this.prisma.form.findUnique({
      where: { id: createResponseDto.formId },
    });

    if (!form) {
      throw new NotFoundException(
        `Form with ID ${createResponseDto.formId} not found`,
      );
    }

    if (!form.isActive) {
      throw new BadRequestException(
        'This form is no longer accepting responses',
      );
    }

    // For now, create a mock extracted data (we'll add AI processing later)
    const mockExtractedData = {
      processed: true,
      timestamp: new Date().toISOString(),
      wordCount: createResponseDto.transcript.split(' ').length,
      // In real implementation, this will be AI-extracted based on form.extractionSchema
      mockData: {
        sentiment: 'neutral',
        keyTopics: ['product', 'feedback'],
        score: Math.floor(Math.random() * 10) + 1, // Random score for testing
      },
    };

    // Create the response record
    const response = await this.prisma.response.create({
      data: {
        formId: createResponseDto.formId,
        transcript: createResponseDto.transcript,
        extractedData: mockExtractedData,
        metadata: createResponseDto.metadata || {},
        userAgent: createResponseDto.userAgent,
      },
    });

    const processingTime = Date.now() - startTime;

    return {
      id: response.id,
      transcript: response.transcript,
      extractedData: response.extractedData,
      message: 'Response submitted and processed successfully',
      processingTime,
    };
  }

  async findAll(formId?: string): Promise<ResponseDto[]> {
    const where = formId ? { formId } : {};

    const responses = await this.prisma.response.findMany({
      where,
      include: {
        form: {
          select: {
            id: true,
            title: true,
            question: true,
            extractionSchema: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return responses;
  }

  async findOne(id: string): Promise<ResponseDto> {
    const response = await this.prisma.response.findUnique({
      where: { id },
      include: {
        form: {
          select: {
            id: true,
            title: true,
            question: true,
            extractionSchema: true,
          },
        },
      },
    });

    if (!response) {
      throw new NotFoundException(`Response with ID ${id} not found`);
    }

    return response;
  }

  async findByForm(formId: string): Promise<ResponseDto[]> {
    // Verify form exists
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException(`Form with ID ${formId} not found`);
    }

    return this.findAll(formId);
  }
}
