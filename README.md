# Spelklar – Digital Match Protocol for Swedish Grassroots Sports

A modern, mobile-first app that replaces clipboards at the scoring table and connects parents with live match updates, team follows, and photo sharing.

## 🎯 What is Spelklar?

Spelklar eliminates the administrative burden of recording match events at grassroots sports tournaments. It:

- **Staff (Sekretariat):** Record goals, penalties, timeouts, substitutions in real-time on a tablet
- **Parents/Visitors:** Follow their child's team, see live scores, view match photos, share game moments
- **Clubs:** Manage teams, tournaments, and matchups from a dashboard

## ✨ Features

### Phase 1: Persistence & Authentication ✓
- SQLite database (upgradeable to PostgreSQL)
- SMS OTP login via 46elks
- **Demo Mode:** Accept any 6-digit OTP code (no real SMS needed!)
- JWT sessions with httpOnly cookies
- Staff and visitor role separation

### Phase 2: Teams & Followers ✓
- Create clubs and teams
- Follow teams to get live updates
- Sticky live score banner at top of feed
- Real-time Socket.io updates
- Personalized feed showing followed team matches

### Phase 3: Photo Feed & GDPR ✓
- **Photo Sharing:** Parents upload photos during matches
- **Mandatory Moderation:** Staff approves/rejects before publishing
- **GDPR Compliance:**
  - Explicit consent tracking per photo + per person
  - Match-scoped privacy (photos only visible to match followers)
  - Soft-delete with 30-day hard-delete grace period
  - Right-to-erasure implementation
  - Swedish language consent notices
- **Storage:** Cloudflare R2 (zero egress fees, perfect for photo-heavy apps)
- **Real-time Updates:** Socket.io broadcasts new photos instantly

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repo>
cd Spelklar
```

### 2. Run Demo (Auto-Setup)

**Windows:**
```bash
start-demo.bat
```

**Mac/Linux:**
```bash
bash start-demo.sh
```

**Manual Setup:**
```bash
# Terminal 1: Backend
cd spelklar-server
npm install
npm run seed    # Populate demo data
npm start       # Runs on localhost:3001

# Terminal 2: Frontend
cd spelklar-client
npm install
npm run dev     # Runs on localhost:5173
```

### 3. Access the App
- **App:** http://localhost:5173
- **Login:** Use any phone (+46...) and **any 6-digit code** (demo mode!)
- **Demo Guide:** See `DEMO_GUIDE.md` for full walkthrough

## 📊 Tech Stack

### Backend
- **Runtime:** Node.js + Express 5
- **Database:** Prisma ORM + SQLite (dev) / PostgreSQL (production)
- **Real-time:** Socket.io v4
- **Storage:** AWS S3 compatible (Cloudflare R2)
- **Auth:** JWT + SMS OTP (46elks)
- **Image Processing:** Sharp

### Frontend
- **Framework:** React 19 + Vite
- **Routing:** React Router v7
- **Real-time:** Socket.io client
- **Styling:** Vanilla CSS with design tokens
- **Mobile:** Responsive, tablet-first

## 📱 Key Pages

### Staff (Scoring)
- `/` – Create/join matches
- `/match/:id` – Live scoring interface
- `/match/:id/end` – Post-match summary & CSV export
- `/admin` – Dashboard of all matches
- `/admin/photos` – Photo moderation queue

### Parents/Visitors
- `/login` – SMS OTP authentication
- `/feed` – Personalized feed (live matches from followed teams)
- `/feed/:id` – Combined match feed (events + photos)
- `/live/:id` – Public supporter view (no login required)
- `/team/:id` – Team page with follow button

## 🗄️ Database Schema

### Core Models
- **User** – Phone-based auth, roles (visitor/staff/admin)
- **Club** – Organization (AIK Fotboll, Hammarby, etc.)
- **Team** – Squad within a club
- **Match** – Game between two teams
- **MatchEvent** – Goals, penalties, timeouts, subs
- **Photo** – User-uploaded images with moderation status
- **PhotoConsent** – GDPR consent audit trail
- **Follow** – User following a team

## 🔐 Security & Privacy

- **Auth:** JWT in httpOnly cookies (XSS-resistant)
- **GDPR Ready:**
  - Explicit consent for children's photos
  - Photo deletion with 30-day grace period
  - Consent audit trail
  - Match-scoped visibility
  - Soft deletes for compliance
- **Image Security:** Client-side compression + EXIF stripping before upload
- **Rate Limiting:** Ready for production middleware
- **HTTPS:** Enforced on production (Render + Vercel)

## 📈 Deployment

### Frontend (Vercel)
```bash
git push origin main
# Auto-deploys to Vercel
# Set env: VITE_SERVER_URL=https://your-api.com
```

### Backend (Render)
```bash
git push origin main
# Auto-deploys to Render
# Set env:
#   JWT_SECRET=your-secret
#   SMS_USERNAME=46elks-user
#   SMS_PASSWORD=46elks-pass
#   R2_ACCOUNT_ID=cloudflare-id
#   R2_ACCESS_KEY_ID=...
#   R2_SECRET_ACCESS_KEY=...
#   R2_BUCKET_NAME=spelklar-photos
#   FRONTEND_URL=https://your-app.vercel.app
```

## 💾 Demo Data

Run `npm run seed` in `spelklar-server/` to populate:

**Users:**
- Anna P. (parent) – +46701234567
- Erik S. (staff) – +46702345678
- Göran B. (visitor) – +46703456789

**Clubs:** AIK Fotboll, Hammarby Sjöstad, Solna IK

**Teams:** 4 U12 teams across the clubs

**Matches:**
- `DEMO01` – Pre-game (AIK U12 Blå vs Hammarby U12)
- `LIVE01` – Live match (AIK U12 Gul 2-1 Solna U12) with 3 demo photos

## 🧪 Testing

### Manual Testing
See `DEMO_GUIDE.md` for step-by-step scenarios:
- Parent experience (login → follow team → see live score → upload photo)
- Staff experience (approve/reject photos)
- Moderation workflow

### API Testing
```bash
# Get match
curl http://localhost:3001/api/match/LIVE01

