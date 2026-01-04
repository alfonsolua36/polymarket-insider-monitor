-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Wallets table
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT UNIQUE NOT NULL,
  first_seen TIMESTAMP NOT NULL,
  first_trade_market TEXT,
  first_trade_amount NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trades table
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  side TEXT NOT NULL,
  size NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  market_title TEXT,
  market_slug TEXT,
  condition_id TEXT,
  outcome TEXT,
  timestamp TIMESTAMP NOT NULL,
  transaction_hash TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  amount NUMERIC,
  market TEXT,
  metadata JSONB,
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_wallets_address ON wallets(address);
CREATE INDEX idx_trades_wallet ON trades(wallet_address);
CREATE INDEX idx_trades_timestamp ON trades(timestamp DESC);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);
CREATE INDEX idx_alerts_wallet ON alerts(wallet_address);
