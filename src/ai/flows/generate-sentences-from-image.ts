'use server';
/**
 * @fileOverview A flow that generates sentence suggestions based on an uploaded image.
 *
 * - generateSentencesFromImage - A function that suggests sentences based on an image.
 * - GenerateSentencesFromImageInput - The input type for the generateSentencesFromImage function.
 * - GenerateSentencesFromImageOutput - The return type for the generateSentencesFromImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateSentencesFromImageInputSchema = z.object({
  imageUrl: z
    .string()
    .describe('The URL of the image to generate sentences from.')
    .min(1),
});
export type GenerateSentencesFromImageInput = z.infer<
  typeof GenerateSentencesFromImageInputSchema
>;

const GenerateSentencesFromImageOutputSchema = z.object({
  sentences: z.array(z.string()).describe('The generated sentences.'),
});
export type GenerateSentencesFromImageOutput = z.infer<
  typeof GenerateSentencesFromImageOutputSchema
>;

export async function generateSentencesFromImage(
  input: GenerateSentencesFromImageInput
): Promise<GenerateSentencesFromImageOutput> {
  return generateSentencesFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSentencesFromImagePrompt',
  input: {
    schema: z.object({
      imageUrl: z
        .string()
        .describe('The URL of the image to generate sentences from.')
        .min(1),
    }),
  },
  output: {
    schema: z.object({
      sentences: z.array(z.string()).describe('The generated sentences.'),
    }),
  },
  prompt: `당신은 이미지에 기반하여 매력적인 소셜 미디어 캡션을 생성하는 전문가입니다. 다음 이미지가 주어지면, 그에 맞는 3가지 가능한 캡션 목록을 한국어로 생성하세요.

Image: {{media url=imageUrl}}

Captions:`,
});

const generateSentencesFromImageFlow = ai.defineFlow<
  typeof GenerateSentencesFromImageInputSchema,
  typeof GenerateSentencesFromImageOutputSchema
>({
  name: 'generateSentencesFromImageFlow',
  inputSchema: GenerateSentencesFromImageInputSchema,
  outputSchema: GenerateSentencesFromImageOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});

