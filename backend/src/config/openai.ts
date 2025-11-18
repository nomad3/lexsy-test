import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing required environment variable: OPENAI_API_KEY');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const MODELS = {
  GPT4_TURBO: 'gpt-4-turbo-preview',
  GPT4: 'gpt-4',
  GPT35_TURBO: 'gpt-3.5-turbo',
} as const;

export const PRICING = {
  [MODELS.GPT4_TURBO]: { input: 0.01, output: 0.03 }, // per 1K tokens
  [MODELS.GPT4]: { input: 0.03, output: 0.06 },
  [MODELS.GPT35_TURBO]: { input: 0.0005, output: 0.0015 },
} as const;

export function calculateCost(tokens: { prompt: number; completion: number }, model: string): number {
  const pricing = PRICING[model as keyof typeof PRICING];
  if (!pricing) return 0;

  const inputCost = (tokens.prompt / 1000) * pricing.input;
  const outputCost = (tokens.completion / 1000) * pricing.output;

  return inputCost + outputCost;
}
