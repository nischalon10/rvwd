import { Controller, Get, Post, Body, Param, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ResponsesService } from './responses.service';
import {
  CreateResponseDto,
  ResponseDto,
  SubmitResponseResponseDto,
} from './dto/responses.dto';

@Controller('responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post('submit')
  async submitResponse(
    @Body() createResponseDto: CreateResponseDto,
    @Req() req: Request,
  ): Promise<SubmitResponseResponseDto> {
    // Add user agent from request (removed IP address)
    const enrichedDto = {
      ...createResponseDto,
      userAgent: req.get('User-Agent'),
    };

    return this.responsesService.submitResponse(enrichedDto);
  }

  @Get()
  findAll(@Query('formId') formId?: string): Promise<ResponseDto[]> {
    return this.responsesService.findAll(formId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ResponseDto> {
    return this.responsesService.findOne(id);
  }

  @Get('form/:formId')
  findByForm(@Param('formId') formId: string): Promise<ResponseDto[]> {
    return this.responsesService.findByForm(formId);
  }
}
