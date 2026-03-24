# Spelklar Demo Guide

Welcome! This guide will get you from zero to exploring the full Spelklar app in under 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Two terminal windows (for backend and frontend)
- A browser

## 1. Setup (2 minutes)

### Terminal 1: Start the Backend

```bash
cd spelklar-server
npm install  # (only first time)
npm run seed # Populate demo data
npm start    # Start server on port 3001
```

You should see:
```
🌱 Seeding demo data...
✅ Seed complete! Demo data ready.
✅ Spelklar server running on port 3001
```

### Terminal 2: Start the Frontend

```bash
cd spelklar-client
npm install  # (only first time)
npm run dev  # Start dev server on port 5173
```

You should see:
```
Local: http://localhost:5173/
```

## 2. Access the App (1 minute)

Open your browser to: **http://localhost:5173**

You'll see the **staff entry screen** (scoring interface).

## 3. Quick Demo Scenarios

### Scenario A: Full Parent Experience (2 minutes)

**Goal:** Login as a parent, see a live match feed with photos and events, upload a photo.

1. **Navigate to login**
   - Click the login link or go to: `http://localhost:5173/login`

2. **Login as parent (Anna)**
   - Phone: `+46701234567`
   - OTP code: **Any 6-digit number** you want (e.g., `123456` or `999999`)
   - Demo mode accepts any code! Just make it up.
   - Submit ✓

3. **View personalized feed**
   - You're redirected to `/feed`
   - Shows "1 live match" from teams you follow
   - Click on "AIK U12 Gul vs Solna U12"

4. **Explore the match feed**
   - URL is now: `http://localhost:5173/feed/LIVE01`
   - See the **sticky live score** at the top (AIK U12 Gul 2-1 Solna U12)
   - See **events** in the feed (goals, subs)
   - See **2 approved photos** ("Great goal", "Full team photo")
   - See **1 pending photo** ("Team celebration" with ⏳ badge)

5. **Upload a photo**
   - Tap the **📷 button** (floating action button, bottom-right)
   - Photo upload modal opens
   - Either take a new photo (if on mobile) or choose one from your computer
   - Add a caption: "My photo!"
   - Check the consent box
   - Tap "Share photo"
   - Your photo appears in the feed with ⏳ badge

---

### Scenario B: Staff Moderation Experience (2 minutes)

**Goal:** Login as staff, approve/reject pending photos.

1. **Open a new incognito/private window** (to stay logged in as Anna in the other tab)

2. **Navigate to login**
   - `http://localhost:5173/login`

3. **Login as staff (Erik)**
   - Phone: `+46702345678`
   - OTP code: Any 6 digits (e.g., `111111`)
   - Submit ✓

4. **Go to moderation queue**
   - Direct URL: `http://localhost:5173/admin/photos`
   - See 2 pending photos (the one from the demo + the one you uploaded as Anna)

5. **Approve a photo**
   - Click on a photo to enlarge
   - Tap **✓ Approve**
   - Photo disappears from queue and reappears in the match feed with ✓ badge

6. **Reject a photo**
   - Click another photo
   - Tap **✕ Reject**
   - Photo removed from queue

---

### Scenario C: Pre-Game Match View (1 minute)

**Goal:** See an upcoming match that hasn't started yet.

1. Go to: `http://localhost:5173/feed/DEMO01`
2. See:
   - Match: AIK U12 Blå vs Hammarby U12
   - Status: ⏱ Not started
   - No photos yet (pre-game)
   - 📷 Upload button still available

---

## 4. Demo Data Reference

### Users (Phone Numbers for Login)

| Role | Phone | Name | Notes |
|------|-------|------|-------|
| Parent | `+46701234567` | Anna P. | Follows AIK U12 Blå |
| Staff | `+46702345678` | Erik S. | Can moderate photos |
| Visitor | `+46703456789` | Göran B. | Follows AIK U12 Blå |

### Clubs & Teams

- **AIK Fotboll**
  - AIK U12 Blå (followed by Anna & Göran)
  - AIK U12 Gul
- **Hammarby Sjöstad**
  - Hammarby U12
- **Solna IK**
  - Solna U12

### Demo Matches

| ID | Home | Away | Status | Score | Photos | Notes |
|---|---|---|---|---|---|---|
| `DEMO01` | AIK U12 Blå | Hammarby U12 | ⏱ Pre-game | 0-0 | None | Start here |
| `LIVE01` | AIK U12 Gul | Solna U12 | 🔴 LIVE | 2-1 | 3 (1 pending) | Full demo |

