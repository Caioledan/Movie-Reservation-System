import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';

describe('StripeService', () => {
  let service: StripeService;

  beforeEach(async () => {
    process.env.STRIPE_API_SECRET = 'sk_test_mock';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock';
    process.env.FRONTEND_URL = 'http://localhost:3000';

    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeService],
    }).compile();

    service = module.get<StripeService>(StripeService);
  });

  afterEach(() => {
    delete process.env.STRIPE_API_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.FRONTEND_URL;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
