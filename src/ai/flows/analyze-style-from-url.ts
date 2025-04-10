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
  prompt: `귀하는 글쓰기 스타일 분석 전문가입니다. 주어진 URL의 콘텐츠를 분석하고 어조, 어휘, 문장 구조, 전반적인 태도 등 글쓰기 스타일의 주요 특징을 추출합니다. 분석 결과를 바탕으로 URL에 있는 콘텐츠의 글쓰기 스타일을 모방하는 데 사용할 수 있는 스타일 가이드를 만들게 됩니다.

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
