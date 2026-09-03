# Movie Reservation System API

A robust, scalable, and cloud-native RESTful API built with NestJS for managing a movie theater reservation system. This project handles everything from user authentication and movie scheduling to real-time seat reservations and secure payment processing via Stripe. This project was based on this [https://roadmap.sh/projects/movie-reservation-system](https://roadmap.sh/projects/movie-reservation-system) project.

## Live Demo & Documentation

- **Live API Endpoint:** [https://movie-reservation-system-91u9.onrender.com](https://movie-reservation-system-91u9.onrender.com)
- **Swagger Interactive Docs:** [https://movie-reservation-system-91u9.onrender.com/api/docs](https://movie-reservation-system-91u9.onrender.com/api/docs)

*(Note: Hosted on Render's free tier. The initial request may take up to 50 seconds to spin up if the server is asleep).*

## Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) (Node.js)
- **Database:** PostgreSQL (hosted on [Neon](https://neon.tech/))
- **ORM:** [Prisma v7](https://www.prisma.io/)
- **Authentication:** JWT (JSON Web Tokens) with Passport and Bcrypt
- **Payment Gateway:** [Stripe](https://stripe.com/) Checkout & Webhooks
- **API Documentation:** Swagger / OpenAPI
- **Containerization:** Docker (Multi-stage builds)
- **CI/CD:** GitHub Actions (Automated testing and linting)
- **Security & Performance:** Helmet, CORS, and Throttler (Rate Limiting)
- **Testing:** Jest (70+ passing unit tests)

## Features

- **User Authentication:** Secure registration and login using JWT. Passwords are encrypted with Bcrypt.
- **Movies & Sessions Management:** Admins can manage the movie catalog, theater rooms, and screening sessions.
- **Seat Booking:** Users can browse available sessions, view seating arrangements, and reserve specific seats.
- **Stripe Integration:** Full checkout process integrated with Stripe. Payment confirmation is handled asynchronously via secure Stripe Webhooks to guarantee data integrity.
- **Role-based Access Control (RBAC):** Distinct permissions for `CUSTOMER` and `ADMIN` users.
- **Security:** Built-in rate limiting (100 requests/minute), HTTP header security via Helmet, and properly configured CORS.
- **Production Ready:** Fully containerized with a lightweight production Docker image.

## Project Architecture & Modules

The application is heavily modularized following NestJS best practices:
- `AuthModule` / `UsersModule`: Identity and access management.
- `MoviesModule`: Movie catalog and metadata.
- `RoomsModule` / `SeatsModule`: Physical theater layouts and capacities.
- `SessionsModule`: Screening schedules bridging movies and rooms.
- `TicketsModule`: Booking ledger and reservations.
- `PaymentModule`: Stripe checkout session creation and Webhook fulfillment.

## Local Development Setup

### Prerequisites
- Node.js (v20+)
- Docker (optional, for local database)
- Stripe CLI (for local webhook testing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Caioledan/Movie-Reservation-System.git
cd Movie-Reservation-System
```

2. Install dependencies:
```bash
npm install
```

3. Configure Environment Variables:
Create a `.env` file in the root directory based on `.env.example` (if provided) or add the following keys:
```env
DATABASE_URL="postgresql://user:password@localhost:5433/mydb"
JWT_SECRET="your_super_secret_jwt_key"
STRIPE_API_SECRET="sk_test_your_stripe_secret"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"
PORT=3000
```

4. Database Setup (Prisma):
```bash
npx prisma migrate dev
npx prisma db seed
```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### Testing

The project is fully covered by unit tests, specially mocking external services like Stripe.
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov
```

## Deployment

This project includes a `Dockerfile` optimized for production and a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs tests and linters on every push to the `main` branch. 

It is currently deployed on **Render** as a Web Service, automatically applying database migrations via Prisma's `migrate deploy` command during the build phase.

## License

This project is [MIT licensed](LICENSE).
