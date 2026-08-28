import { Test, TestingModule } from '@nestjs/testing';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('SessionController', () => {
  let controller: SessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [
        SessionService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SessionController>(SessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
