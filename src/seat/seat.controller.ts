import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SeatService } from './seat.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';

@Controller('seat')
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Post()
  createSeat(@Body() data: CreateSeatDto) {
    return this.seatService.createSeat(data);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  updateSeat(@Param('id') seatId: string, @Body() data: UpdateSeatDto) {
    return this.seatService.updateSeat(seatId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  deleteSeat(@Param('id') seatId: string) {
    return this.seatService.deleteSeat(seatId);
  }

  @Get(':id')
  getSeatById(@Param('id') seatId: string) {
    return this.seatService.getSeatById(seatId);
  }

  @Get()
  getAllSeats() {
    return this.seatService.getAllSeats();
  }
}
