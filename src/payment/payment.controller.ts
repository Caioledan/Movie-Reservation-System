import { Body, Controller, Get, Param, Post, Headers, RawBody, BadRequestException, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { StripeService } from './stripe/stripe.service';
import { TicketService } from 'src/ticket/ticket.service';
import type { Request } from 'express';

@Controller('payment')
export class PaymentController {
    constructor(private readonly stripeService: StripeService, private readonly ticketService: TicketService) { }

    @Post('create-checkout-session')
    async createCheckoutSession(
        @Body('ticketId') ticketId: string,
        @Body('amount') amount: number,
    ) {
        const sessionUrl = await this.stripeService.createCheckoutSession(ticketId, amount);
        return { url: sessionUrl };
    }


    @Post('webhook')
    async handleWebHook(
        @Headers('stripe-signature')
        signature: string,
        @Req() req: RawBodyRequest<Request>,
    ) {
        if (!signature) {
            throw new BadRequestException('Missing stripe-signature header');
        }

        let event;

        try {
            event = this.stripeService.constructEventFromPayload(signature, req.rawBody!);
        }
        catch (error: any) {
            throw new BadRequestException(`Webhook Error: ${error.message}`)
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const ticketId = session.metadata?.ticketId;

            if (ticketId) {
                try {
                    await this.ticketService.updateTicket(ticketId, {
                        status: 'CONFIRMED',
                    });
                } catch (e: any) {
                    console.error('Failed to update ticket in database:', e.message);
                }
            }
        }
    }
}
