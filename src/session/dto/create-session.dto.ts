import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsUUID, MinDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSessionDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Start time is required.' })
  @IsDate({ message: 'Start time must be a date.' })
  @Type(() => Date)
  @MinDate(new Date(), { message: 'Start time must be in the future.' })
  startTime!: Date;

  @ApiProperty()
  @IsNotEmpty({ message: 'Room ID is required.' })
  @IsUUID('4', { message: 'Room ID must be a valid UUID.' })
  roomId!: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Movie ID is required.' })
  @IsUUID('4', { message: 'Movie ID must be a valid UUID.' })
  movieId!: string;
}
