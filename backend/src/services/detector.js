import { supabase } from '../config/database.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class DetectorService {
  
  async detectNewWalletLargeBet(trade) {
    const walletAddress = trade.proxyWallet;
    const tradeAmount = trade.size * trade.price;

    if (tradeAmount < CONSTANTS.LARGE_BET_THRESHOLD) {
      return null;
    }

    const { data: existingWallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('address', walletAddress)
      .single();

    if (!existingWallet) {
      await this.saveWallet(walletAddress, trade);
      
      return {
        type: 'NEW_WALLET_LARGE_BET',
        wallet: walletAddress,
        amount: tradeAmount,
        market: trade.title,
        side: trade.side,
        timestamp: trade.timestamp
      };
    }

    const walletAge = Date.now() - new Date(existingWallet.first_seen).getTime();
    const ageDays = walletAge / (1000 * 60 * 60 * 24);

    if (ageDays < CONSTANTS.NEW_WALLET_AGE_DAYS) {
      return {
        type: 'YOUNG_WALLET_LARGE_BET',
        wallet: walletAddress,
        amount: tradeAmount,
        market: trade.title,
        side: trade.side,
        walletAgeDays: ageDays.toFixed(1),
        timestamp: trade.timestamp
      };
    }

    return null;
  }

  async detectRapidAccumulation(walletAddress) {
    const hoursAgo = CONSTANTS.RAPID_ACCUMULATION_HOURS;
    const threshold = CONSTANTS.RAPID_ACCUMULATION_THRESHOLD;

    const { data: recentTrades } = await supabase
      .from('trades')
      .select('*')
      .eq('wallet_address', walletAddress)
      .gte('timestamp', new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString());

    if (!recentTrades) return null;

    const totalVolume = recentTrades.reduce((sum, trade) => {
      return sum + (trade.size * trade.price);
    }, 0);

    if (totalVolume >= threshold) {
      return {
        type: 'RAPID_ACCUMULATION',
        wallet: walletAddress,
        amount: totalVolume,
        tradeCount: recentTrades.length,
        timeframe: `${hoursAgo} hours`,
        timestamp: Date.now()
      };
    }

    return null;
  }

  async detectConcentratedBet(walletAddress, positions) {
    if (!positions || positions.length === 0) return null;

    const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
    
    for (const position of positions) {
      const concentration = position.currentValue / totalValue;
      
      if (concentration >= CONSTANTS.CONCENTRATED_BET_THRESHOLD) {
        return {
          type: 'CONCENTRATED_BET',
          wallet: walletAddress,
          market: position.title,
          amount: position.currentValue,
          concentration: (concentration * 100).toFixed(1) + '%',
          timestamp: Date.now()
        };
      }
    }

    return null;
  }

  async saveWallet(address, firstTrade) {
    try {
      const { error } = await supabase
        .from('wallets')
        .insert({
          address,
          first_seen: new Date(firstTrade.timestamp * 1000).toISOString(),
          first_trade_market: firstTrade.title,
          first_trade_amount: firstTrade.size * firstTrade.price
        });

      if (error) throw error;
      logger.info(`Saved new wallet: ${address}`);
    } catch (error) {
      logger.error(`Error saving wallet ${address}:`, error.message);
    }
  }

  async saveTrade(trade) {
    try {
      const { error } = await supabase
        .from('trades')
        .insert({
          wallet_address: trade.proxyWallet,
          side: trade.side,
          size: trade.size,
          price: trade.price,
          market_title: trade.title,
          market_slug: trade.slug,
          condition_id: trade.conditionId,
          outcome: trade.outcome,
          timestamp: new Date(trade.timestamp * 1000).toISOString(),
          transaction_hash: trade.transactionHash
        });

      if (error) throw error;
    } catch (error) {
      logger.error('Error saving trade:', error.message);
    }
  }
}
