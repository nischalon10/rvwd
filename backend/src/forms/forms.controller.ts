import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto, UpdateFormDto, FormResponseDto } from './dto/forms.dto';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  create(@Body() createFormDto: CreateFormDto): Promise<FormResponseDto> {
    return this.formsService.create(createFormDto);
  }

  @Get()
  findAll(@Query('ownerId') ownerId?: string): Promise<FormResponseDto[]> {
    return this.formsService.findAll(ownerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<FormResponseDto> {
    return this.formsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFormDto: UpdateFormDto,
  ): Promise<FormResponseDto> {
    return this.formsService.update(id, updateFormDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.formsService.remove(id);
  }

  @Get('owner/:ownerId')
  findByOwner(@Param('ownerId') ownerId: string): Promise<FormResponseDto[]> {
    return this.formsService.findByOwner(ownerId);
  }
}
