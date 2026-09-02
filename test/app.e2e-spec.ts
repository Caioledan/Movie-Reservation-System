import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let adminToken: string;
  let createdMovieId: string;
  let createdRoomId: string;
  let createdSessionId: string;

  const testEmail = 'e2e_test_admin@cine.com';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    await prisma.ticket.deleteMany({});
    await prisma.seat.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.movie.deleteMany({ where: { title: 'E2E Test Movie' } });
    await prisma.room.deleteMany({ where: { number: 9999 } });
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({});
    await prisma.seat.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.movie.deleteMany({ where: { title: 'E2E Test Movie' } });
    await prisma.room.deleteMany({ where: { number: 9999 } });

    await app.close();
    await prisma.$disconnect();
  });

  describe('Auth Flow', () => {
    it('should register an admin user', async () => {
      const res = await request(app.getHttpServer())
        .post('/user')
        .send({
          name: 'E2E Admin',
          email: testEmail,
          password: 'Password123!',
          role: 'ADMIN',
        })
        .expect(201);

      expect(res.body.email).toBe(testEmail);
    });

    it('should login the admin user and get a token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'Password123!',
        })
        .expect(200);

      expect(res.body.access_token).toBeDefined();
      adminToken = res.body.access_token;
    });
  });

  describe('Movie Flow', () => {
    it('should create a movie', async () => {
      const res = await request(app.getHttpServer())
        .post('/movie/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'E2E Test Movie',
          description: 'A great movie for E2E tests',
          posterImage: 'http://example.com/poster.jpg',
          genre: 'Action',
          ageRating: '14+',
          duration: 120,
          language: 'Portuguese',
          releaseDate: '2025-01-01T00:00:00Z',
        })
        .expect(201);

      expect(res.body.title).toBe('E2E Test Movie');
      createdMovieId = res.body.id;
    });
  });

  describe('Room & Seat Flow', () => {
    it('should create a room', async () => {
      const res = await request(app.getHttpServer())
        .post('/room')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          number: 9999,
          capacity: 50,
        })
        .expect(201);

      expect(res.body.number).toBe(9999);
      createdRoomId = res.body.id;
    });
  });

  describe('Session Flow', () => {
    const sessionStartTime = '2027-01-01T12:00:00Z';

    it('should create a session', async () => {
      const res = await request(app.getHttpServer())
        .post('/session')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          movieId: createdMovieId,
          roomId: createdRoomId,
          startTime: sessionStartTime,
        })
        .expect(201);

      expect(res.body.movieId).toBe(createdMovieId);
      createdSessionId = res.body.id;
    });

    it('should NOT allow creating an overlapping session', async () => {
      const overlapTime = '2027-01-01T13:00:00Z';

      const res = await request(app.getHttpServer())
        .post('/session')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          movieId: createdMovieId,
          roomId: createdRoomId,
          startTime: overlapTime,
        })
        .expect(409);

      expect(res.body.message).toContain(
        'Room is already booked for this time',
      );
    });
  });

  describe('Ticket Flow', () => {
    it('should reserve a seat', async () => {
      const seats = await prisma.seat.findMany({
        where: { roomId: createdRoomId },
        take: 1,
      });

      const res = await request(app.getHttpServer())
        .post('/ticket')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          sessionId: createdSessionId,
          seatId: seats[0].id,
          transactionId: 'tx_1234567890',
          totalAmount: 25.5,
          status: 'CONFIRMED',
        })
        .expect(201);

      expect(res.body.sessionId).toBe(createdSessionId);
      expect(res.body.seatId).toBe(seats[0].id);
      expect(res.body.status).toBe('CONFIRMED');
    });
  });
});