# Get photos
curl http://localhost:3001/api/photos?matchId=LIVE01
```

## 🛠️ Development

### Project Structure
```
Spelklar/
├── spelklar-server/          # Express backend
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── middleware/       # Auth, etc.
│   │   ├── utils/            # R2 storage
│   │   ├── db.js             # Prisma wrapper
│   │   ├── index.js          # Server entry
│   │   └── seed.js           # Demo data
│   ├── prisma/
│   │   ├── schema.prisma     # Data model
│   │   └── migrations/       # DB migrations
│   └── package.json
├── spelklar-client/          # React frontend
│   ├── src/
│   │   ├── pages/            # Routes
│   │   ├── components/       # Reusable UI
│   │   ├── api.js            # API client
│   │   └── App.jsx
│   └── package.json
├── DEMO_GUIDE.md             # Demo walkthrough
├── README.md                 # This file
└── start-demo.bat/.sh        # Start both servers
```

### Key APIs

**Match Management:**
- `POST /api/match` – Create
- `GET /api/match/:id` – Fetch
- `POST /api/match/:id/start` – Start timer
- `POST /api/match/:id/event` – Log event
- `DELETE /api/match/:id/event` – Undo
- `POST /api/match/:id/end` – End match

**Authentication:**
- `POST /api/auth/request-otp` – Request code
- `POST /api/auth/verify-otp` – Verify & login
- `GET /api/auth/me` – Current user
- `POST /api/auth/logout` – Logout

**Photos:**
- `POST /api/photos/upload-url` – Get presigned URL
- `GET /api/photos?matchId=xxx` – List (approved only for visitors)
- `PATCH /api/photos/:id/moderate` – Approve/reject (staff)
- `DELETE /api/photos/:id` – Soft-delete
- `GET /api/photos/moderate/pending` – Moderation queue (staff)

**Teams & Follows:**
- `POST /api/teams` – Create team
- `GET /api/teams?clubId=xxx` – List
- `POST /api/follows` – Follow team
- `DELETE /api/follows/:teamId` – Unfollow
- `GET /api/follows/mine/live` – My live matches

## 📝 Environment Variables

**Backend (spelklar-server/.env):**
```
DATABASE_URL=file:./prisma/spelklar.db
JWT_SECRET=your-secret-key
SMS_USERNAME=46elks-user
SMS_PASSWORD=46elks-pass
R2_ACCOUNT_ID=cloudflare-id
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=spelklar-photos
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=3001
```

**Frontend (spelklar-client/.env):**
```
VITE_SERVER_URL=http://localhost:3001
```

## 🎨 Design System

- **Colors:** Deep green (#1F3D2B) primary, accent greens for actions
- **Typography:** Inter font family
- **Spacing:** 4/8/16/24/40/64px scale
- **Components:** Nordic minimalist, zero-configuration design
- **Dark Mode:** Supported across all pages

## 📚 Documentation

- `DEMO_GUIDE.md` – Step-by-step demo walkthrough
- `.agent/product_context/vision.md` – Product strategy & roadmap
- `.agent/UI/design_system.md` – Complete design tokens & rules

## 🚧 Roadmap

### Phase 4: Tournaments & Polish
- Tournament model + feed aggregation
- Performance optimization (virtualized lists, lazy loading)
- Accessibility audit
- Dark mode refinement

### Phase 5: Monetization & Scale
- Web push notifications
- PostgreSQL migration
- BankID integration (payments)
- Sponsor marketplace
- Kiosk pre-orders
- Digital lottery (Tombola)
- Fan pass subscriptions

## 📄 License

ISC

## 🤝 Contributing

This is a collaborative project. See git history for contributors.

## 📞 Support

For issues or questions, check:
1. `DEMO_GUIDE.md` – Troubleshooting section
2. Server console logs (Terminal 1)
3. Browser DevTools (F12)

---

**Built for Swedish grassroots sports.** ⚽🇸🇪
