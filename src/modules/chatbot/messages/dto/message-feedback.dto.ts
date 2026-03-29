import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum FeedbackType {
  UP = 'UP',
  DOWN = 'DOWN',
}

export class MessageFeedbackDto {
  @ApiProperty({ enum: FeedbackType })
  @IsEnum(FeedbackType)
  feedback: FeedbackType;
}