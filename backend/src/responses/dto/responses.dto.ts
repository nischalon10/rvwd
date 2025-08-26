export class CreateResponseDto {
  formId: string;
  transcript: string; // The transcribed text from voice
  metadata?: {
    audioDuration?: number;
    browser?: string;
    timestamp?: string;
    [key: string]: any;
  };
  userAgent?: string;
}

export class ResponseDto {
  id: string;
  transcript: string;
  extractedData: any; // AI-extracted structured data
  metadata: any;
  userAgent: string | null;
  createdAt: Date;
  formId: string;
  form?: {
    id: string;
    title: string;
    question: string;
    extractionSchema: any;
  };
}

export class SubmitResponseResponseDto {
  id: string;
  transcript: string;
  extractedData: any;
  message: string;
  processingTime: number; // Time taken for AI processing
}
