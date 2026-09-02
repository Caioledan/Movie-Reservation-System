import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { StripeService } from './stripe/stripe.service';
import { TicketService } from 'src/ticket/ticket.service';

describe('PaymentController', () => {
  let controller: PaymentController;

  beforeEach(async () => {
    const mockStripeService = {
      createCheckoutSession: jest.fn(),
      constructEventFromPayload: jest.fn(),
    };

    const mockTicketService = {
      updateTicket: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        { provide: StripeService, useValue: mockStripeService },
        { provide: TicketService, useValue: mockTicketService },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
