-- Migration: Add enhanced task fields (priority, tags, due_date, recurring, reminders)
-- Date: 2026-02-07
-- Spec: 002-enhanced-task-features-event-driven
--
-- This migration adds the new columns to existing tasks tables.
-- Safe to run on existing databases - uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.

-- Add priority column with default
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR DEFAULT 'medium';

-- Add tags column as text array with GIN index
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

-- Add due_date column as timestamptz
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;

-- Add recurring column
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurring VARCHAR;

-- Add reminders column as timestamptz array
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminders TIMESTAMPTZ[] NOT NULL DEFAULT '{}';

-- Add updated_at column if it doesn't exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes
CREATE INDEX IF NOT EXISTS ix_tasks_priority ON tasks (priority);
CREATE INDEX IF NOT EXISTS ix_tasks_due_date ON tasks (due_date);
CREATE INDEX IF NOT EXISTS ix_tasks_tags ON tasks USING GIN (tags);

-- Backfill existing rows
UPDATE tasks SET priority = 'medium' WHERE priority IS NULL;
UPDATE tasks SET tags = '{}' WHERE tags IS NULL;
UPDATE tasks SET reminders = '{}' WHERE reminders IS NULL;
UPDATE tasks SET updated_at = created_at WHERE updated_at IS NULL;
