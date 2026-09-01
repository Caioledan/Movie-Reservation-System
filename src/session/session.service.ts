import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SessionStatus } from 'generated/prisma/enums';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) { }

  async createSession(data: CreateSessionDto) {
    const movie = await this.prisma.movie.findUnique({
      where: { id: data.movieId }
    });

    if (!movie) {
      throw new NotFoundException("Movie not found.");
    }

    const calculatedEndTime = new Date(data.startTime.getTime() + movie.duration * 60000);

    const sessionExists = await this.prisma.session.findFirst({
      where: {
        roomId: data.roomId,
        status: { not: 'CANCELLED' },
        startTime: { lt: calculatedEndTime },
        endTime: { gt: data.startTime }
      }
    })

    if (sessionExists) {
      throw new ConflictException("Room is already booked for this time slot.");
    }

    const room = await this.prisma.room.findUnique({
      where: { id: data.roomId }
    });

    if (!room) {
      throw new NotFoundException("Room not found.");
    }

    const newSession = await this.prisma.session.create({ 
      data: {
        ...data,
        endTime: calculatedEndTime
      }
    });

    return newSession;
  }

  async updateSession(sessionId: string, data: UpdateSessionDto) {
    const sessionExists = await this.prisma.session.findUnique({ where: { id: sessionId } })

    if (!sessionExists) {
      throw new NotFoundException("Session not found.")
    }

    let calculatedEndTime: Date | undefined;

    if (data.startTime || data.movieId) {
      const newStartTime = data.startTime || sessionExists.startTime;
      const newMovieId = data.movieId || sessionExists.movieId;

      const movie = await this.prisma.movie.findUnique({
        where: { id: newMovieId }
      });

      if (!movie) {
        throw new NotFoundException("Movie not found.");
      }

      calculatedEndTime = new Date(newStartTime.getTime() + movie.duration * 60000);

      const overlappingSession = await this.prisma.session.findFirst({
        where: {
          roomId: sessionExists.roomId,
          id: { not: sessionId },
          status: { not: 'CANCELLED' },
          startTime: { lt: calculatedEndTime },
          endTime: { gt: newStartTime }
        }
      });

      if (overlappingSession) {
        throw new ConflictException("Room is already booked for this time slot.");
      }
    }

    const updateData: any = { ...data };
    if (calculatedEndTime) {
      updateData.endTime = calculatedEndTime;
    }

    const sessionUpdated = await this.prisma.session.update({
      where: { id: sessionId },
      data: updateData,
    })

    return sessionUpdated;
  }

  async deleteSession(sessionId: string) {
    const sessionExists = await this.prisma.session.findUnique({ where: { id: sessionId } })

    if (!sessionExists) {
      throw new NotFoundException("Session not found.")
    }

    const sessionDeleted = await this.prisma.session.delete({
      where: { id: sessionId },
    })

    return sessionDeleted;
  }

  async getSession(sessionId: string) {
    const sessionExists = await this.prisma.session.findUnique({
      where: { id: sessionId }
    })

    if (!sessionExists) {
      throw new NotFoundException("Session not found.")
    }

    return sessionExists;
  }

  async getAllSessions() {
    const sessions = await this.prisma.session.findMany({
      include: {
        movie: true,
        room: {
          include: {
            seats: true,
          }
        },
        tickets: true,
      },
    })

    return sessions;
  }

  async getSessionByStatus(status: SessionStatus) {
    const sessions = await this.prisma.session.findMany({
      where: {status: status}
    })

    return sessions;
  }

  async getAvailableSeats(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        room: {
          include: {
            seats: true
          }
        },
        tickets: true
      }
    });

    if (!session) {
      throw new NotFoundException("Session not found.");
    }

    const reservedSeatIds = session.tickets.map(t => t.seatId);
    const availableSeats = session.room.seats.filter(seat => !reservedSeatIds.includes(seat.id));

    return availableSeats;
  }

  async getReservedSeats(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        room: {
          include: {
            seats: true
          }
        },
        tickets: true
      }
    });

    if (!session) {
      throw new NotFoundException("Session not found.");
    }

    const reservedSeatIds = session.tickets.map(t => t.seatId);
    const reservedSeats = session.room.seats.filter(seat => reservedSeatIds.includes(seat.id));

    return reservedSeats;
  }
}
