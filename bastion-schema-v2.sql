-- ============================================
-- BASTION MANAGER - V2 Migration
-- Run this AFTER the original schema
-- ============================================

-- Campaign day tracking on parties
ALTER TABLE parties ADD COLUMN IF NOT EXISTS current_day integer DEFAULT 1;

-- Order progress tracking on facilities
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS order_status text;          -- null = idle, or order name
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS order_progress integer DEFAULT 0; -- days completed
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS order_duration integer DEFAULT 0; -- total days needed
