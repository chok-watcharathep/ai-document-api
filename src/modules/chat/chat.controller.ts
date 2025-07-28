import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { GenerateTextDto } from './dtos/generate-text.dto';
import { Message } from 'ai';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async generateText(@Body() body: GenerateTextDto) {
    return this.chatService.generateText(body.prompt);
  }

  @Post('messages')
  async generateMessagePrompt(@Body() body: GenerateTextDto) {
    return this.chatService.generateMessagePrompt(body.prompt);
  }

  @Post('streams')
  generateStream(@Res() res: Response) {
    const stream = this.chatService.generateStream();
    stream.pipeDataStreamToResponse(res);
  }

  @Post('tools')
  generateTool(@Res() res: Response, @Body() body: { messages: Message[] }) {
    const stream = this.chatService.generateTool(body.messages);
    stream.pipeDataStreamToResponse(res);
  }
}
