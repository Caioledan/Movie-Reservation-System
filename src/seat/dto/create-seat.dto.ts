import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSeatDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The ID of the room the seat belongs to' })
    @IsNotEmpty({ message: 'Room ID is required.' })
    @IsUUID('4', { message: 'Room ID must be a valid UUID.' })
    roomId!: string;

    @ApiProperty({ example: 'A1', description: 'The seat number or label (e.g., A1, B12)' })
    @IsNotEmpty({ message: 'Seat number is required.' })
    @IsString({ message: 'Seat number must be a string.' })
    seatNumber!: string;
}
