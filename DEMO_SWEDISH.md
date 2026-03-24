# Spelklar Demo Guide (Svenska)

## Snabbstart

Gå till: **https://spelklar.vercel.app**

## Inloggning

1. Klicka på **Login** eller gå till `/login`
2. Ange telefonnummer: `+46701234567`
3. Ange OTP-kod: `000000` (eller vilken 6-siffrig kod som helst)
4. Du är nu inloggad som **Anna P. (parent)**

## Vad fungerar

### Feed (`/feed`)
- ✅ Du ser "No live matches" eftersom det inte finns seed-data
- ✅ Du kan navigera mellan Feed, Teams, och Profile via knappbalkfältet

### Teams (`/teams`)
- ✅ Visar alla lag när seed-data kommer på plats
- ✅ Du kan följa/avfölja lag (Follow-knappen)
- ✅ Visar antalet följare per lag

### Profile (`/profile`)
- ✅ Visar ditt namn (+46701234567)
- ✅ Visar din roll (Visitor/Staff)
- ✅ Visar antal lag du följer
- ✅ Log Out-knapp för att logga ut

## Seedning - Manuell workaround

Seedningen via build-script fungerar inte för tillfället. Gör istället detta:

**Option 1: Via API-anrop**
```bash
curl -X POST https://spelklar.onrender.com/api/seed
```

**Option 2: Via webbläsaren**
Gå till: `https://spelklar.onrender.com/api/seed` (öppna som POST i DevTools)

## Demo-data som läggs in

Efter seedning:
- **3 användare**: Anna P., Erik S., Göran B.
- **3 klubbar**: AIK Fotboll, Hammarby Sjöstad, Solna IK
- **4 lag**: AIK U12 Blå, AIK U12 Gul, Hammarby U12, Solna IK U12
- **2 matcher**: DEMO01 (pre-game), LIVE01 (live med 2-1)
- **2 följningar**: Anna och Göran följer AIK U12 Blå

## Testa applikationen

1. **Logga in** med +46701234567 / 000000
2. Gå till **Teams** tab
3. Följ ett lag (t.ex. "AIK U12 Blå")
4. Gå till **Feed** - om lag är live, ser du matchen
5. Gå till **Profile** - se din statistik
6. Klicka **Log Out** för att logga ut

## Test-lösenord för andra användare

- **Parent/Visitor**: +46701234567 (Anna P.)
- **Grandparent**: +46703456789 (Göran B.)
- **Staff**: +46702345678 (Erik S.)

Använd vilken 6-siffrig OTP-kod som helst vid inloggning (demo-mode).
