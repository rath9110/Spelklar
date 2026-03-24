# Spelklar Design System
**Tagline**: "Match protocol built for humans"
**Philosophy**: Calm under pressure. Designed for stress, not exploration.

---

## 🧠 Core Design Rules (Non-Negotiable)

These override all other decisions. When in doubt, return to these.

1. **One glance = full understanding.** No complex layouts. No deep navigation.
2. **Thumb-first.** Everything reachable with one hand. No stretch targets.
3. **Error forgiveness over confirmation.** Use timed undo (5s). Never ask "are you sure?".
4. **Zero cognitive load mid-match.** No settings visible during play. No decisions needed.
5. **Tablet-first, phone-compatible.** Layout must work on Desktop, iPad and phone.

---

## The "One-Tap" Philosophy

Every design decision must pass these three tests:

| Test | Standard |
|---|---|
| **Zero Training** | A parent can run the Sekretariat after < 60 seconds of onboarding |
| **Grandparent-Proof** | If a non-tech-savvy relative finds it confusing, it's too complex |
| **Forgiving by Design** | Every action in a high-pressure environment must have an immediate Undo |

---

## 🎨 Color Tokens

```
--color-base-bg:       #F7F7F5   /* Off-white, primary background */
--color-base-dark:     #1C1C1C   /* Near-black, primary text */
--color-primary:       #1F3D2B   /* Deep green — trust, Nordic feel */

--color-action-goal:   #2ECC71   /* Goal button */
--color-action-penalty:#E74C3C   /* Penalty button */
--color-action-timeout:#F39C12   /* Timeout button */
--color-action-sub:    #3498DB   /* Substitution button — calm blue */

--color-status-live:   #2ECC71   /* Online/live indicator */
--color-status-sync:   #F39C12   /* Syncing/offline indicator */

--color-undo-bg:       #1C1C1C   /* Undo bar background */
--color-undo-text:     #F7F7F5   /* Undo bar text */
```

**Dark mode**: Invert base tokens. Keep action colors identical — they must stay recognizable in low light.

```
/* Dark mode overrides */
--color-base-bg:   #1C1C1C
--color-base-dark: #F7F7F5
```

---

## 🔤 Typography

**Font**: `Inter`, fallback to system-ui.

| Role        | Weight  | Size (mobile) | Size (tablet) |
|-------------|---------|---------------|---------------|
| Match score | 700     | 48px          | 64px          |
| Timer       | 500     | 36px          | 48px          |
| Team names  | 500     | 20px          | 28px          |
| Button label| 600     | 18px          | 22px          |
| Body / meta | 400     | 14px          | 16px          |
| Undo text   | 500     | 14px          | 16px          |

**Rules**:
- Never use font weight below 400. Thin fonts are unreadable under stress.
- Avoid italics in functional UI. Reserve for quotes/brand only.
- All-caps only for status labels (e.g. "LIVE", "SYNCING").

---

## 📐 Spacing & Layout

```
--space-xs:   4px
--space-sm:   8px
--space-md:  16px
--space-lg:  24px
--space-xl:  40px
--space-2xl: 64px
```

**Layout Rules**:
- Action buttons must occupy ~50% of screen height on the match screen.
- Minimum tap target: **56px × 56px** (glove mode compliant).
- Prefer tap target: **72px+ height** for primary action buttons.
- Content padding: `--space-lg` (16px) minimum on all sides.
- Buttons: equal grid layout — 2×2 for the 4 main actions. No unequal sizing.

---

## 🟦 Shape & Elevation

```
--radius-sm:   8px
--radius-md:  12px
--radius-lg:  16px   /* Default for buttons and cards */
--radius-full: 9999px /* Pill shape — status badges only */
```

- **Borders**: Avoid hard borders. Use background contrast or very subtle `1px` in low contrast areas only.
- **Shadows**: Use only when needed to separate floating elements (e.g. undo bar). Keep soft:
  ```
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  ```
- **No decorative elements.** No gradients on action buttons. Flat color = faster recognition.

---

## ⚡ Interaction & Feedback

### Button States
| State    | Visual                                          |
|----------|-------------------------------------------------|
| Default  | Solid action color, `--radius-lg`               |
| Pressed  | Scale down to `0.96`, brightness `-8%`          |
| Pulse    | Brief scale pulse `1.0 → 1.04 → 1.0` (150ms)  |
| Disabled | 40% opacity, no interaction                     |

