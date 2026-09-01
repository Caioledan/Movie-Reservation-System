import { PrismaClient } from '../generated/prisma/client';
import { Role } from '../generated/prisma/enums';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

declare var process: any;

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  } as any),
});

async function main() {
  console.log('Starting seed...');

  // 1. Create an Admin User
  const salt = 10;
  const hashedPassword = await bcrypt.hash('admin123', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cine.com' },
    update: {},
    create: {
      name: 'Admin Cinema',
      email: 'admin@cine.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log('Admin user seeded:', admin.email);

  // 2. Create a Movie
  const movie = await prisma.movie.create({
    data: {
      title: 'Inception',
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
      posterImage: 'https://image.url/inception.jpg',
      genre: 'Sci-Fi',
      ageRating: 'PG-13',
      duration: 148, // 148 minutes
      language: 'English',
      releaseDate: new Date('2010-07-16T00:00:00Z'),
    },
  });
  console.log('Movie seeded:', movie.title);

  // 3. Create a Room with Seats
  const room = await prisma.room.create({
    data: {
      number: 1,
      capacity: 50,
    },
  });
  console.log('Room seeded: Room', room.number);

  // Generate 50 seats for Room 1 (e.g. A1, A2...)
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = 10;
  
  const seatsData: any[] = [];
  for (let i = 0; i < rows.length; i++) {
    for (let j = 1; j <= seatsPerRow; j++) {
      seatsData.push({
        roomId: room.id,
        seatNumber: `${rows[i]}${j}`,
      });
    }
  }
  
  await prisma.seat.createMany({
    data: seatsData,
  });
  console.log(`Generated ${seatsData.length} seats for Room ${room.number}.`);

  // 4. Create a Session
  const session = await prisma.session.create({
    data: {
      movieId: movie.id,
      roomId: room.id,
      startTime: new Date('2024-12-25T18:00:00Z'),
      endTime: new Date(new Date('2024-12-25T18:00:00Z').getTime() + 148 * 60000),
    },
  });
  console.log('Session seeded starting at:', session.startTime);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
