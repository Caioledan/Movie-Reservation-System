# Step 1: Base image for building the application
FROM node:20-alpine AS builder

# Step 2: Set working directory inside the container
WORKDIR /app

# Step 3: Copy dependency files
COPY package*.json ./
COPY prisma ./prisma/

# Step 4: Install dependencies (including dev dependencies for the build)
RUN npm install

# Step 5: Copy the rest of the source code
COPY . .

# Step 6: Build Prisma client and NestJS application
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate
RUN npm run build

# Step 7: Lighter final image for running in production
FROM node:20-alpine

WORKDIR /app

# Step 8: Copy only necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Step 9: Expose the port the application listens on
EXPOSE 3000

# Step 10: Command to run the application in production
CMD ["npm", "run", "start:prod"]
