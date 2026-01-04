import { PolymarketService } from './polymarket.js';
import { DetectorService } from './detector.js';
import { NotifierService } from './notifier.js';
import { logger } from '../utils/logger.js';
import { CONSTANTS } from '../config/constants.js';

export class MonitorService {
  constructor(io) {
    this.polymarket = new PolymarketService();
    this.detector = new DetectorService();
    this.notifier = new NotifierService();
    this.io = io;
    this.isRunning = false;
    this.lastProcessedTimestamp = Math.floor(Date.now() / 1000);
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Monitor is already running');
      return;
    }

    this.isRunning = true;
    logger.info('🚀 Starting Polymarket Monitor...');

    this.monitorLoop();
  }

  async monitorLoop() {
    while (this.isRunning) {
      try {
        await this.checkForAlerts();
      } catch (error) {
        logger.error('Error in monitor loop:', error.message);
      }

      await this.sleep(CONSTANTS.POLL_INTERVAL);
    }
  }

  async checkForAlerts() {
    logger.info('Checking for new trades...');

    const trades = await this.polymarket.getRecentTrades();

    const newTrades = trades.filter(t => t.timestamp > this.lastProcessedTimestamp);

    logger.info(`Found ${newTrades.length} new trades`);

    for (const trade of newTrades) {
      await this.detector.saveTrade(trade);

      const newWalletAlert = await this.detector.detectNewWalletLargeBet(trade);
      if (newWalletAlert) {
        await this.notifier.sendAlert(newWalletAlert, this.io);
      }

      const rapidAlert = await this.detector.detectRapidAccumulation(trade.proxyWallet);
      if (rapidAlert) {
        await this.notifier.sendAlert(rapidAlert, this.io);
      }

      try {
        const positions = await this.polymarket.getWalletPositions(trade.proxyWallet);
        const concentratedAlert = await this.detector.detectConcentratedBet(trade.proxyWallet, positions);
        if (concentratedAlert) {
          await this.notifier.sendAlert(concentratedAlert, this.io);
        }
      } catch (error) {
        logger.error(`Error checking positions for ${trade.proxyWallet}:`, error.message);
      }
    }

    if (newTrades.length > 0) {
      this.lastProcessedTimestamp = Math.max(...newTrades.map(t => t.timestamp));
    }
  }

  stop() {
    logger.info('Stopping monitor...');
    this.isRunning = false;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
