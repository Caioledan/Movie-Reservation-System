import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async createRoom(data: CreateRoomDto) {
    const roomExists = await this.prisma.room.findFirst({
      where: { number: data.number },
    });

    if (roomExists) {
      throw new ConflictException('Room already exists.');
    }

    const { seatsPerRow, ...roomData } = data;

    const newRoom = await this.prisma.room.create({
      data: roomData,
    });

    const seatsToCreate: { roomId: string; seatNumber: string }[] = [];
    const actualSeatsPerRow = seatsPerRow || 10;

    for (let i = 0; i < newRoom.capacity; i++) {
      const rowIndex = Math.floor(i / actualSeatsPerRow);
      const seatIndex = (i % actualSeatsPerRow) + 1;

      let rowLetter = '';
      let tempIndex = rowIndex;
      while (tempIndex >= 0) {
        rowLetter = String.fromCharCode(65 + (tempIndex % 26)) + rowLetter;
        tempIndex = Math.floor(tempIndex / 26) - 1;
      }

      seatsToCreate.push({
        roomId: newRoom.id,
        seatNumber: `${rowLetter}${seatIndex}`,
      });
    }

    if (seatsToCreate.length > 0) {
      await this.prisma.seat.createMany({
        data: seatsToCreate,
      });
    }

    return newRoom;
  }

  async updateRoom(roomID: string, data: UpdateRoomDto) {
    const roomExists = await this.prisma.room.findUnique({
      where: { id: roomID },
    });

    if (!roomExists) {
      throw new NotFoundException('Room not found.');
    }

    const updatedRoom = await this.prisma.room.update({
      where: { id: roomID },
      data: data,
    });

    return updatedRoom;
  }

  async deleteRoom(roomID: string) {
    const roomExists = await this.prisma.room.findUnique({
      where: { id: roomID },
    });

    if (!roomExists) {
      throw new NotFoundException('Room not found.');
    }

    const deletedRoom = await this.prisma.room.delete({
      where: { id: roomID },
    });

    return deletedRoom;
  }

  async getRoom(roomID: string) {
    const roomExists = await this.prisma.room.findUnique({
      where: { id: roomID },
    });

    if (!roomExists) {
      throw new NotFoundException('Room not found.');
    }

    return roomExists;
  }

  async getAllRooms() {
    const rooms = await this.prisma.room.findMany();

    return rooms;
  }
}
