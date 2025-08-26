export class CreateFormDto {
  title: string;
  description?: string;
  question: string;
  extractionSchema: Record<string, any>; // JSON schema for data extraction
  uiHints: string[]; // Hints for users on what to talk about
  ownerId: string; // ID of the user creating the form
}

export class UpdateFormDto {
  title?: string;
  description?: string;
  question?: string;
  extractionSchema?: Record<string, any>;
  uiHints?: string[];
  isActive?: boolean;
}

export class FormResponseDto {
  id: string;
  title: string;
  description: string | null;
  question: string;
  extractionSchema: any; // Use any to match Prisma's JsonValue type
  uiHints: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  owner?: {
    id: string;
    email: string;
    name: string | null;
  };
  _count?: {
    responses: number;
  };
}
