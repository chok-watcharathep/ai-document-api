import { Injectable } from '@nestjs/common';
import { generateObject, generateText, Message, streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

@Injectable()
export class ChatService {
  async generateText(prompt: string) {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: `You don't explain about technology`,
      prompt: `Explain more about ${prompt}`,
    });

    return text;
  }

  async generateObject(topic: string) {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      system: `You have to explain about the topic at least 5 sentences and less than 100 sentences in thai`,
      prompt: `Summarize ${topic}`,
      schema: z.object({
        topic: z.string().describe('Topic'),
        summary: z.string().describe('Summary'),
      }),
    });

    return object;
  }

  async generateMessagePrompt(message: string) {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that doesn't explain about technology`,
        },
        {
          role: 'user',
          content: 'Say hi',
        },
        {
          role: 'assistant',
          content: 'Hello, How can I help you?',
        },
        {
          role: 'user',
          content: message,
        },
        {
          role: 'assistant',
          content: `Explain more about ${message}`,
        },
      ],
    });

    return text;
  }

  generateStream() {
    const stream = streamText({
      model: openai('gpt-4o-mini'),
      system: `You don't explain about technology`,
      prompt: `Explain more about stream`,
    });

    return stream;
  }

  generateTool(messages: Message[]) {
    const stream = streamText({
      model: openai('gpt-4o-mini'),
      system: `- When user ask about technology, use **technology** tools to answer
      - When user ask about weather, use **weather** tools to answer
      - Otherwise, You must ask user to use tools
      `,
      tools: {
        technology: tool({
          description: `- Use this tool when user ask about technology.
          - Always ask about technology name before use this tool`,
          parameters: z.object({
            technology: z.string().describe('Technology Topic'),
          }),
          execute: async ({ technology }) => {
            const result = await this.generateObject(technology);
            return result.summary;
          },
        }),
        weather: tool({
          description: `- Use this tool when user ask about weather.
          - Always ask about location name before use this tool`,
          parameters: z.object({
            city: z.string().describe('Location name'),
          }),
          execute: async ({ city }) => {
            await Promise.resolve();
            return `Detail about weather in ${city}`;
          },
        }),
      },
      messages,
    });

    return stream;
  }
}
