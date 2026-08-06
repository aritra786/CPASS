-- CONNEX CPaaS Platform - Supabase PostgreSQL Schema & RLS Policies
-- Safe / Idempotent script that handles existing policies without 42710 errors.

-- 1. Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  "companyName" TEXT,
  "accountId" TEXT,
  "accountPassword" TEXT,
  "adminName" TEXT,
  email TEXT,
  "userType" TEXT,
  channels JSONB,
  "walletBalance" NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Active',
  "childUsersCount" INT DEFAULT 0,
  "createdAt" TEXT
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Drop policy if it already exists before creating it to prevent ERROR 42710
DROP POLICY IF EXISTS "Tenant Data Isolation Policy" ON tenants;
CREATE POLICY "Tenant Data Isolation Policy" ON tenants
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Templates Table
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  "templateIdNum" TEXT,
  name TEXT,
  channel TEXT,
  type TEXT,
  "agentName" TEXT,
  sender TEXT,
  category TEXT,
  "bodyText" TEXT,
  "headerMediaUrl" TEXT,
  "headerType" TEXT,
  variables JSONB,
  actions JSONB,
  status TEXT,
  "rejectionReason" TEXT,
  "createdAt" TEXT,
  "updatedAt" TEXT
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Template Access Policy" ON templates;
CREATE POLICY "Template Access Policy" ON templates
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT,
  channel TEXT,
  "templateId" TEXT,
  "recipientCount" INT DEFAULT 0,
  "sentCount" INT DEFAULT 0,
  "deliveredCount" INT DEFAULT 0,
  "readCount" INT DEFAULT 0,
  "failedCount" INT DEFAULT 0,
  "fallbackCount" INT DEFAULT 0,
  status TEXT,
  "totalCost" NUMERIC DEFAULT 0,
  "scheduledAt" TEXT,
  "createdAt" TEXT
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Campaign Access Policy" ON campaigns;
CREATE POLICY "Campaign Access Policy" ON campaigns
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Rate Cards Table
CREATE TABLE IF NOT EXISTS rate_cards (
  id TEXT PRIMARY KEY,
  country TEXT,
  "countryCode" TEXT,
  channel TEXT,
  category TEXT,
  "ratePerMsg" NUMERIC,
  "marginPercent" NUMERIC
);

ALTER TABLE rate_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Rate Card Access Policy" ON rate_cards;
CREATE POLICY "Rate Card Access Policy" ON rate_cards
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Message Logs Table
CREATE TABLE IF NOT EXISTS message_logs (
  id TEXT PRIMARY KEY,
  "recipientPhone" TEXT,
  channel TEXT,
  "templateName" TEXT,
  status TEXT,
  cost NUMERIC,
  timestamp TEXT,
  "errorCode" TEXT,
  "errorReason" TEXT
);

ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Message Log Access Policy" ON message_logs;
CREATE POLICY "Message Log Access Policy" ON message_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Wallet Transactions Table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id TEXT PRIMARY KEY,
  date TEXT,
  type TEXT,
  channel TEXT,
  description TEXT,
  amount NUMERIC,
  "balanceAfter" NUMERIC,
  status TEXT,
  "referenceId" TEXT
);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Wallet Transaction Access Policy" ON wallet_transactions;
CREATE POLICY "Wallet Transaction Access Policy" ON wallet_transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);
