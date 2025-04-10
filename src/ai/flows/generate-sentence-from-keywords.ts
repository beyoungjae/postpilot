'use server';
/**
 * @fileOverview A flow that generates sentences from keywords, optionally learning from a provided URL.
 *
 * - generateSentenceFromKeywords - A function that generates a sentence from keywords, with the option to learn from a URL.
 * - GenerateSentenceFromKeywordsInput - The input type for the generateSentenceFromKeywords function.
 * - GenerateSentenceFromKeywordsOutput - The return type for the generateSentenceFromKeywords function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateSentenceFromKeywordsInputSchema = z.object({
  keywords: z
    .string()
    .describe('The keywords to include in the sentence.')
    .min(1),
  styleGuide: z
    .string()
    .optional()
    .describe('A guide for writing style, tone and manner.'),
  samplePostUrl: z
    .string()
    .optional()
    .describe('URL of a blog post or SNS post to learn writing style from.'),
});
export type GenerateSentenceFromKeywordsInput = z.infer<
  typeof GenerateSentenceFromKeywordsInputSchema
>;

const GenerateSentenceFromKeywordsOutputSchema = z.object({
  sentence: z.string().describe('The generated sentence.'),
});
export type GenerateSentenceFromKeywordsOutput = z.infer<
  typeof GenerateSentenceFromKeywordsOutputSchema
>;

export async function generateSentenceFromKeywords(
  input: GenerateSentenceFromKeywordsInput
): Promise<GenerateSentenceFromKeywordsOutput> {
  return generateSentenceFromKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSentenceFromKeywordsPrompt',
  input: {
    schema: z.object({
      keywords: z
        .string()
        .describe('The keywords to include in the sentence.')
        .min(1),
      styleGuide: z
        .string()
        .optional()
        .describe('A guide for writing style, tone and manner.'),
      samplePostUrl: z
        .string()
        .optional()
        .describe('URL of a blog post or SNS post to learn writing style from.'),
    }),
  },
  output: {
    schema: z.object({
      sentence: z.string().describe('The generated sentence.'),
    }),
  },
  prompt: `당신은 전문 카피라이터입니다. 주어진 키워드를 자연스럽게 포함하는 문장을 생성합니다. 이 문장은 협찬 포스트 및 광고의 맥락에 적합해야 합니다.

키워드: {{{keywords}}}

{{#if styleGuide}}
스타일 가이드: {{{styleGuide}}}
{{/if}}

{{#if samplePostUrl}}
다른 게시물의 URL을 제공했으니, 해당 게시물의 어조와 스타일을 연구하여 글쓰기에 반영하십시오.
URL: {{{samplePostUrl}}}
{{/if}}

문장:`,
});

const generateSentenceFromKeywordsFlow = ai.defineFlow<
  typeof GenerateSentenceFromKeywordsInputSchema,
  typeof GenerateSentenceFromKeywordsOutputSchema
>({
  name: 'generateSentenceFromKeywordsFlow',
  inputSchema: GenerateSentenceFromKeywordsInputSchema,
  outputSchema: GenerateSentenceFromKeywordsOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
