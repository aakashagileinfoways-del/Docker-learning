import { Injectable } from '@nestjs/common';
import { UserTier } from '../common/retention.util';
import { EventService } from '../EventModule/eventService';
import { EventDocument } from '../EventModule/eventEntity';
import {
  formatLocalHourLabel,
  localDayBoundsUtc,
  localHour,
} from '../common/timezone.util';
import {
  TimelineDayQueryDto,
  TimelineRangeQueryDto,
  TimelineReplayQueryDto,
} from './timelineDto';

export type TimelineSegment = {
  hour: number;
  label: string;
  events: EventDocument[];
};

export type DayReplay = {
  userId: string;
  date: string;
  timezone: string;
  tier: UserTier;
  retentionDays: number | null;
  retentionCutoff: string | null;
  totalEvents: number;
  sources: Record<string, number>;
  types: Record<string, number>;
  segments: TimelineSegment[];
  events: EventDocument[];
};

@Injectable()
export class TimelineService {
  constructor(private readonly eventService: EventService) {}

  async getDay(userId: string, tier: UserTier, query: TimelineDayQueryDto) {
    const { from, to } = localDayBoundsUtc(query.date, query.timezone);
    const events = await this.eventService.getEventsForRange(
      userId,
      from,
      to,
      tier,
    );
    const retention = await this.eventService.getRetentionMeta(userId);

    return {
      userId,
      date: query.date,
      timezone: query.timezone,
      tier: retention.tier,
      retentionDays: retention.retentionDays,
      retentionCutoff: retention.retentionCutoff,
      totalEvents: events.length,
      events,
    };
  }

  async getRange(userId: string, tier: UserTier, query: TimelineRangeQueryDto) {
    const events = await this.eventService.getEventsForRange(
      userId,
      new Date(query.from),
      new Date(query.to),
      tier,
    );
    const retention = await this.eventService.getRetentionMeta(userId);

    return {
      userId,
      from: query.from,
      to: query.to,
      tier: retention.tier,
      retentionDays: retention.retentionDays,
      retentionCutoff: retention.retentionCutoff,
      totalEvents: events.length,
      events,
    };
  }

  async replayDay(
    userId: string,
    tier: UserTier,
    query: TimelineReplayQueryDto,
  ): Promise<DayReplay> {
    const { from, to } = localDayBoundsUtc(query.date, query.timezone);
    let events = await this.eventService.getEventsForRange(
      userId,
      from,
      to,
      tier,
    );

    if (query.projectId) {
      events = events.filter((e) => e.projectId === query.projectId);
    }

    const sources: Record<string, number> = {};
    const types: Record<string, number> = {};
    const byHour = new Map<number, EventDocument[]>();

    for (const event of events) {
      sources[event.source] = (sources[event.source] ?? 0) + 1;
      types[event.type] = (types[event.type] ?? 0) + 1;

      const hour = localHour(new Date(event.occurredAt), query.timezone);
      const bucket = byHour.get(hour) ?? [];
      bucket.push(event);
      byHour.set(hour, bucket);
    }

    const segments: TimelineSegment[] = [...byHour.entries()]
      .sort(([a], [b]) => b - a) // latest hour first
      .map(([hour, hourEvents]) => ({
        hour,
        label: formatLocalHourLabel(hour),
        // newest first within the hour
        events: [...hourEvents].sort(
          (x, y) =>
            new Date(y.occurredAt).getTime() - new Date(x.occurredAt).getTime(),
        ),
      }));

    // Flat list also newest first
    events = [...events].sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );

    const retention = await this.eventService.getRetentionMeta(userId);

    return {
      userId,
      date: query.date,
      timezone: query.timezone,
      tier: retention.tier as UserTier,
      retentionDays: retention.retentionDays,
      retentionCutoff: retention.retentionCutoff,
      totalEvents: events.length,
      sources,
      types,
      segments,
      events,
    };
  }
}
