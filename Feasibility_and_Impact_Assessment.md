# Feasibility & Impact Assessment

> **StarFocus — Reclaiming Student Focus in the Age of Digital Distraction**

---

## 1. Executive Summary

This document provides a comprehensive feasibility and impact analysis of the **StarFocus** platform across technical and market dimensions. It evaluates each component's buildability, projects quantitative and qualitative impact, analyzes competitive positioning, identifies key risks with mitigation strategies, and outlines a scalability roadmap from pilot to platform.

---

## 2. Technical Feasibility

### 2.1 Component-Level Assessment

| Component | Feasibility | Risk Level | Detailed Assessment |
|-----------|:----------:|:----------:|---------------------|
| **Google Classroom API Integration** | ✅ High | 🟢 Low | Well-documented REST API with comprehensive SDKs. OAuth 2.0 is an industry standard. Google provides quota of 1,000 requests/100 seconds/user, sufficient for our sync frequency. Incremental sync via `modifiedTime` parameter reduces API load. |
| **Quiz & Assessment Parsing** | ✅ High | 🟢 Low | Google Classroom API exposes `workType` field to differentiate assignments, quizzes, and short-answer questions. Duration and attempt limits parsed from description/settings. Pure computation for priority escalation. |
| **Priority Ranking Algorithm** | ✅ High | 🟢 Low | Pure computation with no external dependencies. The formula is mathematically straightforward. Normalization is standard min-max scaling. Can be computed entirely on-device for instant responsiveness. |
| **Manual Task Entry** | ✅ High | 🟢 Low | Standard CRUD operations. User inputs task name, deadline, and priority score (1–10). Priority score normalized to the same 0–1 scale as auto-calculated priorities. Contributes to Workload Score and Focus Score seamlessly. |
| **Android App Usage Monitoring** | ✅ High | 🟡 Medium | `UsageStatsManager` API available since Android 5.0+. Accessibility Service provides real-time foreground app detection. Risk: Google Play Store requires justification for Accessibility Service usage; must demonstrate clear user benefit and comply with updated policies. |
| **Greyscale Mode** | ✅ High | 🟡 Medium | Achievable via Accessibility Service using `Settings.Secure.ACCESSIBILITY_DISPLAY_DALTONIZER`. Full programmatic control on Android. |
| **Continuous Vibration Deterrent** | ✅ High | 🟡 Medium | `VibrationEffect.createWaveform()` supports continuous looping patterns. `SYSTEM_ALERT_WINDOW` permission required for overlay. Full native Android support. |
| **Global Leaderboard (Opt-in)** | ✅ High | 🟢 Low | Supabase real-time subscriptions are production-ready. Opt-in toggle with anonymized display (nickname/avatar) addresses privacy concerns. Simple aggregation queries over indexed columns. |
| **Study Groups** | ✅ High | 🟢 Low | Standard CRUD for group creation + join-by-code. Group leaderboards are filtered views of the same scoring system. No external dependencies. |
| **Progress Visualization (Strava-style)** | ✅ High | 🟢 Low | React Native charting libraries (react-native-chart-kit, Victory Native) are mature and Expo-compatible. Line trends, bar charts, and calendar heatmaps are standard components. Data already exists in `daily_scores` table. |
| **Streak System** | ✅ High | 🟢 Low | Simple date-based computation. Freeze token logic is a boolean flag with count tracking. No external dependencies. |
| **Badge System** | ✅ High | 🟢 Low | Standard CRUD operations with event-driven triggers. Badge criteria are well-defined boolean conditions computed on existing data (streaks, scores, timestamps). No external dependencies. |
| **Push Notifications** | ✅ High | 🟢 Low | Firebase Cloud Messaging handles up to 10K messages/day for free. Native Android integration. Notification scheduling is straightforward with FCM's built-in features. |

### 2.2 Technical Risk Matrix

```
          Low Impact ──────────────────────────── High Impact
    ┌─────────────────────────────────────────────────────────┐
    │                                                         │
 H  │                                                         │
 i  │                                                         │
 g  │                                                         │
 h  ├─────────────────────────────────────────────────────────┤
    │                              │                           │
 L  │  Greyscale edge cases        │  Play Store Policy        │
 i  │                              │                           │
 k  │                              │                           │
 e  ├─────────────────────────────────────────────────────────┤
 l  │                              │                           │
 i  │  API Quota Limits            │                           │
 h  │                              │                           │
 o  │                              │                           │
 o  │                              │                           │
 d  └─────────────────────────────────────────────────────────┘
```

