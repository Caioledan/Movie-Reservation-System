import { Test, TestingModule } from '@nestjs/testing';
import { SeatService } from './seat.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockSeat = {
  id: 'seat-id',
  seatNumber: 'A1',
  roomId: 'room-id',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('SeatService', () => {
  let service: SeatService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeatService,
        {
          provide: PrismaService,
          useValue: {
            seat: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            room: {
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SeatService>(SeatService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSeat', () => {
    it('should create a seat and increment room capacity', async () => {
      (prisma.seat.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.seat.create as jest.Mock).mockResolvedValue(mockSeat);

      const result = await service.createSeat({
        roomId: 'room-id',
        seatNumber: 'A1',
      });

      expect(prisma.seat.create).toHaveBeenCalled();
      expect(prisma.room.update).toHaveBeenCalledWith({
        where: { id: 'room-id' },
        data: { capacity: { increment: 1 } },
      });
      expect(result).toEqual(mockSeat);
    });

    it('should throw ConflictException if seat exists', async () => {
      (prisma.seat.findFirst as jest.Mock).mockResolvedValue(mockSeat);

      await expect(
        service.createSeat({ roomId: 'room-id', seatNumber: 'A1' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteSeat', () => {
    it('should delete a seat and decrement room capacity', async () => {
      (prisma.seat.findUnique as jest.Mock).mockResolvedValue(mockSeat);
      (prisma.seat.delete as jest.Mock).mockResolvedValue(mockSeat);

      const result = await service.deleteSeat('seat-id');

      expect(prisma.seat.delete).toHaveBeenCalled();
      expect(prisma.room.update).toHaveBeenCalledWith({
        where: { id: 'room-id' },
        data: { capacity: { decrement: 1 } },
      });
      expect(result).toEqual('Seat deleted successfully');
    });

    it('should throw NotFoundException if seat does not exist', async () => {
      (prisma.seat.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteSeat('seat-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
