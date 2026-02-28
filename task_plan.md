# StarFocus — B.L.A.S.T. Task Plan

> **Project:** StarFocus — Reclaiming Student Focus in the Age of Digital Distraction  
> **Protocol:** B.L.A.S.T. (Blueprint, Link, Architect, Stylize, Trigger)  
> **Date:** February 28, 2026

---

## Protocol 0: Initialization

- [x] Explore existing project documentation
- [x] Create `task_plan.md`
- [x] Create `findings.md`
- [x] Create `progress.md`
- [x] Create `gemini.md` (Project Constitution)
- [ ] Ask Discovery Questions (5 questions)
- [ ] Confirm Data Schema in `gemini.md`
- [ ] Get Blueprint approved

---

## Phase 1: B — Blueprint (Vision & Logic)

- [ ] Finalize North Star outcome
- [ ] Confirm integrations & API keys
- [ ] Define Source of Truth
- [ ] Define Delivery Payload
- [ ] Document Behavioral Rules
- [ ] Confirm JSON Data Schema (Input/Output shapes)
- [ ] Research: GitHub repos, libraries, reference implementations

---

## Phase 2: L — Link (Connectivity)

- [ ] Verify Supabase credentials / setup
- [ ] Verify Google Classroom API OAuth setup
- [ ] Verify Firebase Cloud Messaging setup
- [ ] Build minimal handshake scripts in `tools/`
- [ ] Confirm all Links are healthy

---

## Phase 3: A — Architect (3-Layer Build)

### Layer 1: Architecture (SOPs)
- [ ] Write SOP: Task Sync & Priority Engine
- [ ] Write SOP: Distraction Intervention System
- [ ] Write SOP: Focus Score Calculator
- [ ] Write SOP: Leaderboard & Social Layer
- [ ] Write SOP: Streak & Badge System

### Layer 2: Navigation (Decision Making)
- [ ] Define routing logic between SOPs and Tools

### Layer 3: Tools (Deterministic Scripts)
- [ ] Build: Google Classroom sync tool
- [ ] Build: Priority formula calculator
- [ ] Build: Workload score aggregator
- [ ] Build: Focus score calculator
- [ ] Build: Leaderboard ranking engine
- [ ] Build: Streak tracker
- [ ] Build: Badge evaluator

### React Native App
- [ ] Initialize Expo project
- [ ] Auth flow (Google OAuth via Supabase)
- [ ] Heatmap Dashboard screen
- [ ] Focus Sprint screen
- [ ] Leaderboard screen
- [ ] Study Groups screen
- [ ] Progress Visualization screen
- [ ] Profile & Badges screen
- [ ] Usage Monitoring native module
- [ ] Vibration deterrent native module
- [ ] Overlay native module

---

## Phase 4: S — Stylize (Refinement & UI)

- [ ] Polish UI/UX across all screens
- [ ] Format leaderboard / notification payloads
- [ ] User feedback round
- [ ] Iterate on design

---

## Phase 5: T — Trigger (Deployment)

- [ ] Build APK for hackathon distribution
- [ ] Set up push notification triggers
- [ ] Finalize Maintenance Log in `gemini.md`
- [ ] Documentation complete