### Undo Bar (Critical Pattern)
- Appears immediately on any action. Never ask for confirmation.
- Countdown: 5 → 4 → 3 → 2 → 1 with animated progress bar.
- Disappears automatically. Tapping cancels/undoes the action.
- Full-width, fixed to bottom of screen. High contrast.

```
[ ⟲ Goal registered — undo? (5s) ████████░░ ]
```

### Haptic Feedback
| Event   | Intensity  |
|---------|------------|
| Goal    | Strong     |
| Penalty | Medium     |
| Timeout | Soft       |
| Sub     | Soft       |
| Undo    | Light tap  |

### Sound Feedback
- Optional. Toggle in settings (pre-match only — never mid-match).
- Default: OFF. Respect quiet environments.

---

## 📱 Screen Architecture

### Match Screen (The Product)
```
┌──────────────────────────────┐
│  AIK  3 – 2  Hammarby        │  ← Score, always visible
│        12:34                 │  ← Live timer
├──────────────────┬───────────┤
│   + GOAL         │  PENALTY  │  ← 50%+ screen height
│                  │           │
├──────────────────┼───────────┤
│   TIMEOUT        │  SUB      │
│                  │           │
├──────────────────┴───────────┤
│ [ ⟲ Undo — 5s countdown ]   │  ← Only when action taken
├──────────────────────────────┤
│ ● LIVE              [Share]  │  ← Status bar
└──────────────────────────────┘
```

### Pre-Match Flow (< 30 seconds target)
```
1. Enter Match Code
2. Confirm Teams (one screen, no back navigation needed)
3. Tap "Start Match" → Share link auto-copies
```

### Supporter View (Web, no login)
- Score + Timer + Live events only.
- Swish/payment button visible.
- Loads instantly. No auth wall.

### Admin Dashboard
- Table-first layout.
- Export button prominent.
- No charts in MVP. Clean data, clean export.

---

## 🌑 Dark Mode

- Apply via `prefers-color-scheme: dark` AND a manual toggle (set pre-match, not mid-match).
- Action button colors stay identical — never invert them.
- Background switches to `#1C1C1C`, text to `#F7F7F5`.
- Shadows disabled in dark mode (invisible and wasteful).

---

## 🟢 Status Indicators

| State     | Color    | Icon | Label    |
|-----------|----------|------|----------|
| Live      | `#2ECC71`| ●    | LIVE     |
| Syncing   | `#F39C12`| ◌    | SYNCING  |
| Offline   | `#E74C3C`| ○    | OFFLINE  |

- Always visible, always in the same location (bottom status bar).
- Never blocking content.

---

## 🚫 Anti-Patterns (Never Do These)

| ❌ Don't                               | ✅ Do instead                         |
|----------------------------------------|---------------------------------------|
| Confirmation dialogs ("Are you sure?") | Timed undo bar                        |
| Settings accessible mid-match          | Lock settings to pre-match flow       |
| Deep navigation or hamburger menus     | Single-screen match UI                |
| Thin fonts (< 400 weight)              | Regular (400) or Medium (500) minimum |
| Complex charts in MVP                  | Clean tables with export              |
| Gradients on action buttons            | Flat solid action colors              |
| Silicon Valley / startup aesthetics    | Understated Nordic utility feel       |
| Gambling/betting visual language       | Trust, green primary, clean whites    |
| Small tap targets (< 56px)             | 56–72px minimum, tablet-optimized     |
| Modals mid-flow                        | Inline confirmation / undo only       |

---

## 🏔️ Brand Voice

- **Swedish sports club utility**, not Silicon Valley startup.
- **"This should have always existed."** — not "Look how clever this is."
- Straightforward. Functional. Quietly confident.
- No exclamation marks in UI copy. No motivational language.
- Example copy: *"Match started"* not *"You're live! 🎉"*

---

## ✅ Design Checklist (Per Screen)

Before shipping any screen, verify:

- [ ] Readable in one glance
- [ ] Largest element = most important action
- [ ] No decisions required during active match
- [ ] Tap targets ≥ 56px
- [ ] Works in dark mode in a poorly lit sports hall
- [ ] Undo available instead of confirmation
- [ ] No modals blocking the action area
- [ ] Status (live/offline) always visible
- [ ] Font weight ≥ 400 everywhere
- [ ] Tested on tablet (iPad) layout first
