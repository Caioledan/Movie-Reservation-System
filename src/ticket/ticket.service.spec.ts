import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from './ticket.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketStatus } from 'generated/prisma/enums';

const mockTicket = {
  id: 'ticket-id',
  userId: 'user-id',
  sessionId: 'session-id',
  seatId: 'seat-id',
  transactionId: 'tx-123',
  totalAmount: 25.5,
  status: TicketStatus.CONFIRMED,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TicketService', () => {
  let service: TicketService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        {
          provide: PrismaService,
          useValue: {
            ticket: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
            },
            seat: {
              findUnique: jest.fn(),
            },
            session: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTicket', () => {
    const createDto: CreateTicketDto = {
      userId: 'user-id',
      sessionId: 'session-id',
      seatId: 'seat-id',
      transactionId: 'tx-123',
      totalAmount: 25.5,
      status: TicketStatus.CONFIRMED,
    };

    it('should create a ticket successfully when seat belongs to session room', async () => {
      (prisma.seat.findUnique as jest.Mock).mockResolvedValue({
        id: 'seat-id',
        roomId: 'room-id',
      });
      (prisma.session.findUnique as jest.Mock).mockResolvedValue({
        id: 'session-id',
        roomId: 'room-id',
      });
      (prisma.ticket.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.ticket.create as jest.Mock).mockResolvedValue(mockTicket);

      const result = await service.createTicket('user-id', createDto);

      expect(prisma.ticket.create).toHaveBeenCalledWith({ data: createDto });
      expect(result).toEqual(mockTicket);
    });

    it('should throw NotFoundException if seat not found', async () => {
      (prisma.seat.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createTicket('user-id', createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if session not found', async () => {
      (prisma.seat.findUnique as jest.Mock).mockResolvedValue({
        id: 'seat-id',
        roomId: 'room-id',
      });
      (prisma.session.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createTicket('user-id', createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if seat room does not match session room', async () => {
      (prisma.seat.findUnique as jest.Mock).mockResolvedValue({
        id: 'seat-id',
        roomId: 'room-1',
      });
      (prisma.session.findUnique as jest.Mock).mockResolvedValue({
        id: 'session-id',
        roomId: 'room-2',
      });

      await expect(service.createTicket('user-id', createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if ticket already exists', async () => {
      (prisma.seat.findUnique as jest.Mock).mockResolvedValue({
        id: 'seat-id',
        roomId: 'room-id',
      });
      (prisma.session.findUnique as jest.Mock).mockResolvedValue({
        id: 'session-id',
        roomId: 'room-id',
      });
      (prisma.ticket.findFirst as jest.Mock).mockResolvedValue(mockTicket);

      await expect(service.createTicket('user-id', createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getTicketById', () => {
    it('should return a ticket if found', async () => {
      (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(mockTicket);

      const result = await service.getTicketById('ticket-id');

      expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: 'ticket-id' },
      });
      expect(result).toEqual(mockTicket);
    });

    it('should throw NotFoundException if not found', async () => {
      (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getTicketById('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteTicket', () => {
    it('should delete and return ticket', async () => {
      (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(mockTicket);
      (prisma.ticket.delete as jest.Mock).mockResolvedValue(mockTicket);

      const result = await service.deleteTicket('ticket-id');

      expect(prisma.ticket.delete).toHaveBeenCalledWith({
        where: { id: 'ticket-id' },
      });
      expect(result).toEqual('Ticket deleted successfully');
    });

    it('should throw NotFoundException if ticket not found', async () => {
      (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteTicket('ticket-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
