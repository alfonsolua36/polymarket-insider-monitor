import axios from 'axios';
import { logger } from '../utils/logger.js';

const POLYMARKET_API = process.env.POLYMARKET_API_BASE || 'https://data-api.polymarket.com';

export class PolymarketService {
  constructor() {
    this.client = axios.create({
      baseURL: POLYMARKET_API,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  async getRecentTrades(limit = 500) {
    try {
      const response = await this.client.get('/trades', {
        params: { limit, takerOnly: true }
      });
      logger.info(`Fetched ${response.data.length} recent trades`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching trades:', error.message);
      throw error;
    }
  }

  async getWalletPositions(walletAddress) {
    try {
      const response = await this.client.get('/positions', {
        params: { user: walletAddress, limit: 500 }
      });
      return response.data;
    } catch (error) {
      logger.error(`Error fetching positions for ${walletAddress}:`, error.message);
      throw error;
    }
  }

  async getWalletActivity(walletAddress, limit = 100) {
    try {
      const response = await this.client.get('/activity', {
        params: { user: walletAddress, limit }
      });
      return response.data;
    } catch (error) {
      logger.error(`Error fetching activity for ${walletAddress}:`, error.message);
      throw error;
    }
  }

  async getMarketHolders(conditionId, limit = 100) {
    try {
      const response = await this.client.get('/holders', {
        params: { market: conditionId, limit }
      });
      return response.data;
    } catch (error) {
      logger.error(`Error fetching holders for ${conditionId}:`, error.message);
      throw error;
    }
  }
}
