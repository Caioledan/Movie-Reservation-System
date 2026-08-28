import { Test, TestingModule } from '@nestjs/testing';
import { SeatController } from './seat.controller';
import { SeatService } from './seat.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('SeatController', () => {
  let controller: SeatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeatController],
      providers: [
        SeatService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SeatController>(SeatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
