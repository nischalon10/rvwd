import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFormDto, UpdateFormDto, FormResponseDto } from './dto/forms.dto';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  async create(createFormDto: CreateFormDto): Promise<FormResponseDto> {
    const form = await this.prisma.form.create({
      data: createFormDto,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    return form;
  }

  async findAll(ownerId?: string): Promise<FormResponseDto[]> {
    const where = ownerId ? { ownerId } : {};
    
    const forms = await this.prisma.form.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return forms;
  }

  async findOne(id: string): Promise<FormResponseDto> {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException(`Form with ID ${id} not found`);
    }

    return form;
  }

  async update(
    id: string,
    updateFormDto: UpdateFormDto,
  ): Promise<FormResponseDto> {
    try {
      const form = await this.prisma.form.update({
        where: { id },
        data: updateFormDto,
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          _count: {
            select: {
              responses: true,
            },
          },
        },
      });

      return form;
    } catch {
      throw new NotFoundException(`Form with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.form.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`Form with ID ${id} not found`);
    }
  }

  async findByOwner(ownerId: string): Promise<FormResponseDto[]> {
    return this.findAll(ownerId);
  }
}
