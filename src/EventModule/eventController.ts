import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import type { AuthUser } from '../AuthModule/auth.dto';
import { JwtAuthGuard } from '../AuthModule/jwt-auth.guard';
import { CurrentUser } from '../AuthModule/current-user.decorator';
import {
  CreateEventDto,
  CreateEventsBatchDto,
  ListEventsQueryDto,
} from './eventDto';
import { EventService } from './eventService';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async createEvent(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventService.createEvent(user.userId, dto);
  }

  @Post('batch')
  async createEventsBatch(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateEventsBatchDto,
  ) {
    return this.eventService.createEventsBatch(user.userId, dto.events);
  }

  @Get()
  async listEvents(
    @CurrentUser() user: AuthUser,
    @Query() query: ListEventsQueryDto,
  ) {
    const events = await this.eventService.listEvents(user.userId, query);
    const retention = await this.eventService.getRetentionMeta(user.userId);
    return { ...retention, totalEvents: events.length, events };
  }
}
