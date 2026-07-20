import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import type { AuthUser } from '../AuthModule/auth.dto';
import { JwtAuthGuard } from '../AuthModule/jwt-auth.guard';
import { CurrentUser } from '../AuthModule/current-user.decorator';
import { UserTier } from '../common/retention.util';
import {
  TimelineDayQueryDto,
  TimelineRangeQueryDto,
  TimelineReplayQueryDto,
} from './timelineDto';
import { TimelineService } from './timelineService';

@Controller('timeline')
@UseGuards(JwtAuthGuard)
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get('day')
  async getDay(
    @CurrentUser() user: AuthUser,
    @Query() query: TimelineDayQueryDto,
  ) {
    return this.timelineService.getDay(
      user.userId,
      user.tier as UserTier,
      query,
    );
  }

  @Get('range')
  async getRange(
    @CurrentUser() user: AuthUser,
    @Query() query: TimelineRangeQueryDto,
  ) {
    return this.timelineService.getRange(
      user.userId,
      user.tier as UserTier,
      query,
    );
  }

  @Get('replay')
  async replayDay(
    @CurrentUser() user: AuthUser,
    @Query() query: TimelineReplayQueryDto,
  ) {
    return this.timelineService.replayDay(
      user.userId,
      user.tier as UserTier,
      query,
    );
  }
}
