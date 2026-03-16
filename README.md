# Lacrosse Coach Tracker

A modern Next.js application for tracking lacrosse game statistics and performance metrics.

## Features

- **Game Tracking**: Record ground balls, screens, and effort plays for each game
- **Impact Score**: Automatic calculation of impact score (ground_balls + screens + effort_plays)
- **Dashboard Analytics**:
  - Season summary cards
  - Visual impact performance gauge
  - Recent games table with color-coded scores
  - Performance trend chart
- **Mobile Responsive**: Optimized for all device sizes
- **Real-time Updates**: Dashboard refreshes automatically after adding new games

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Neon PostgreSQL with @neondatabase/serverless
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- A Neon database account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd lacrosse-coach-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Neon database URL:
```env
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
```

5. Run the database schema:
```sql
-- Execute the contents of schema.sql in your Neon database console
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses a single `games` table with the following structure:

- `id`: Primary key
- `game_date`: Date of the game
- `opponent`: Name of the opposing team
- `ground_balls`: Number of ground balls recovered
- `screens`: Number of screens set
- `effort_plays`: Number of effort plays made
- `impact_score`: Computed field (ground_balls + screens + effort_plays)
- `created_at` / `updated_at`: Timestamps

## API Endpoints

- `GET /api/games` - Retrieve all games
- `POST /api/games` - Create a new game
- `GET /api/summary` - Get season summary and trend data

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── games/route.ts
│   │   └── summary/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── GameForm.tsx
│   ├── GamesTable.tsx
│   ├── ImpactGauge.tsx
│   ├── SummaryCards.tsx
│   └── TrendChart.tsx
├── lib/
│   └── db.ts
├── schema.sql
└── package.json
```

## Performance Scoring

The impact score is calculated as: `ground_balls + screens + effort_plays`

Performance levels:
- **Excellent**: 12+ average impact score
- **Good**: 8-11 average impact score
- **Fair**: 5-7 average impact score
- **Needs Work**: <5 average impact score

## Deployment

This application is optimized for Vercel deployment:

1. Connect your repository to Vercel
2. Add your `DATABASE_URL` environment variable
3. Deploy

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Linting
npm run lint
```