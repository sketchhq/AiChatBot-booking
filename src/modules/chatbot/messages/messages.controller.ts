import { Controller, Post, Patch, Body, Param, Req, UseGuards, Query, UnauthorizedException } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { OptionalJwtAuthGuard } from 'src/common/guards/optional-jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageFeedbackDto } from './dto/message-feedback.dto';

@ApiTags('PetCare Messages')
@ApiBearerAuth('access-token')
@Public()
@UseGuards(OptionalJwtAuthGuard)
@Controller('chatbot/messages')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Post()
  create(@Body() dto: CreateMessageDto, @Query('guest_id') guestId: string, @Req() req) {
    const userId = req.user?.sub || guestId || (dto.chat_id ? `guest_${dto.chat_id}` : null);
    if (!userId) throw new UnauthorizedException('User/Guest ID required');
    return this.service.create(dto, userId);
  }

  @Patch(':id/feedback')
  feedback(
    @Param('id') id: string,
    @Body() dto: MessageFeedbackDto,
    @Query('guest_id') guestId: string,
    @Req() req
  ) {
    const userId = req.user?.sub || guestId;
    if (!userId) throw new UnauthorizedException('User/Guest ID required');
    return this.service.feedback(id, userId, dto.feedback);
  }
}