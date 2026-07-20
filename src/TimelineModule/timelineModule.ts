import { Module } from '@nestjs/common';
import { EventModule } from '../EventModule/eventModule';
import { TimelineController } from './timelineController';
import { TimelineService } from './timelineService';

@Module({
  imports: [EventModule],
  controllers: [TimelineController],
  providers: [TimelineService],
})
export class TimelineModule {}
