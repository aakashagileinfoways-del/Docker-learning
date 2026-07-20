import { Module } from '@nestjs/common';
import { UserModule } from '../UserModule/userModule';
import { EventController } from './eventController';
import { EventService } from './eventService';
import EventEntity from './eventEntity';

@Module({
  imports: [UserModule],
  controllers: [EventController],
  providers: [
    EventService,
    {
      provide: 'EVENT_REPOSITORY',
      useValue: EventEntity,
    },
  ],
  exports: [EventService],
})
export class EventModule {}
