import { Controller, Get, Post, Body, Req, UseGuards,Param, Patch, Delete, Query, UnauthorizedException} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { OptionalJwtAuthGuard } from 'src/common/guards/optional-jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';


@ApiTags('PetCare Chats')
@ApiBearerAuth('access-token')
@Public()
@UseGuards(OptionalJwtAuthGuard)
@Controller('chatbot/chats')
export class ChatsController {
  constructor(private readonly service: ChatsService) {}

@Get()
findAll(@Query('guest_id') guestId: string, @Req() req) {
  const userId = req.user?.sub || guestId;
  if (!userId) throw new UnauthorizedException('User/Guest ID required');
  return this.service.findAll(userId);
}


@Post()
create(@Body() dto: CreateChatDto, @Query('guest_id') guestId: string, @Req() req) {
  const userId = req.user?.sub || guestId;
  if (!userId) throw new UnauthorizedException('User/Guest ID required');
  return this.service.create(dto.title, userId);
}

@Get(':id/messages')
getMessages(@Param('id') chatId: string, @Query('guest_id') guestId: string, @Req() req) {
  const userId = req.user?.sub || guestId;
  if (!userId) throw new UnauthorizedException('User/Guest ID required');
  return this.service.getMessages(chatId, userId);
}



@Patch(':id')
update(
  @Param('id') id: string,
  @Body() dto: UpdateChatDto,
  @Query('guest_id') guestId: string,
  @Req() req
) {
  const userId = req.user?.sub || guestId;
  if (!userId) throw new UnauthorizedException('User/Guest ID required');
  return this.service.update(id, dto, userId);
}



@Delete(':id')
remove(@Param('id') id: string, @Query('guest_id') guestId: string, @Req() req) {
  const userId = req.user?.sub || guestId;
  if (!userId) throw new UnauthorizedException('User/Guest ID required');
  return this.service.remove(id, userId);
}


@Delete(':id/messages')
deleteMessagesAfter(
  @Param('id') chatId: string,
  @Query('after') after: string,
  @Query('guest_id') guestId: string,
  @Req() req
) {
  const userId = req.user?.sub || guestId;
  if (!userId) throw new UnauthorizedException('User/Guest ID required');
  return this.service.deleteMessagesAfter(chatId, after, userId);
}

}