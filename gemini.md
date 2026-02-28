# StarFocus — Project Constitution (`gemini.md`)

> **This file is LAW.** All schemas, behavioral rules, and architectural invariants live here.  
> Only update when: a schema changes, a rule is added, or architecture is modified.

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Name** | StarFocus |
| **Tagline** | Reclaiming Student Focus in the Age of Digital Distraction |
| **Platform** | Android (React Native + Expo bare workflow) |
| **Theme** | Attention Economy on Campus |
| **Cost** | $0 — all free-tier services |

---

## 2. Architectural Invariants

1. **Three-Phase System:** Brain (awareness) → Shield (protection) → Hook (motivation). All three must operate together.
2. **No LLM in business logic.** Priority ranking is a deterministic formula. No AI inference in the critical path.
3. **Privacy-first.** Raw usage data never leaves the device. Only aggregated Focus Scores are synced.
4. **Friction, not blocking.** Interventions add cost to distraction, not hard walls.
5. **Zero manual setup to start.** Google Classroom auto-sync provides instant value.
6. **Android-only native modules** for: usage monitoring, vibration waveforms, and overlay.

---

## 3. Data Schema

> ⚠️ **PENDING USER CONFIRMATION** — Schema shapes below are derived from architecture docs. Must be confirmed before coding begins.

### 3.1 Input Schemas

#### Google Classroom Task (Ingested)
```json
{
  "id": "string",
  "courseId": "string",
  "courseName": "string",
  "title": "string",
  "description": "string",
  "dueDate": "ISO 8601 datetime",
  "workType": "ASSIGNMENT | SHORT_ANSWER_QUESTION | MULTIPLE_CHOICE",
  "gradeWeightage": "number (0.0–1.0, user-input)",
  "completionPercent": "number (0–100, self-reported)",
  "submissionStatus": "NEW | TURNED_IN | RETURNED",
  "source": "classroom"
}
```

#### Manual Task (User-Created)
```json
{
  "id": "string (UUID)",
  "title": "string",
  "deadline": "ISO 8601 datetime",
  "priorityScore": "number (1–10, user-set)",
  "category": "club | extracurricular | personal | exam_prep | other",
  "completionPercent": "number (0–100)",
  "source": "manual"
}
```

### 3.2 Output / Computed Schemas

#### Prioritized Task (Computed)
```json
{
  "taskId": "string",
  "title": "string",
  "courseName": "string | null",
  "priorityScore": "number (0.0–1.0, normalized)",
  "priorityZone": "red | amber | green",
  "timeRemaining": "number (hours)",
  "completionPercent": "number (0–100)",
  "quizPrepMultiplier": "number (1.0 | 1.5 | 1.8)",
  "source": "classroom | manual"
}
```

#### Workload Score
```json
{
  "userId": "string",
  "score": "number (0–100)",
  "level": "low | moderate | high",
  "timestamp": "ISO 8601 datetime"
}
```

#### Focus Session
```json
{
  "id": "string (UUID)",
  "userId": "string",
  "linkedTaskId": "string | null",
  "startTime": "ISO 8601 datetime",
  "endTime": "ISO 8601 datetime",
  "deepWorkMinutes": "number",
  "appSwitches": "number",
  "impulseOpens": "number",
  "rawScore": "number",
  "multipliers": ["red_priority", "quiz_task", "deep_work", "zero_opens"],
  "adjustedScore": "number"
}
```

#### Daily Score
```json
{
  "userId": "string",
  "date": "YYYY-MM-DD",
  "averageFocusScore": "number",
  "totalFocusMinutes": "number",
  "sessionsCount": "number",
  "streakDay": "number"
}
```

#### Leaderboard Entry
```json
{
  "userId": "string",
  "displayName": "string (nickname or anonymized)",
  "weeklyFocusScore": "number",
  "streakLength": "number",
  "rank": "number",
  "badges": ["string"]
}
```

---

## 4. Behavioral Rules

> ⚠️ **PENDING USER CONFIRMATION**

1. **Priority Formula:**  
   `Priority = (Grade Weightage × (1 − Completion%)) / max(Time Remaining, 1) × Quiz Prep Multiplier`
2. **Workload Score** drives intervention aggressiveness (Low < 30, Moderate 30–59, High ≥ 60).
3. **Intervention Stack:** Always escalates: Breathing → Greyscale → Vibration. Never skips levels.
4. **Leaderboard is opt-in** (default OFF). Anonymized display available.
5. **Streaks** require configurable daily minimum (default 30 min focus). Freeze tokens earned at 7-day milestones.
6. **Weekly leaderboard resets** every Monday.
7. **Focus Score Formula:**  
   `Focus Score = Deep Work Minutes / (App Switches + Impulse Opens + 1) × Multipliers`

---

## 5. Technology Stack

| Layer | Technology | Free Tier Limit |
|-------|-----------|----------------|
| Mobile | React Native + Expo (bare) | — |
| Backend/DB/Auth | Supabase | 500 MB DB, 50K MAU |
| Push Notifications | Firebase Cloud Messaging | 10K msgs/day |
| Analytics | PostHog | 1M events/month |
| Charts | react-native-chart-kit | — |
| Distribution | Direct APK / Play Store ($25) | — |

---

## 6. Maintenance Log

> Updated as the project evolves. Each entry records schema changes, rule changes, or architecture modifications.

| Date | Change | Reason |
|------|--------|--------|
| Feb 28, 2026 | Initial constitution created | Protocol 0 initialization |
