import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MovieModule } from './movie/movie.module';
import { RoomModule } from './room/room.module';
import { SessionModule } from './session/session.module';
import { TicketModule } from './ticket/ticket.module';
import { SeatModule } from './seat/seat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, 
    UserModule, 
    AuthModule, 
    MovieModule, RoomModule, SessionModule, TicketModule, SeatModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
