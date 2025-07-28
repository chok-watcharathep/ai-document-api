import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GenerateTextDto {
  @IsString()
  @ApiProperty({ example: 'Hello, how are you?' })
  prompt: string;
}