### 2.3 Technology Readiness Assessment

| Technology | Maturity | Community Support | Documentation | Production Track Record |
|-----------|:--------:|:-----------------:|:------------:|:---------------------:|
| React Native + Expo | ★★★★★ | Massive | Excellent | Instagram, Discord, Shopify |
| Supabase | ★★★★☆ | Growing Fast | Good | Numerous production apps |
| Firebase Cloud Messaging | ★★★★★ | Massive | Excellent | Industry standard |
| PostHog | ★★★★☆ | Growing | Good | Used by major companies |

## 3. Impact Assessment

### 3.1 Quantitative Impact (Projected)

| Metric | Baseline (Without StarFocus) | Projected (With StarFocus) | Improvement | Measurement Method |
|--------|:----:|:----:|:---:|-----------|
| Daily time lost to decision fatigue | 30–45 min | 5–10 min | **~75% reduction** | In-app task selection time tracking |
| Average deep work session length | 12–18 min | 35–50 min | **~2.5× increase** | Focus Sprint duration analytics |
| Assignment completion rate (on time) | 60–70% | 85–92% | **+20–25%** | Google Classroom API cross-reference |
| Daily phone pickups during study hours | 40–60 | 15–25 | **~55% reduction** | App usage monitor data |
| Student-reported academic anxiety | High (baseline survey) | Reduced (p < 0.05) | **Statistically significant** | Pre/post survey (GAD-7 scale) |
| Weekly deep work hours per student | 5–8 hrs | 12–18 hrs | **~2× increase** | Aggregated Focus Session data |

### 3.2 Qualitative Impact

#### For Individual Students

| Impact Area | Description | Supporting Theory |
|-------------|-------------|-------------------|
| **Reduced Academic Anxiety** | Knowing exactly what to work on — across academics, clubs, and personal commitments — and seeing clear priority rankings reduces overwhelm. The heatmap dashboard converts ambiguity into clarity. | Cognitive Load Theory (Sweller, 1988) |
| **Improved Self-Efficacy** | Tracking focus streaks and viewing Strava-style progress charts creates a "visible effort" feedback loop that builds confidence and momentum. | Bandura's Self-Efficacy Theory; Amabile & Kramer's Progress Principle |
| **Healthier Relationship with Technology** | Soft friction + vibration deterrent (not hard blocking) teaches awareness. Students learn to recognize impulse vs. intent, developing long-term self-regulation skills. | Fogg Behavior Model; Nudge Theory |
| **Better Sleep Patterns** | Reduced deadline panic means less late-night cramming. Structured work during the day leads to earlier completion and healthier routines. | Sleep hygiene research by Walker (2017) |

#### For Campus Communities

| Impact Area | Description |
|-------------|-------------|
| **Community Building** | Study group leaderboards create a shared mission, fostering camaraderie over competition. Focus becomes a communal value rather than an individual struggle. |
| **Equity in Motivation** | "Comeback King" badges ensure that lower-performing students aren't demoralized — growth is rewarded alongside absolute performance. |
| **Positive Peer Pressure** | Social accountability creates gentle pressure to maintain focus sessions. Students who see peers being productive are more likely to start their own sessions. |

#### For Institutions

| Impact Area | Description |
|-------------|-------------|
| **Early Warning System** | Aggregate analytics help universities identify at-risk students (declining Focus Scores, missed deadlines) before they fail. |
| **High-Stress Period Detection** | Institutional dashboards surface periods where campus-wide focus drops, indicating assignment clustering or exam stress. |
| **Data-Driven Policy** | Evidence for supporting decision-making: "Should we stagger mid-term deadlines?" backed by focus data. |

### 3.3 Impact Measurement Framework

