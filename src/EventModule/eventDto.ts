import {
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export const EVENT_SOURCES = [
  'gmail',
  'slack',
  'github',
  'vscode',
  'chrome',
  'calendar',
  'notion',
  'drive',
  'photos',
  'manual',
] as const;

export const EVENT_TYPES = [
  'email',
  'message',
  'commit',
  'file_edit',
  'browse',
  'meeting',
  'note',
  'file',
  'photo',
  'other',
] as const;

export class CreateEventDto {
  @IsIn(EVENT_SOURCES)
  source!: (typeof EVENT_SOURCES)[number];

  @IsIn(EVENT_TYPES)
  type!: (typeof EVENT_TYPES)[number];

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsDateString()
  occurredAt!: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  sourceEventId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class CreateEventsBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventDto)
  events!: CreateEventDto[];
}

export class ListEventsQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsIn(EVENT_SOURCES)
  source?: (typeof EVENT_SOURCES)[number];

  @IsOptional()
  @IsString()
  projectId?: string;
}
