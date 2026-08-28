export class PrismaClient {}
export enum Role {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
}
export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
export enum TicketStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}