| KPI | Target | Collection Method | Reporting Frequency |
|-----|--------|------------------|-------------------|
| DAU / MAU ratio | ≥ 40% | Analytics (PostHog) | Weekly |
| Week 4 retention | ≥ 50% | Cohort analysis | Monthly |
| Average daily Focus Score | ≥ 60 (campus-wide) | Score aggregation | Real-time |
| Focus Sprints per user per week | ≥ 5 | Session tracking | Weekly |
| Average streak length | ≥ 5 consecutive days | Streak tracking | Weekly |
| Study group participation rate | ≥ 30% of users | Group membership data | Monthly |
| NPS (Net Promoter Score) | ≥ 40 | In-app survey (quarterly) | Quarterly |
| Academic outcome correlation | Positive (r > 0.3) | GPA data (opt-in) vs Focus Score | Semester |

---

## 4. Competitive Differentiation

### 4.1 Feature Comparison Matrix

| Feature | Google Calendar | Notion | Forest | Cold Turkey | Todoist | **StarFocus** |
|---------|:-:|:-:|:-:|:-:|:-:|:-:|
| Automatic task sync (LMS) | ✗ | ✗ | ✗ | ✗ | ✗ | ✅ |
| Intelligent priority ranking | ✗ | ✗ | ✗ | ✗ | ✗ | ✅ |
| Quiz/assessment parsing | ✗ | ✗ | ✗ | ✗ | ✗ | ✅ |
| Context-aware distraction management | ✗ | ✗ | ◐ | ◐ | ✗ | ✅ |
| Vibration deterrent | ✗ | ✗ | ✗ | ✗ | ✗ | ✅ |
| Focus Score metric | ✗ | ✗ | ◐ | ✗ | ✗ | ✅ |
| Global leaderboard (opt-in) | ✗ | ✗ | ◐ | ✗ | ✗ | ✅ |
| Study groups | ✗ | ✗ | ✗ | ✗ | ✗ | ✅ |
| Strava-style progress visualization | ✗ | ✗ | ✗ | ✗ | ✗ | ✅ |
| Streak system with freeze tokens | ✗ | ✗ | ◐ | ✗ | ✗ | ✅ |
| Badge & recognition system | ✗ | ✗ | ◐ | ✗ | ✗ | ✅ |

### 4.2 Strategic Moat

| Advantage | Description | Defensibility |
|-----------|-------------|:------------:|
| **Four-Pillar Integration** | Only platform combining task intelligence + distraction management + social accountability + progress visualization | High — requires full-stack investment to replicate |
| **Academic Context** | Purpose-built for students with LMS integration — not a generic productivity tool | Medium — competitors could add academic features |
| **Network Effects** | Global leaderboards and study groups become more valuable with more participants; switching costs increase with group adoption | High — classic network effect moat |
| **Data Advantage** | Accumulated focus data enables personalized recommendations over time | Medium — grows stronger with usage |

---

## 5. Risks & Mitigation

### 5.1 Comprehensive Risk Register

| # | Risk | Category | Severity | Likelihood | Impact | Mitigation Strategy |
|---|------|:--------:|:--------:|:----------:|:------:|---------------------|
| R1 | Students bypass friction by uninstalling app | Adoption | 🟡 Med | 🟡 Med | 🟡 Med | Gamify retention — make leaderboard and streak participation rewarding enough to keep the app installed. Social pressure from study group members. |
| R2 | Privacy concerns with usage monitoring | Trust | 🔴 High | 🟡 Med | 🔴 High | Transparent data policy; all tracking is on-device; only aggregated Focus Scores shared. Global leaderboard is opt-in with anonymized display. |
| R3 | Google Classroom API quota limits | Technical | 🟢 Low | 🟢 Low | 🟢 Low | Implement local caching + incremental sync (delta updates). Batch API calls. Stay well within quota limits at projected scale. |
| R4 | Continuous vibration causing user annoyance | UX | 🟡 Med | 🟡 Med | 🟡 Med | Make vibration intensity configurable. Provide clear override mechanism (hold button for X seconds). Allow users to disable vibration tier while keeping other friction layers. |
| R5 | Low initial adoption / cold start problem | Adoption | 🔴 High | 🟡 Med | 🔴 High | Launch as a campus-level pilot. Partner with student councils. In-person onboarding sessions. Pre-seed study groups. |
| R6 | Leaderboard causing unhealthy competition | Wellbeing | 🟡 Med | 🟢 Low | 🟡 Med | Weekly resets prevent permanent hierarchy. "Comeback King" badge rewards improvement. Global leaderboard is opt-in. Study groups provide controlled competition. |
| R7 | App draining battery due to monitoring + vibration | Technical | 🟡 Med | 🟡 Med | 🟡 Med | Optimize monitoring frequency. Use Android's `UsageStatsManager` (polling) rather than continuous foreground service. Vibration only triggers on app launch, not continuously in background. |
| R8 | Study groups becoming inactive | Engagement | 🟡 Med | 🟡 Med | 🟢 Low | Streak visibility within groups creates social pressure. Weekly progress notifications. Suggest group challenges to re-engage dormant groups. |
| R9 | Google Play policy changes re: Accessibility Service | Platform | 🟡 Med | 🟢 Low | 🔴 High | Monitor Google Play policy updates. Maintain compliance documentation. Design modular architecture so monitoring can be decoupled. |

