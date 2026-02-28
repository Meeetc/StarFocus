# StarFocus — Findings & Research Log

> All discoveries, constraints, and research notes during the build.

---

## Initial Findings (Protocol 0 — Feb 28, 2026)

### Existing Documentation
- **Problem Statement Finalization** — Fully defined. 4 threats: decision fatigue, task paralysis, attention fragmentation, lack of motivation. 2–4 hrs/day lost.
- **Proposed Solution Architecture** — Complete 3-phase architecture (Brain → Shield → Hook). API endpoints defined. DB schema outlined.
- **Feasibility & Impact Assessment** — Risk matrix, competitive analysis, KPIs, rollout plan documented.
- **Submission Package** — LaTeX/DOCX/MD versions of hackathon submission exist.

### Key Constraints
1. **Android-only** — UsageStatsManager, Accessibility Service, VibrationEffect, SYSTEM_ALERT_WINDOW.
2. **Expo bare workflow** — Native modules for usage monitoring, vibration, overlay.
3. **Zero-cost stack** — All free tiers.
4. **No LLM dependency** — Deterministic priority formula.

---

## Discovery Answers (Phase 1 — Feb 28, 2026)

| Question | Answer |
|----------|--------|
| **North Star** | Fully functional prototype demonstrating real impact |
| **Integrations** | Supabase (auth/leaderboard/groups/scores), Google Classroom API, Firebase (notifications) |
| **Source of Truth** | Supabase: assignments, deadlines, scores, leaderboards, groups, badges. On-device: usage monitoring, distraction signals. Upload only: focus scores, session summaries. |
| **Delivery** | APK file for direct sharing |
| **Behavioral Rules** | Originality, friction-not-force, privacy-first, visually engaging (community voting) |

---

## Research Findings (Phase 1 — Feb 28, 2026)

### Native Modules

| Module | Library/Approach | Notes |
|--------|-----------------|-------|
| **UsageStats** | `expo-android-usagestats` or `@brighthustle/react-native-usage-stats-manager` | Requires `PACKAGE_USAGE_STATS` permission. User must grant via system settings. |
| **Accessibility Service** | Custom native module (Kotlin) | Extends `AccessibilityService`. Needs `AndroidManifest.xml` declaration. Bridge via `NativeEventEmitter`. Requires dev build (not Expo Go). |
| **Vibration** | Custom native module wrapping `VibrationEffect.createWaveform()` | Supports amplitude control (0–255). `repeat` param for continuous loop. `Vibrator.hasAmplitudeControl()` to check support. |
| **Overlay** | `SYSTEM_ALERT_WINDOW` permission | Needed for full-screen overlay. Add in `AndroidManifest.xml`. Must be explicit for release builds. |

### Auth & API Flow
- Google Sign-In → Supabase Auth (Google provider) → Access token with Classroom scopes
- Classroom API: REST calls with `Authorization: Bearer` header
- No official Google NPM package for RN; use `fetch`/`axios` directly
- Scopes: `classroom.courses.readonly`, `classroom.coursework.me.readonly`, `classroom.student-submissions.me.readonly`

### Charting
- `react-native-chart-kit`: Contribution Graph (heatmap), Line/Bezier charts, Progress Ring
- For Strava-style: combine Contribution Graph + Line Charts + custom styling

### Key Decisions
- Must use Expo dev build (not Expo Go) due to native modules
- EAS Build for APK generation
- `@react-native-google-signin/google-signin` for Google auth
