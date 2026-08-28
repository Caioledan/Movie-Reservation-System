import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TicketStatus } from 'generated/prisma/enums';

@Injectable()
export class TicketService {
  constructor(private prisma: PrismaService) {}

  async createTicket(userId: string, data: CreateTicketDto) {
    const seat = await this.prisma.seat.findUnique({ where: { id: data.seatId } });
    const session = await this.prisma.session.findUnique({ where: { id: data.sessionId } });

    if (!seat || !session) {
      throw new NotFoundException('Seat or Session not found');
    }

    if (seat.roomId !== session.roomId) {
      throw new BadRequestException('Seat does not belong to the room of this session.');
    }

    const existingTicket = await this.prisma.ticket.findFirst({
      where: {
        seatId: data.seatId,
        sessionId: data.sessionId,
        status: {in: ['CONFIRMED', 'PENDING']}
      }
    })

    if (existingTicket) {
      throw new ConflictException('Ticket already exists');
    }

    data.userId = userId;

    const newTicket = await this.prisma.ticket.create({
      data: data
    })

    return newTicket;
  }

  async updateTicket(ticketId: string, data: UpdateTicketDto) {
    const ticketExists = await this.prisma.ticket.findUnique({
      where: {id: ticketId}
    })

    if (!ticketExists) {
      throw new NotFoundException('Ticket not found');
    }

    const updatedTicket = await this.prisma.ticket.update({
      where: {id: ticketId},
      data: data
    })

    return updatedTicket;
  }

  async deleteTicket(ticketId: string) {
    const ticketExists = await this.prisma.ticket.findUnique({
      where: {id: ticketId}
    })

    if (!ticketExists) {
      throw new NotFoundException('Ticket not found');
    }

    await this.prisma.ticket.delete({
      where: {id: ticketId}
    })

    return 'Ticket deleted successfully';
  }

  async getTicketById(ticketId: string) {
    const ticketExists = await this.prisma.ticket.findUnique({
      where: {id: ticketId}
    })

    if (!ticketExists) {
      throw new NotFoundException('Ticket not found');
    }

    return ticketExists;
  }

  async getTicketsByUser(userId: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: {userId: userId}
    })

    return tickets;
  }

  async getTicketsBySession(sessionId: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: {sessionId: sessionId}
    })

    return tickets;
  }

  async getTicketsBySeat(seatId: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: {seatId: seatId}
    })

    return tickets;
  }

  async getTicketsByStatus(status: TicketStatus) {
    const tickets = await this.prisma.ticket.findMany({
      where: {status: status}
    })

    return tickets;
  }

}