### 5.2 Risk Heat Map

```
        Low Impact ──────────────────────── High Impact
  ┌──────────────────────────────────────────────────────┐
  │                                                      │
H │                                   R5 (Cold start)    │
i │                                                      │
g │                                   R2 (Privacy)       │
h │                                                      │
  ├──────────────────────────────────────────────────────┤
M │   R4 (Vibration UX)              R1 (Uninstall)      │
e │   R7 (Battery)                   R9 (Play policy)   │
d │   R8 (Group inactivity)                              │
  ├──────────────────────────────────────────────────────┤
L │   R3 (API quota)                R6 (Competition)     │
o │                                                      │
w │                                                      │
  └──────────────────────────────────────────────────────┘
```

---

## 6. Scalability Roadmap

### 6.1 Three-Horizon Growth Plan

```
Semester 1 (Pilot)         Semester 2 (Growth)        Year 2 (Platform)
──────────────────         ────────────────────        ──────────────────
Scope: 1 campus            Scope: 5 campuses          Scope: 50+ campuses
Users: 500                 Users: 5,000               Users: 50,000+

Features:                  Features:                  Features:
• Core 3 phases            • Inter-college             • LMS integrations
• Global leaderboard         leaderboards                (Canvas, Moodle,
  (opt-in)                 • Professor dashboard         Blackboard)
• Study groups             • Focus challenges          • ML-based optimal
• Strava-style viz         • Social sharing of           study time predictor
• Streak system              streaks & achievements    • Institutional
• Vibration deterrent      • Advanced study group        analytics API
                             features (challenges)     • White-label option
Infrastructure:                                         for universities
• Supabase Pro ($25/mo)    Infrastructure:
• Free hosting tier        • Supabase Team ($599/mo)   Infrastructure:
                           • Vercel Pro ($20/mo)       • Custom PostgreSQL
                                                         cluster
                                                       • Multi-region deploy
```

### 6.2 Feature Expansion Roadmap

| Feature | Priority | Phase | Effort | Impact |
|---------|:--------:|:-----:|:------:|:------:|
| Canvas / Moodle LMS integration | High | Year 2 | Large | Unlocks non-Google-Classroom campuses |
| ML study time optimizer | Medium | Year 2 | Large | Predicts optimal study windows per student |
| Professor dashboard | High | Sem 2 | Medium | Institutional sell; engagement insights |
| Inter-college leaderboards | High | Sem 2 | Medium | Broader competitive pressure |
| Focus challenges (1v1, group vs group) | Medium | Sem 2 | Medium | Engagement and retention driver |
| Dark mode | High | Sem 1 v1.1 | Small | User experience; requested by beta users |
| Widget (home screen) | High | Sem 1 v1.1 | Small | Increased visibility; quick sprint access |
| Offline mode | Medium | Sem 2 | Medium | Support for areas with poor connectivity |
| Accessibility (Screen reader, etc.) | High | Sem 1 v1.1 | Small | Inclusivity requirement |
| Social sharing of achievements | Medium | Sem 2 | Small | Viral growth; streak/badge sharing |

### 6.3 Monetization Path (Future)

| Model | Target | Pricing | Notes |
|-------|--------|---------|-------|
| **Freemium** | Individual students | Free (core) / $3–5/mo (premium) | Premium: advanced stats, custom badges, unlimited freeze tokens, extended analytics |
| **Institutional License** | Universities | $2–5/student/year | Includes professor dashboard, aggregate analytics, SSO |
| **API Access** | EdTech companies | $500–2000/mo | Focus Score API for integration into other platforms |

