import OpenAI from 'openai';

const client = new OpenAI({
   apiKey: process.env.OPENAI_API_KEY ?? '',
   baseURL: 'https://openrouter.ai/api/v1',
});

type GenerateTextOptions = {
   model?: string;
   prompt: string;
   messages?: Array<{ role: string; content: string }>;
   temperature?: number;
   maxTokens?: number;
   stream?: boolean;
};

export const llmClient = {
   async generateText({
      model = 'gpt-5.4-mini',
      prompt,
      temperature = 0.2,
      maxTokens = 300,
   }: GenerateTextOptions) {
      const response = await client.responses.create({
         model,
         input: prompt,
         temperature,
         max_output_tokens: maxTokens,
      });
      return response.output_text;
   },
};
