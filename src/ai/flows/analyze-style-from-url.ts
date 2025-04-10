'use server';

/**
 * @fileOverview A flow that analyzes the writing style from a given URL.
 *
 * - analyzeStyleFromUrl - A function that analyzes the writing style from a URL and returns a style guide.
 * - AnalyzeStyleFromUrlInput - The input type for the analyzeStyleFromUrl function.
 * - AnalyzeStyleFromUrlOutput - The return type for the analyzeStyleFromUrl function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeStyleFromUrlInputSchema = z.object({
  url: z.string().describe('The URL of the blog post or SNS post to analyze.').min(1),
});
export type AnalyzeStyleFromUrlInput = z.infer<typeof AnalyzeStyleFromUrlInputSchema>;

const AnalyzeStyleFromUrlOutputSchema = z.object({
  styleGuide: z.string().describe('A guide for writing style, tone, and manner based on the analyzed URL.'),
});
export type AnalyzeStyleFromUrlOutput = z.infer<typeof AnalyzeStyleFromUrlOutputSchema>;

export async function analyzeStyleFromUrl(
  input: AnalyzeStyleFromUrlInput
): Promise<AnalyzeStyleFromUrlOutput> {
  return analyzeStyleFromUrlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeStyleFromUrlPrompt',
  input: {
    schema: z.object({
      url: z.string().describe('The URL of the blog post or SNS post to analyze.').min(1),
    }),
  },
  output: {
    schema: z.object({
      styleGuide: z.string().describe('A guide for writing style, tone, and manner based on the analyzed URL.'),
    }),
  },
  prompt: `You are an expert writing style analyzer. You will analyze the content of the given URL and extract key characteristics of the writing style, including tone, vocabulary, sentence structure, and overall manner. Based on your analysis, you will create a style guide that can be used to mimic the writing style of the content at the URL.

URL: {{{url}}}

Style Guide:`,
});

const analyzeStyleFromUrlFlow = ai.defineFlow<
  typeof AnalyzeStyleFromUrlInputSchema,
  typeof AnalyzeStyleFromUrlOutputSchema
>({
  name: 'analyzeStyleFromUrlFlow',
  inputSchema: AnalyzeStyleFromUrlInputSchema,
  outputSchema: AnalyzeStyleFromUrlOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
