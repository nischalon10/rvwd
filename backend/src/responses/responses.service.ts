import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OpenAIService } from '../openai/openai.service';
import {
  CreateResponseDto,
  ResponseDto,
  SubmitResponseResponseDto,
} from './dto/responses.dto';

@Injectable()
export class ResponsesService {
  constructor(
    private prisma: PrismaService,
    private openAIService: OpenAIService,
  ) {}

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

    // Process the transcript through OpenAI
    let extractedData: Record<string, any>;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      extractedData = await this.openAIService.extractDataFromTranscript({
        transcript: createResponseDto.transcript,
        formId: form.id,
        formTitle: form.title,
        formQuestion: form.question,
        extractionSchema: form.extractionSchema,
      });

      // Add processing metadata
      extractedData = {
        ...extractedData,
        processedAt: new Date().toISOString(),
        wordCount: createResponseDto.transcript.split(' ').length,
        aiProcessed: true,
      };
    } catch (error) {
      // If OpenAI processing fails, log the error and continue with fallback
      console.error('OpenAI processing failed:', error);
      extractedData = {
        processed: false,
        error: 'AI processing failed',
        timestamp: new Date().toISOString(),
        wordCount: createResponseDto.transcript.split(' ').length,
        fallback: true,
      };
    }

    // Create the response record
    const response = await this.prisma.response.create({
      data: {
        formId: createResponseDto.formId,
        transcript: createResponseDto.transcript,
        extractedData: extractedData,
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
