import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

const mockRoom = {
  id: 'room-uuid-string',
  number: 1,
  capacity: 100,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const prismaServiceMock = {
  room: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  seat: {
    createMany: jest.fn(),
  },
};

describe('RoomService', () => {
  let service: RoomService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRoom', () => {
    const createDto: CreateRoomDto = {
      number: 1,
      capacity: 10,
      seatsPerRow: 5,
    };

    it('should successfully create a room and its seats', async () => {
      (prisma.room.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.room.create as jest.Mock).mockResolvedValue(mockRoom);
      (prisma.seat.createMany as jest.Mock).mockResolvedValue({ count: 10 });

      const result = await service.createRoom(createDto);

      expect(prisma.room.findFirst).toHaveBeenCalledWith({
        where: { number: createDto.number },
      });
      const { seatsPerRow, ...roomData } = createDto;
      expect(prisma.room.create).toHaveBeenCalledWith({ data: roomData });
      expect(prisma.seat.createMany).toHaveBeenCalled();
      expect(result).toEqual(mockRoom);
    });

    it('should throw ConflictException if room already exists', async () => {
      (prisma.room.findFirst as jest.Mock).mockResolvedValue(mockRoom);

      await expect(service.createRoom(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.room.create).not.toHaveBeenCalled();
      expect(prisma.seat.createMany).not.toHaveBeenCalled();
    });
  });

  describe('updateRoom', () => {
    const updateDto: UpdateRoomDto = { number: 2 };

    it('should successfully update a room', async () => {
      const updatedRoom = { ...mockRoom, number: 2 };
      (prisma.room.findUnique as jest.Mock).mockResolvedValue(mockRoom);
      (prisma.room.update as jest.Mock).mockResolvedValue(updatedRoom);

      const result = await service.updateRoom(mockRoom.id, updateDto);

      expect(prisma.room.findUnique).toHaveBeenCalledWith({
        where: { id: mockRoom.id },
      });
      expect(prisma.room.update).toHaveBeenCalledWith({
        where: { id: mockRoom.id },
        data: updateDto,
      });
      expect(result).toEqual(updatedRoom);
    });

    it('should throw NotFoundException if room is not found', async () => {
      (prisma.room.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updateRoom('invalid-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.room.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteRoom', () => {
    it('should successfully delete a room', async () => {
      (prisma.room.findUnique as jest.Mock).mockResolvedValue(mockRoom);
      (prisma.room.delete as jest.Mock).mockResolvedValue(mockRoom);

      const result = await service.deleteRoom(mockRoom.id);

      expect(prisma.room.findUnique).toHaveBeenCalledWith({
        where: { id: mockRoom.id },
      });
      expect(prisma.room.delete).toHaveBeenCalledWith({
        where: { id: mockRoom.id },
      });
      expect(result).toEqual(mockRoom);
    });

    it('should throw NotFoundException if room is not found', async () => {
      (prisma.room.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteRoom('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.room.delete).not.toHaveBeenCalled();
    });
  });

  describe('getRoom', () => {
    it('should successfully return a room', async () => {
      (prisma.room.findUnique as jest.Mock).mockResolvedValue(mockRoom);

      const result = await service.getRoom(mockRoom.id);

      expect(prisma.room.findUnique).toHaveBeenCalledWith({
        where: { id: mockRoom.id },
      });
      expect(result).toEqual(mockRoom);
    });

    it('should throw NotFoundException if room is not found', async () => {
      (prisma.room.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getRoom('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllRooms', () => {
    it('should return an array of rooms', async () => {
      const roomsList = [mockRoom];
      (prisma.room.findMany as jest.Mock).mockResolvedValue(roomsList);

      const result = await service.getAllRooms();

      expect(prisma.room.findMany).toHaveBeenCalled();
      expect(result).toEqual(roomsList);
    });
  });
});
