import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 1, description: 'The unique number of the room.' })
  @IsNotEmpty({ message: 'Room number is required.' })
  @IsInt({ message: 'Room number must be an integer.' })
  @Min(1, { message: 'Room number must be at least 1.' })
  number!: number;

  @ApiProperty({ example: 100, description: 'The maximum capacity of the room.' })
  @IsNotEmpty({ message: 'Capacity is required.' })
  @IsInt({ message: 'Capacity must be an integer.' })
  @Min(1, { message: 'Capacity must be at least 1.' })
  capacity!: number;
}
