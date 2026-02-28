-- StarFocus Database Schema (Supabase / PostgreSQL)
-- Run this in the Supabase SQL Editor to set up all tables

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

---------------------------------------
-- USERS
---------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  leaderboard_opt_in BOOLEAN DEFAULT FALSE,
  streak_threshold_min INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only read/write their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::TEXT = auth_id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::TEXT = auth_id);

---------------------------------------
-- TASKS (Classroom + Manual)
---------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  classroom_id TEXT,
  course_id TEXT,
  course_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  work_type TEXT DEFAULT 'ASSIGNMENT',
  grade_weightage DECIMAL(3,2) DEFAULT 0.50,
  completion_percent INTEGER DEFAULT 0 CHECK (completion_percent BETWEEN 0 AND 100),
  submission_status TEXT DEFAULT 'NEW',
  source TEXT NOT NULL CHECK (source IN ('classroom', 'manual')),
  category TEXT,
  priority_score_manual INTEGER CHECK (priority_score_manual BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tasks" ON tasks FOR ALL USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::TEXT)
);

---------------------------------------
-- FOCUS SESSIONS
---------------------------------------
CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  linked_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  deep_work_minutes INTEGER DEFAULT 0,
  app_switches INTEGER DEFAULT 0,
  impulse_opens INTEGER DEFAULT 0,
  raw_score DECIMAL(8,2) DEFAULT 0,
  adjusted_score DECIMAL(8,2) DEFAULT 0,
  multipliers TEXT[], -- Array of multiplier names
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_focus_sessions_user ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_date ON focus_sessions(start_time);

ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON focus_sessions FOR ALL USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::TEXT)
);

---------------------------------------
-- DAILY SCORES
---------------------------------------
CREATE TABLE IF NOT EXISTS daily_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  avg_focus_score DECIMAL(8,2) DEFAULT 0,
  total_focus_minutes INTEGER DEFAULT 0,
  sessions_count INTEGER DEFAULT 0,
  streak_day INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_scores_user ON daily_scores(user_id, date);

ALTER TABLE daily_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own scores" ON daily_scores FOR ALL USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::TEXT)
);

---------------------------------------
-- STREAKS
---------------------------------------
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  freeze_tokens INTEGER DEFAULT 0,
  last_focus_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own streaks" ON streaks FOR ALL USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::TEXT)
);

---------------------------------------
-- BADGES
---------------------------------------
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own badges" ON badges FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::TEXT)
);

---------------------------------------
-- STUDY GROUPS
---------------------------------------
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  join_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
-- Groups are readable by members (enforced via group_members)
CREATE POLICY "Anyone can view groups" ON study_groups FOR SELECT USING (TRUE);
CREATE POLICY "Creators manage groups" ON study_groups FOR ALL USING (
  created_by IN (SELECT id FROM users WHERE auth_id = auth.uid()::TEXT)
);

---------------------------------------
-- GROUP MEMBERS
---------------------------------------
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view group members" ON group_members FOR SELECT USING (
  group_id IN (SELECT group_id FROM group_members WHERE user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()::TEXT
  ))
);

---------------------------------------
-- LEADERBOARD SNAPSHOTS (Weekly)
---------------------------------------
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  weekly_score DECIMAL(8,2) DEFAULT 0,
  streak_length INTEGER DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

CREATE INDEX idx_leaderboard_week ON leaderboard_snapshots(week_start, weekly_score DESC);

ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
-- Leaderboard is public read for opted-in users
CREATE POLICY "Public leaderboard read" ON leaderboard_snapshots FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE leaderboard_opt_in = TRUE)
);
CREATE POLICY "Users manage own leaderboard" ON leaderboard_snapshots FOR ALL USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::TEXT)
);
