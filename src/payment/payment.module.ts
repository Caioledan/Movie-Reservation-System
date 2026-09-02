import { Module } from '@nestjs/common';
import { StripeService } from './stripe/stripe.service';
import { PaymentController } from './payment.controller';
import { TicketModule } from '../ticket/ticket.module';

@Module({
  providers: [StripeService],
  controllers: [PaymentController],
  imports: [TicketModule],
})
export class PaymentModule { }
