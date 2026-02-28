---
title: "StarFocus"
subtitle: "Reclaiming Student Focus in the Age of Digital Distraction"
author: "Team StarFocus"
date: "February 28, 2026"
---

# Problem Statement

> *"University students lose an estimated 2–4 productive hours daily to decision fatigue, task paralysis, and dopamine-driven attention drift. There exists no unified platform that (a) intelligently ranks academic tasks by urgency and impact, (b) applies behavioral nudges at the point of distraction, and (c) harnesses social accountability to sustain deep work — all within the student's existing academic ecosystem."*

## Problem Description

1. **Decision Fatigue:** Students spend 30–45 minutes daily just figuring out *what* to study. With 5–7 courses, each with overlapping deadlines and varying grade weightages, the cognitive cost of choosing is itself a productivity killer.

2. **Task Paralysis:** Even after choosing a task, students feel overwhelmed by its perceived size. Without clear guidance on where to begin, procrastination becomes the default response.

3. **Attention Fragmentation:** The average student picks up their phone 80+ times per day. Each context switch costs 23 minutes of refocus time (Mark et al., 2005), turning a 4-hour study block into barely 90 minutes of actual deep work.

4. **Lack of Motivation:** Studying is an invisible activity — there's no social validation, no visible progress, and no accountability. Unlike fitness (Strava) or social media (likes), focus effort goes entirely unrecognized.

5. **Tool Fragmentation:** Students juggle Google Calendar, Notion, Forest, and Todoist — none of which talk to each other or to the university's LMS. The result is more overhead, not less.

---

# Theme: Attention Economy on Campus

**Selected Theme:** *Theme A — Attention Economy on Campus*

> *"College isn't short on time. It's short on attention."*

## Justification of Theme Relevance

1. **Attention is the core bottleneck, not time:** Students have 6–8 hours of free time daily, yet productive output averages only 1.5–2 hours. StarFocus directly targets this attention gap by reducing decision fatigue (intelligent ranking) and protecting focus time (workload-adaptive interventions).

2. **Notifications, reels, and social pressure are the enemy:** The theme identifies exactly what StarFocus combats — dopamine-driven digital distraction. Our three-layer intervention system (breathing exercise → greyscale → vibration) applies friction precisely at the moment of distraction, not through blanket blocking.

3. **Helping students "take control of their time":** StarFocus's priority ranking engine with Google Classroom integration eliminates the "what should I work on?" problem entirely, giving students an auto-prioritized, intelligent dashboard — no manual setup needed.

4. **Reducing mental clutter:** By aggregating all obligations (academic via Google Classroom + clubs/extracurriculars via manual entry) into a single workload score (0–100), StarFocus replaces scattered to-do lists with one clear number that tells students exactly how much pressure they're under.

5. **Making better decisions about where focus goes:** The social motivation layer (leaderboards, study groups, Strava-style progress charts) makes focus *visible and rewarding* — transforming an invisible activity into a recognized, competitive, and habit-forming experience.

---

# Technical Approach

StarFocus is a **three-phase Android application** built around three psychological primitives:

| Phase | Name | Purpose |
|-------|------|---------|
| Phase 1 | **The Brain** | Intelligent task ranking via Google Classroom API sync + manual entry. Priority formula: Grade Weightage × (1 − Completion%) / Time Remaining × Quiz Prep Multiplier |
| Phase 2 | **The Shield** | Workload-adaptive distraction intervention: breathing exercise → greyscale mode → continuous vibration. Timers scale with workload score (Low / Moderate / High). |
| Phase 3 | **The Hook** | Social motivation: opt-in global leaderboard, study groups, Strava-style progress charts, streaks with freeze tokens, and badge system. |

## Technology Stack (Zero Cost)

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Mobile App | React Native + Expo | Hackathon-fast dev; hot reload; Expo Go for instant testing |
| Backend + DB + Auth | Supabase | All-in-one: PostgreSQL, real-time, OAuth 2.0; free tier |
| Usage Monitoring | Android Accessibility API | OS-level foreground app detection |
| Notifications | Firebase Cloud Messaging | Free tier; native Android support |
| Charting | react-native-chart-kit | Strava-style progress visualizations |
| Analytics | PostHog | Free tier (1M events/month) |

**Total Cost: $0** — all technologies operate within free tiers.

---

# Architecture / Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 1 — THE BRAIN (Awareness & Ranking Engine)                  │
│                                                                     │
│  Google Classroom API ──→ Quiz & Task Parser ──→ Priority Ranking   │
│  Manual Task Entry ──→ Workload Score (0–100) ──→ Heatmap Dashboard │
│                                                                     │
│  Priority = (Grade Weightage × (1 − Completion%)) / Time Remaining  │
│             × Quiz Prep Multiplier                                  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 2 — THE SHIELD (Focus Execution System)                     │
│                                                                     │
│  App Usage Monitor ──→ Workload-Adaptive Intervention               │
│                                                                     │
│  Low Workload (<30):      1h breathing → 2h greyscale → 3h vibe    │
│  Moderate (30–59):        45min breathing → 1.5h grey → 2.25h vibe │
│  High Workload (≥60):     30min breathing → 1h grey → 1.5h vibe   │
│                                                                     │
│  Focus Sprint Mode ──→ Focus Score Calculator                       │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 3 — THE HOOK (Social Motivation Layer)                      │
│                                                                     │
│  Global Leaderboard (opt-in) + Study Groups                         │
│  Strava-style Progress Visualization (line, bar, heatmap)           │
│  Streaks & Freeze Tokens ──→ Badge & Recognition System             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  BACKEND: Supabase (PostgreSQL + Real-time + Auth)                 │
│           Firebase Cloud Messaging  |  PostHog Analytics            │
└─────────────────────────────────────────────────────────────────────┘
```

*All data flows through Supabase for real-time sync. Usage monitoring and vibration run on-device via Android native modules. Focus Scores feed into leaderboards and progress visualization in real-time.*
