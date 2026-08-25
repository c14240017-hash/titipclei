# JastipHub

Modern Indonesian personal shopping (jastip) platform MVP.

## Requirements
- Node.js 18+
- PostgreSQL

## Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Environment variables
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Ensure you have a running PostgreSQL instance and configure `DATABASE_URL`.

## Database Setup
Run Prisma migrations to create the tables:
```bash
npx prisma migrate dev --name init
```

## Prisma Seed
Seed the database with initial admin user, mock products, categories, etc.:
```bash
npm run seed
```

## Demo Account
For local development, you can login with:
- **Email:** admin@jastiphub.com
- **Password:** admin123 (or as defined in your seed)

## Exchange-rate configuration
By default, the platform uses a mock exchange rate provider. To use a real API, change `EXCHANGE_RATE_PROVIDER` to `real` in `.env` and provide a valid `EXCHANGE_RATE_API_KEY`.

## Midtrans configuration
Add your Midtrans keys to `.env` to enable real payment processing. If unavailable, the platform falls back to mock payment.

## Run Development
Start the Next.js development server:
```bash
npm run dev
```
Access the application at `http://localhost:3000`.

## Build
To build for production:
```bash
npm run build
```

## Deployment
Deploy to Vercel:
1. Connect your GitHub repository to Vercel.
2. Add your environment variables in the Vercel dashboard.
3. Deploy! The Vercel build command is automatically set to `next build` and install command to `npm install`.
