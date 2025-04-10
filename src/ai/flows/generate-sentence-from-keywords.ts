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
  prompt: `You are an expert copywriter. You will generate a sentence that naturally incorporates the given keywords. The sentence should be engaging and relevant to the context of sponsored posts and ads.

Keywords: {{{keywords}}}

{{#if styleGuide}}
Style Guide: {{{styleGuide}}}
{{/if}}

{{#if samplePostUrl}}
I have provided the URL of another post, study the tone and style of that post, and use that to inform your writing.
URL: {{{samplePostUrl}}}
{{/if}}

Sentence:`,
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