### Demo Photos (on LIVE01)

1. ✓ Approved: "Great goal by Victor!"
2. ⏳ Pending: "Team celebration"
3. ✓ Approved: "Full team photo"

---

## 5. Key URLs

| Route | Purpose |
|-------|---------|
| `http://localhost:5173` | Home (staff scoring screen) |
| `http://localhost:5173/login` | Parent/visitor login |
| `http://localhost:5173/feed` | My feed (live matches from followed teams) |
| `http://localhost:5173/feed/DEMO01` | Pre-game match feed |
| `http://localhost:5173/feed/LIVE01` | Live match feed with photos ⭐ |
| `http://localhost:5173/admin/photos` | Photo moderation queue (staff) |
| `http://localhost:5173/match/LIVE01` | Staff scoring screen (edit match) |

---

## 6. Reset Demo Data

If you mess up the demo data:

```bash
cd spelklar-server
npm run seed  # Clears everything and repopulates
```

---

## 7. Troubleshooting

### "OTP code not working"
- In demo mode, **any 6-digit code works** (e.g., `123456`, `999999`)
- Just type any number and submit
- If you want to see the server-generated code, check Terminal 1 for: `🔐 OTP for +46701234567: XXXXXX`

### "Photos not uploading"
- R2 not configured (expected in demo)
- Photos stored in "demo mode" - URLs are fake but the flow works
- To use real photos, configure R2 credentials in `.env`

### "Can't see the sticky score"
- Make sure you're on `/feed/LIVE01` (not `/feed`)
- Sticky score only shows for matches in "live" status

### "No photos showing on match feed"
- Photos require approval before they're visible to parents
- Go to `/admin/photos` (staff) to approve them
- Approved photos appear instantly on the feed via Socket.io

### Ports already in use?
- Backend: Kill process on port 3001 or change PORT=3002
- Frontend: Vite will suggest a new port automatically

---

## 8. Feature Checklist

Try these features during the demo:

### Phase 1: Persistence & Auth ✓
- [ ] Login with SMS OTP (demo uses phone numbers)
- [ ] Session persists (refresh page, still logged in)
- [ ] Different users see different data

### Phase 2: Teams & Follows ✓
- [ ] Follow a team
- [ ] Sticky live score appears when followed team plays
- [ ] My feed shows live matches
- [ ] Sticky score updates in real-time

### Phase 3: Photo Feed & GDPR ✓
- [ ] Upload a photo during a live match
- [ ] See pending photos (⏳ badge)
- [ ] Approve/reject photos as staff
- [ ] Approved photos appear instantly on feed
- [ ] Combined event + photo feed
- [ ] Consent tracking (photo shows who consented)
- [ ] Delete your own photos

---

## 9. API Testing (Optional)

If you want to test the API directly:

```bash
# Get a match
curl http://localhost:3001/api/match/LIVE01

# Get photos for a match
curl http://localhost:3001/api/photos?matchId=LIVE01

# Get pending photos (requires login cookie, so use browser)
# Just navigate to http://localhost:5173/admin/photos instead
```

---

## 10. Next Steps

### To explore staff scoring:
1. Go to `http://localhost:5173/match/LIVE01`
2. (You need to login as staff first - the demo doesn't auto-login)
3. See the scoring interface with action buttons
4. In a real scenario, staff would log events here while the game plays

### To test with real SMS:
1. Get credentials from [46elks.com](https://46elks.com)
2. Set in `.env`: `SMS_USERNAME=...`, `SMS_PASSWORD=...`
3. OTP codes will be sent via real SMS instead of logged to console

### To test with real R2 photos:
1. Set up [Cloudflare R2](https://www.cloudflare.com/products/r2/)
2. Get your account ID and API token
3. Set in `.env`: `R2_ACCOUNT_ID=...`, `R2_ACCESS_KEY_ID=...`, `R2_SECRET_ACCESS_KEY=...`, `R2_BUCKET_NAME=...`
4. Photos will upload to real R2 bucket

---

## 11. Code Structure

- **Backend:** `spelklar-server/` (Express + Prisma + Socket.io)
- **Frontend:** `spelklar-client/` (React + Vite)
- **Database:** SQLite (file-based, `spelklar-server/prisma/spelklar.db`)

## 12. Support

If something breaks:
1. Check the error in Terminal 1 or 2
2. Run `npm run seed` again to reset data
3. Check `.env` is configured
4. Restart servers

---

**Enjoy the demo!** 🎉