---

## 7. Success Criteria & Validation Plan

### 7.1 MVP Success Metrics

| Metric | Target | Timeframe | Status Indicator |
|--------|--------|-----------|:----------------:|
| Beta signups (pre-launch) | 200+ | Weeks 14–15 | Social media + campus outreach |
| Active users (Week 1 post-launch) | 100+ | Week 16 | Analytics dashboard |
| Week-4 retention rate | ≥ 50% | Week 20 | Cohort analysis |
| Focus Sprints per user per week | ≥ 3 | Ongoing | Session tracking |
| Positive NPS | ≥ 30 | Week 20 | In-app survey |
| Reported reduction in anxiety | Statistically significant | End of semester | Pre/post survey (GAD-7) |

### 7.2 Validation Methodology

1. **A/B Testing Framework:** Track academic outcomes of StarFocus users vs. non-users within the same cohort (opt-in, with consent). Compare on-time submission rates and self-reported productivity.

2. **Focus Group Interviews:** Conduct bi-weekly sessions with 8–10 beta users to gather qualitative feedback on user experience, feature requests, and pain points.

3. **Analytics-Driven Iteration:** Use PostHog/Mixpanel funnel analysis to identify drop-off points in the user journey. Prioritize fixes for steps where > 20% of users abandon the flow.

---

## 8. Conclusion

### Feasibility Verdict

| Dimension | Assessment | Confidence |
|-----------|-----------|:----------:|
| **Technical Feasibility** | All core features are buildable with existing, production-ready Android technologies. No LLM dependency needed — priority ranking uses completion % and quiz prep multipliers. Native Android APIs provide full control over usage monitoring, vibration, and overlays. | ⭐⭐⭐⭐⭐ (5/5) |
| **Market Feasibility** | Clear gap in the market. No competitor addresses all four productivity pillars (task intelligence, distraction management, social accountability, progress visualization). Strong potential for network effects via global leaderboards and study groups. | ⭐⭐⭐⭐⭐ (5/5) |

### Impact Verdict

> **StarFocus has the potential to recover 2+ hours of daily productivity for every active student, translating to approximately 200+ hours of reclaimed academic time per semester per student.**

The combination of intelligent task ranking (with completion % tracking and workload-adaptive interventions), behavioral nudge theory (breathing → greyscale → vibration timed by workload score), Strava-style progress visualization, and social motivation mechanics (global leaderboard, study groups, streaks) creates a platform that is technically feasible, psychologically grounded, and practically deployable.

---

## References

1. Steel, P. (2007). *The Nature of Procrastination: A Meta-Analytic and Theoretical Review.* Psychological Bulletin, 133(1), 65–94.
2. Asurion (2019). *Americans Check Their Phones 96 Times a Day.* PR Newswire.
3. Mark, G., Gonzalez, V. M., & Harris, J. (2005). *No Task Left Behind? Examining the Nature of Fragmented Work.* CHI 2005, ACM.
4. Newport, C. (2016). *Deep Work: Rules for Focused Success in a Distracted World.* Grand Central Publishing.
5. Fogg, B.J. (2009). *A Behavior Model for Persuasive Design.* Persuasive Technology, Stanford University.
6. Deci, E.L. & Ryan, R.M. (2000). *Self-Determination Theory.* American Psychologist, 55(1), 68–78.
7. Thaler, R. H., & Sunstein, C. R. (2008). *Nudge: Improving Decisions About Health, Wealth, and Happiness.* Yale University Press.
8. Walker, M. (2017). *Why We Sleep: Unlocking the Power of Sleep and Dreams.* Scribner.
9. Amabile, T. M., & Kramer, S. J. (2011). *The Progress Principle.* Harvard Business Review Press.
10. Robbins, S. B., et al. (2004). *Do Psychosocial and Study Skill Factors Predict College Outcomes?* Psychological Bulletin, 130(2), 261–288.

---

> **Document prepared for:** Project Submission — StarFocus  
> **Date:** February 27, 2026  
> **Authors:** Team StarFocus
