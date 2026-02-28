<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.83-blue?logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-55-000020?logo=expo" alt="Expo" />
  <img src="https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Platform-Android-3DDC84?logo=android" alt="Android" />
</p>

# StarFocus

**Reclaiming your focus, one sprint at a time.**

StarFocus is a productivity app for students that combines **Google Classroom integration**, **timed deep-work sprints**, **distraction detection**, and **social accountability** — all wrapped in a premium glassmorphism UI.

---

## Features

### Smart Priority Engine
- Syncs assignments from **Google Classroom** automatically
- Ranks tasks using a weighted priority algorithm based on deadlines, difficulty, and completion status
- Color-coded priority zones — **Critical** (red), **Soon** (amber), **On Track** (green)
- Real-time **Workload Gauge** showing overall academic pressure

### Focus Sprints
- Configurable deep-work timer (15 / 25 / 45 / 60 min)
- **Automatic distraction detection** — counts app switches and impulse opens via AppState
- **Escalating interventions** — breathing prompts → greyscale overlays → vibration deterrents
- **Focus Score** calculated per session with multipliers for streaks, priority tasks, and zero distractions

### Streaks & Badges
- Daily streak system with a 30-minute minimum threshold
- **Freeze tokens** earned every 7 days to protect your streak
- 8 achievement badges — Streak Master, Deep Diver, Sprint Royalty, Diamond Focus, and more

### Leaderboard & Study Groups
- **Global weekly leaderboard** with podium display
- **Private study groups** with shareable 6-character join codes
- Compete with classmates on weekly focus scores

### Progress Analytics
- Weekly focus score trend (line chart)
- Daily focus minutes (bar chart)
- 90-day activity heatmap (contribution graph)
- Summary stats — total sprints, focus hours, average session length

### Manual Task Tracking
- Add custom tasks for clubs, exam prep, personal goals, extracurriculars
- Deadline picker with relative time display
- Priority slider (1–10) with visual feedback
- Draggable completion slider on every task card

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.83 + Expo 55 |
| Auth | Google Sign-In → Supabase Auth (ID token flow) |
| Database | Supabase (PostgreSQL + RLS) |
| API | Google Classroom API (courses, coursework, submissions) |
| Navigation | React Navigation 7 (bottom tabs + stacks) |
| Charts | react-native-chart-kit |
| Icons | MaterialCommunityIcons (@expo/vector-icons) |
| Haptics | expo-haptics |
| Storage | AsyncStorage (local session/task cache) |

---

## Design System

Premium **glassmorphism** aesthetic — zero emojis, professional vector icons throughout.

- **Palette**: Dark Blue Premium (`#0F172A` base, `#3B82F6` accent)
- **Glass Cards**: 7% white overlay, 10% white borders, 24dp radius
- **Typography**: System sans-serif, light weights (300) for metrics, semibold (600) for headers
- **Navigation**: Floating translucent tab bar with active dot indicator
- **Shadows**: Deep floating shadows (offset 12px, blur 32px)

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── GlassCard.js     # Frosted glass panel
│   ├── TaskCard.js      # Priority-aware task card with completion slider
│   └── WorkloadGauge.js # Circular SVG gauge
├── lib/                 # Configuration & clients
│   ├── config.js        # API keys & endpoints
│   └── supabase.js      # Supabase client
├── native/              # Platform-specific modules
│   ├── Overlay.js       # Distraction intervention overlays
│   └── Vibration.js     # Haptic feedback patterns
├── navigation/
│   └── AppNavigator.js  # Bottom tabs + stack navigators
├── screens/             # App screens
│   ├── AuthScreen.js    # Google Sign-In
│   ├── DashboardScreen.js
│   ├── FocusSprintScreen.js
│   ├── AssignmentsScreen.js
│   ├── LeaderboardScreen.js
│   ├── ProgressScreen.js
│   ├── ProfileScreen.js
│   └── AddTaskScreen.js
├── services/            # Business logic
│   ├── priority.js      # Task ranking algorithm
│   ├── workload.js      # Workload score calculation
│   ├── focusScore.js    # Focus session scoring
│   ├── classroom.js     # Google Classroom API sync
│   ├── badges.js        # Achievement badge definitions
│   ├── streaks.js       # Streak tracker with freeze tokens
│   ├── sessionStorage.js# Session persistence
│   └── taskStorage.js   # Task persistence
└── theme/               # Design system tokens
    ├── colors.js
    ├── typography.js
    ├── spacing.js
    └── index.js
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Android device or emulator

### Installation

```bash
# Clone the repo
git clone https://github.com/Meeetc/StarFocus.git
cd StarFocus/StarFocus

# Install dependencies
npm install

# Start the development server
npx expo start --dev-client
```

### Building the APK

```bash
# Login to Expo
npx eas-cli login

# Build Android APK
npx eas-cli build --platform android --profile preview
```

---

## Configuration

### Google Cloud Console
1. Create an OAuth 2.0 client ID for Android with package `com.starfocus`
2. Add the SHA-1 fingerprint from your EAS keystore (`npx eas-cli credentials`)
3. Enable the **Google Classroom API**

### Supabase
- Auth provider: Google (with web client ID + secret)
- Database tables: `users`, `leaderboard_snapshots`, `study_groups`, `group_members`
- Row-Level Security enabled on all tables

---

## Team

Built by **Stardust Developers** for a 24-hour hackathon.

---

## License

This project is for educational and hackathon demonstration purposes.
