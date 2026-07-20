import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TimelineDayQueryDto {
  @IsDateString()
  date!: string;

  @IsString()
  @IsNotEmpty()
  timezone!: string;
}

export class TimelineRangeQueryDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}

export class TimelineReplayQueryDto {
  @IsDateString()
  date!: string;

  @IsString()
  @IsNotEmpty()
  timezone!: string;

  @IsOptional()
  @IsString()
  projectId?: string;
}
