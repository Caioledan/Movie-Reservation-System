import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

const mockSession = {
  id: 'session-uuid',
  movieId: 'movie-uuid',
  roomId: 'room-uuid',
  startTime: new Date('2024-01-01T10:00:00Z'),
  endTime: new Date('2024-01-01T12:00:00Z'),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const prismaServiceMock = {
  session: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  movie: {
    findUnique: jest.fn(),
  },
  room: {
    findUnique: jest.fn(),
  },
  seat: {
    createMany: jest.fn(),
  },
};

describe('SessionService', () => {
  let service: SessionService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession', () => {
    const createDto: CreateSessionDto = {
      movieId: mockSession.movieId,
      roomId: mockSession.roomId,
      startTime: mockSession.startTime,
    };

    it('should successfully create a session and generate seats', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue({
        id: createDto.movieId,
        duration: 120,
      });
      (prisma.session.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.room.findUnique as jest.Mock).mockResolvedValue({
        id: createDto.roomId,
        capacity: 10,
      });
      (prisma.session.create as jest.Mock).mockResolvedValue(mockSession);

      const result = await service.createSession(createDto);

      const expectedEndTime = new Date(
        createDto.startTime.getTime() + 120 * 60000,
      );

      expect(prisma.session.findFirst).toHaveBeenCalledWith({
        where: {
          roomId: createDto.roomId,
          status: { not: 'CANCELLED' },
          startTime: { lt: expectedEndTime },
          endTime: { gt: createDto.startTime },
        },
      });
      expect(prisma.room.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.roomId },
      });
      expect(prisma.session.create).toHaveBeenCalledWith({
        data: { ...createDto, endTime: expectedEndTime },
      });
      expect(result).toEqual(mockSession);
    });

    it('should throw ConflictException if room is already booked for this time slot', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue({
        id: createDto.movieId,
        duration: 120,
      });
      (prisma.session.findFirst as jest.Mock).mockResolvedValue(mockSession);

      await expect(service.createSession(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.session.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if movie is not found', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createSession(createDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.session.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if room is not found', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue({
        id: createDto.movieId,
        duration: 120,
      });
      (prisma.session.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.room.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createSession(createDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.session.create).not.toHaveBeenCalled();
    });
  });

  describe('updateSession', () => {
    const updateDto: UpdateSessionDto = {
      startTime: new Date('2024-01-01T11:00:00Z'),
    };

    it('should successfully update a session', async () => {
      const updatedSession = { ...mockSession, startTime: updateDto.startTime };
      (prisma.session.findUnique as jest.Mock).mockResolvedValue(mockSession);
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue({
        id: mockSession.movieId,
        duration: 120,
      });
      (prisma.session.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.session.update as jest.Mock).mockResolvedValue(updatedSession);

      const result = await service.updateSession(mockSession.id, updateDto);

      const expectedEndTime = new Date(
        updateDto.startTime!.getTime() + 120 * 60000,
      );

      expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: { id: mockSession.id },
      });
      expect(prisma.session.update).toHaveBeenCalledWith({
        where: { id: mockSession.id },
        data: { ...updateDto, endTime: expectedEndTime },
      });
      expect(result).toEqual(updatedSession);
    });

    it('should throw NotFoundException if session is not found', async () => {
      (prisma.session.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateSession('invalid-id', updateDto),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.session.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if updated time overlaps with another session', async () => {
      (prisma.session.findUnique as jest.Mock).mockResolvedValue(mockSession);
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue({
        id: mockSession.movieId,
        duration: 120,
      });
      (prisma.session.findFirst as jest.Mock).mockResolvedValue({
        id: 'another-session',
      });

      await expect(
        service.updateSession(mockSession.id, updateDto),
      ).rejects.toThrow(ConflictException);
      expect(prisma.session.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteSession', () => {
    it('should successfully delete a session', async () => {
      (prisma.session.findUnique as jest.Mock).mockResolvedValue(mockSession);
      (prisma.session.delete as jest.Mock).mockResolvedValue(mockSession);

      const result = await service.deleteSession(mockSession.id);

      expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: { id: mockSession.id },
      });
      expect(prisma.session.delete).toHaveBeenCalledWith({
        where: { id: mockSession.id },
      });
      expect(result).toEqual(mockSession);
    });

    it('should throw NotFoundException if session is not found', async () => {
      (prisma.session.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteSession('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.session.delete).not.toHaveBeenCalled();
    });
  });

  describe('getSession', () => {
    it('should successfully return a session', async () => {
      (prisma.session.findUnique as jest.Mock).mockResolvedValue(mockSession);

      const result = await service.getSession(mockSession.id);

      expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: { id: mockSession.id },
      });
      expect(result).toEqual(mockSession);
    });

    it('should throw NotFoundException if session is not found', async () => {
      (prisma.session.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getSession('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllSessions', () => {
    it('should return an array of sessions including relations', async () => {
      const sessionsList = [mockSession];
      (prisma.session.findMany as jest.Mock).mockResolvedValue(sessionsList);

      const result = await service.getAllSessions();

      expect(prisma.session.findMany).toHaveBeenCalledWith({
        include: {
          movie: true,
          room: {
            include: {
              seats: true,
            },
          },
          tickets: true,
        },
      });
      expect(result).toEqual(sessionsList);
    });
  });
});
