# Lacrosse Coach Tracker - Multi-Player Architecture

A scalable Next.js application for tracking lacrosse player performance using a 3-number impact system.

## 🏗️ **Architecture Overview**

### **Multi-Player Domain Model**
- **Teams**: Manage multiple teams with seasons
- **Players**: Individual roster management with jersey numbers
- **Games**: Track games against opponents with locations
- **Game Stats**: Individual player performance per game

### **3-Number Impact System**
- **Ground Balls (GB)**: Target 3-5 per game
- **Screens (SC)**: Target 4-6 per game
- **Effort Plays (EP)**: Target 3+ per game
- **Impact Score**: GB + SC + EP (Auto-calculated)

### **Performance Labels**
- **Excellent**: 10+ impact score
- **Strong**: 7-9 impact score
- **Solid**: 5-6 impact score
- **Developing**: <5 impact score

## 🚀 **Features**

### **📱 Live Game Tracker** (`/tracker`)
- Mobile-first touch interface
- Player selection with jersey numbers
- Tap counters for each stat type
- Real-time impact score calculation
- Undo functionality and game reset
- Save complete game with all player stats

### **📊 Team Dashboard** (`/dashboard`)
- Season summary cards
- Top performer leaderboards
- Team performance trends
- Recent game summaries
- Visual analytics with color coding

### **👥 Player Management** (`/players`)
- Player roster cards with stats
- Individual player profiles (`/players/[id]`)
- Progress tracking against targets
- Season averages and trends
- Game-by-game performance history

### **🎯 Player Detail Pages**
- Season statistics breakdown
- Progress bars against canonical targets
- Performance trend charts
- Recent game history
- Notes and observations

## 🔧 **Technical Stack**

### **Frontend**
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** with shadcn-style components
- **Responsive design** (mobile-first)

### **Backend**
- **Neon PostgreSQL** with computed columns
- **@neondatabase/serverless** for edge compatibility
- **REST API** with comprehensive validation
- **Modular query architecture**

### **Database Schema**
```sql
teams (id, name, season, created_at)
players (id, team_id, first_name, last_name, jersey_number, active)
games (id, team_id, game_date, opponent, location)
game_stats (id, game_id, player_id, ground_balls, screens, effort_plays, impact_score, notes)
```

## 🛠️ **Setup Instructions**

### **Prerequisites**
- Node.js 18+
- Neon database account

### **Installation**
```bash
# Install dependencies
npm install

# Database is already configured with sample data:
# - 2 teams (Eagles, Lions)
# - 6 players with jersey numbers
# - 4 games with 14 player performances
```

### **Environment**
Your `.env.local` is configured with:
```env
DATABASE_URL="postgresql://neondb_owner:npg_61QucVHzmyTB@ep-round-bread-a4o46i06-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
```

### **Development**
```bash
npm run dev
# Open http://localhost:3000
```

### **Production Build**
```bash
npm run build
npm start
```

## 📁 **Project Structure**

```
app/
├── page.tsx                    # Landing page with system explanation
├── dashboard/page.tsx          # Team analytics dashboard
├── players/page.tsx            # Player roster management
├── players/[playerId]/page.tsx # Individual player profiles
├── tracker/page.tsx            # Live game tracking interface
└── api/                        # REST API routes
    ├── players/route.ts        # Player CRUD
    ├── games/route.ts          # Game management
    ├── tracker/route.ts        # Live tracking save/update
    └── summary/route.ts        # Analytics queries

components/
├── ui/                         # Base shadcn-style components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── select.tsx
│   └── badge.tsx
└── tracker/
    └── TapCounter.tsx          # Mobile-optimized tap interface

lib/
├── definitions.ts              # Canonical stat definitions & targets
├── types.ts                    # TypeScript interfaces
├── utils.ts                    # Utility functions
├── db.ts                       # Database connection
└── queries/                    # Modular query layers
    ├── players.ts
    ├── games.ts
    └── summaries.ts

scripts/
└── schema.sql                  # Complete database schema
```

## 🎯 **Usage Workflow**

### **1. Game Day Tracking**
1. Navigate to `/tracker`
2. Set game date, opponent, location
3. Select player to track
4. Use tap counters during the game
5. Save complete game stats

### **2. Performance Review**
1. View team dashboard at `/dashboard`
2. Review individual players at `/players`
3. Analyze trends and progress against targets
4. Plan coaching adjustments

### **3. Season Management**
1. Add/manage players in `/players`
2. Review season summaries
3. Track improvement over time
4. Export data for external analysis

## 🚀 **Deployment**

### **Vercel (Recommended)**
```bash
# Connect repository to Vercel
# Add DATABASE_URL environment variable
# Deploy
```

### **Environment Variables**
```env
DATABASE_URL=your_neon_database_url
```

## 🔮 **Future Enhancements**

- **Authentication**: Coach/parent login system
- **Multi-team support**: League management
- **Advanced analytics**: Heat maps, comparisons
- **Mobile app**: Native iOS/Android
- **Parent portal**: Read-only access for families
- **Export features**: PDF reports, CSV data
- **Real-time updates**: Live game broadcasting

## 📊 **Sample Data**

The application comes pre-populated with:
- **Eagles & Lions teams** (2024 Spring season)
- **6 players** with realistic jersey numbers
- **4 completed games** with comprehensive stats
- **14 individual performances** showing various skill levels

## 🎖️ **Production Ready**

- ✅ **Type-safe** throughout with TypeScript
- ✅ **Error handling** and input validation
- ✅ **Mobile responsive** design
- ✅ **Performance optimized** queries
- ✅ **Scalable architecture** for growth
- ✅ **Clean abstractions** for maintainability

---

Ready to track your team's impact! 🥍