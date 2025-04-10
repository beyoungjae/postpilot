'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestContentIdeasInputSchema = z.object({
  topic: z.string().describe('The topic or theme for which to generate content ideas.'),
});
export type SuggestContentIdeasInput = z.infer<typeof SuggestContentIdeasInputSchema>;

const SuggestContentIdeasOutputSchema = z.object({
  ideas: z.array(
    z.string().describe('A suggested content idea related to the topic.')
  ).describe('A list of content ideas.'),
});
export type SuggestContentIdeasOutput = z.infer<typeof SuggestContentIdeasOutputSchema>;

export async function suggestContentIdeas(input: SuggestContentIdeasInput): Promise<SuggestContentIdeasOutput> {
  return suggestContentIdeasFlow(input);
}

const suggestContentIdeasPrompt = ai.definePrompt({
  name: 'suggestContentIdeasPrompt',
  input: {
    schema: z.object({
      topic: z.string().describe('The topic or theme for which to generate content ideas.'),
    }),
  },
  output: {
    schema: z.object({
      ideas: z.array(
        z.string().describe('A suggested content idea related to the topic.')
      ).describe('A list of content ideas.'),
    }),
  },
  prompt: `당신은 콘텐츠 제작 전문가입니다. 다음 주제에 따라 창의적이고 매력적인 콘텐츠 아이디어 목록을 한국어로 생성하세요: {{{topic}}}. 출력 스키마에 따라 아이디어를 반환하세요.`,
});

const suggestContentIdeasFlow = ai.defineFlow<
  typeof SuggestContentIdeasInputSchema,
  typeof SuggestContentIdeasOutputSchema
>({
  name: 'suggestContentIdeasFlow',
  inputSchema: SuggestContentIdeasInputSchema,
  outputSchema: SuggestContentIdeasOutputSchema,
},
async input => {
  const {output} = await suggestContentIdeasPrompt(input);
  return output!;
});

