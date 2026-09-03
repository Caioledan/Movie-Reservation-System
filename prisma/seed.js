"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../generated/prisma/client");
const enums_1 = require("../generated/prisma/enums");
const bcrypt = __importStar(require("bcrypt"));
const adapter_pg_1 = require("@prisma/adapter-pg");
require("dotenv/config");
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg({
        connectionString: process.env.DATABASE_URL,
    }),
});
async function main() {
    console.log('Starting seed...');
    const salt = 10;
    const hashedPassword = await bcrypt.hash('admin123', salt);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@cine.com' },
        update: {},
        create: {
            name: 'Admin Cinema',
            email: 'admin@cine.com',
            password: hashedPassword,
            role: enums_1.Role.ADMIN,
        },
    });
    console.log('Admin user seeded:', admin.email);
    const movie = await prisma.movie.create({
        data: {
            title: 'Inception',
            description: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
            posterImage: 'https://image.url/inception.jpg',
            genre: 'Sci-Fi',
            ageRating: 'PG-13',
            duration: 148,
            language: 'English',
            releaseDate: new Date('2010-07-16T00:00:00Z'),
        },
    });
    console.log('Movie seeded:', movie.title);
    const room = await prisma.room.create({
        data: {
            number: 1,
            capacity: 50,
        },
    });
    console.log('Room seeded: Room', room.number);
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const seatsPerRow = 10;
    const seatsData = [];
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
//# sourceMappingURL=seed.js.map