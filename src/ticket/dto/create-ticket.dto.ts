import { TicketStatus } from 'generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID, Min, IsOptional } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The ID of the user buying the ticket', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'User ID must be a valid UUID.' })
  userId!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001', description: 'The ID of the seat being booked' })
  @IsNotEmpty({ message: 'Seat ID is required.' })
  @IsUUID('4', { message: 'Seat ID must be a valid UUID.' })
  seatId!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002', description: 'The ID of the session' })
  @IsNotEmpty({ message: 'Session ID is required.' })
  @IsUUID('4', { message: 'Session ID must be a valid UUID.' })
  sessionId!: string;

  @ApiProperty({ example: 'tx_1234567890', description: 'The payment transaction ID' })
  @IsNotEmpty({ message: 'Transaction ID is required.' })
  @IsString({ message: 'Transaction ID must be a string.' })
  transactionId!: string;

  @ApiProperty({ example: 25.50, description: 'The total amount paid for the ticket' })
  @IsNotEmpty({ message: 'Total amount is required.' })
  @IsNumber({}, { message: 'Total amount must be a number.' })
  @Min(0, { message: 'Total amount cannot be negative.' })
  totalAmount!: number;

  @ApiProperty({ enum: TicketStatus, example: TicketStatus.PENDING, description: 'The current status of the ticket' })
  @IsNotEmpty({ message: 'Status is required.' })
  @IsEnum(TicketStatus, { message: 'Status must be a valid TicketStatus (PENDING, CONFIRMED, CANCELLED, COMPLETED).' })
  status!: TicketStatus;
}
