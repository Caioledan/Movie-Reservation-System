import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SeatService {
  constructor(private prisma: PrismaService) {}

  async createSeat(data: CreateSeatDto) {
    const existingSeat = await this.prisma.seat.findFirst({
      where: {
        roomId: data.roomId,
        seatNumber: data.seatNumber,
      },
    });

    if (existingSeat) {
      throw new ConflictException('Seat already exists');
    }

    const newSeat = await this.prisma.seat.create({
      data: data,
    });

    await this.prisma.room.update({
      where: { id: data.roomId },
      data: { capacity: { increment: 1 } },
    });

    return newSeat;
  }

  async updateSeat(seatId: string, data: UpdateSeatDto) {
    const seatExists = await this.prisma.seat.findUnique({
      where: { id: seatId },
    });

    if (!seatExists) {
      throw new NotFoundException('Seat not found');
    }

    const updatedSeat = await this.prisma.seat.update({
      where: { id: seatId },
      data: data,
    });

    return updatedSeat;
  }

  async deleteSeat(seatId: string) {
    const seatExists = await this.prisma.seat.findUnique({
      where: { id: seatId },
    });

    if (!seatExists) {
      throw new NotFoundException('Seat not found');
    }

    await this.prisma.seat.delete({
      where: { id: seatId },
    });

    await this.prisma.room.update({
      where: { id: seatExists.roomId },
      data: { capacity: { decrement: 1 } },
    });

    return 'Seat deleted successfully';
  }

  async getSeatById(seatId: string) {
    const seatExists = await this.prisma.seat.findUnique({
      where: { id: seatId },
    });

    if (!seatExists) {
      throw new NotFoundException('Seat not found');
    }

    return seatExists;
  }

  async getAllSeats() {
    return this.prisma.seat.findMany();
  }
}
