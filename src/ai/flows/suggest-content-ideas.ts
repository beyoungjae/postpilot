// 'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting content ideas based on a given topic.
 *
 * - suggestContentIdeas - A function that takes a topic as input and returns a list of content ideas.
 * - SuggestContentIdeasInput - The input type for the suggestContentIdeas function, containing the topic.
 * - SuggestContentIdeasOutput - The output type for the suggestContentIdeas function, containing an array of content ideas.
 */

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
  prompt: `You are a content creation expert. Generate a list of creative and engaging content ideas based on the following topic: {{{topic}}}. Return the ideas in the output schema.`,
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
