import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

export interface ExtractionRequest {
  transcript: string;
  formId: string;
  formTitle: string;
  formQuestion: string;
  extractionSchema: any;
}

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private openai: OpenAI;
  private promptTemplate: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });

    // Load the prompt template
    this.loadPromptTemplate();
  }

  private loadPromptTemplate(): void {
    try {
      const templatePath = path.join(
        __dirname,
        '..',
        '..',
        'src',
        'templates',
        'extraction-prompt.txt',
      );
      this.promptTemplate = fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
      this.logger.error('Failed to load prompt template', error);
      throw new Error('Failed to load extraction prompt template');
    }
  }

  async extractDataFromTranscript(request: ExtractionRequest): Promise<any> {
    try {
      const prompt = this.buildPrompt(request);

      this.logger.log(`Processing extraction for form ${request.formId}`);

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a data extraction specialist. Extract structured data from transcripts according to the provided schema. Always return valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1, // Low temperature for consistent extraction
        max_tokens: 2000,
        response_format: { type: 'json_object' }, // Ensure JSON response
      });

      const extractedContent = completion.choices[0]?.message?.content;

      if (!extractedContent) {
        throw new Error('No content received from OpenAI');
      }

      // Parse and validate JSON
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const extractedData = JSON.parse(extractedContent);

      this.logger.log(`Successfully extracted data for form ${request.formId}`);

      return extractedData;
    } catch (error) {
      this.logger.error('Error during OpenAI extraction', error);
      
      // Return a fallback extraction in case of error
      return this.getFallbackExtraction(request);
    }
  }

  private buildPrompt(request: ExtractionRequest): string {
    return this.promptTemplate
      .replace(
        '{extractionSchema}',
        JSON.stringify(request.extractionSchema, null, 2),
      )
      .replace('{formQuestion}', request.formQuestion)
      .replace('{transcript}', request.transcript);
  }

  private getFallbackExtraction(request: ExtractionRequest): any {
    this.logger.warn(`Using fallback extraction for form ${request.formId}`);
    
    // Basic fallback data structure
    return {
      processed: true,
      timestamp: new Date().toISOString(),
      wordCount: request.transcript.split(' ').length,
      fallback: true,
      error: 'OpenAI extraction failed, using fallback data',
      basicAnalysis: {
        sentiment: 'neutral',
        keyTopics: this.extractBasicTopics(request.transcript),
        hasContent: request.transcript.trim().length > 0,
      },
    };
  }

  private extractBasicTopics(transcript: string): string[] {
    // Simple keyword extraction as fallback
    const commonWords = [
      'the',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should',
      'may',
      'might',
      'must',
      'can',
      'a',
      'an',
      'this',
      'that',
      'these',
      'those',
    ];

    const words = transcript
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3 && !commonWords.includes(word));

    const wordCounts = words.reduce(
      (counts, word) => {
        counts[word] = (counts[word] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>,
    );

    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }
}
