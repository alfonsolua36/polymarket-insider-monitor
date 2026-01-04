import TelegramBot from 'node-telegram-bot-api';
import sgMail from '@sendgrid/mail';
import { logger } from '../utils/logger.js';

export class NotifierService {
  constructor() {
    if (process.env.TELEGRAM_BOT_TOKEN) {
      this.telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
      this.telegramChatId = process.env.TELEGRAM_CHAT_ID;
    }

    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.alertEmail = process.env.ALERT_EMAIL;
    }
  }

  async sendAlert(alert, io) {
    const message = this.formatAlertMessage(alert);

    if (io) {
      io.emit('alert', alert);
      logger.info('Alert sent via WebSocket');
    }

    await this.sendTelegram(message);

    if (this.alertEmail) {
      await this.sendEmail(alert, message);
    }
  }

  async sendTelegram(message) {
    if (!this.telegramBot || !this.telegramChatId) {
      logger.warn('Telegram not configured');
      return;
    }

    try {
      await this.telegramBot.sendMessage(this.telegramChatId, message, {
        parse_mode: 'Markdown'
      });
      logger.info('Alert sent via Telegram');
    } catch (error) {
      logger.error('Error sending Telegram message:', error.message);
    }
  }

  async sendEmail(alert, message) {
    try {
      await sgMail.send({
        to: this.alertEmail,
        from: this.alertEmail,
        subject: `🚨 Polymarket Alert: ${alert.type}`,
        text: message,
        html: this.formatEmailHTML(alert)
      });
      logger.info('Alert sent via Email');
    } catch (error) {
      logger.error('Error sending email:', error.message);
    }
  }

  formatAlertMessage(alert) {
    const emoji = this.getAlertEmoji(alert.type);
    const amount = alert.amount ? `$${alert.amount.toLocaleString()}` : 'N/A';

    switch (alert.type) {
      case 'NEW_WALLET_LARGE_BET':
        return `${emoji} *NEW WALLET ALERT*\n\nA brand new wallet just placed a large bet!\n\n💰 Amount: ${amount}\n📊 Market: ${alert.market}\n↗️ Side: ${alert.side}\n🔗 Wallet: \`${alert.wallet.slice(0, 10)}...\``;

      case 'YOUNG_WALLET_LARGE_BET':
        return `${emoji} *YOUNG WALLET ALERT*\n\nA ${alert.walletAgeDays}-day-old wallet placed a large bet!\n\n💰 Amount: ${amount}\n📊 Market: ${alert.market}\n↗️ Side: ${alert.side}\n🔗 Wallet: \`${alert.wallet.slice(0, 10)}...\``;

      case 'RAPID_ACCUMULATION':
        return `${emoji} *RAPID ACCUMULATION*\n\nWallet accumulated ${amount} in ${alert.timeframe}!\n\n📈 Trades: ${alert.tradeCount}\n🔗 Wallet: \`${alert.wallet.slice(0, 10)}...\``;

      case 'CONCENTRATED_BET':
        return `${emoji} *CONCENTRATED POSITION*\n\n${alert.concentration} of portfolio in single market!\n\n💰 Position: ${amount}\n📊 Market: ${alert.market}\n🔗 Wallet: \`${alert.wallet.slice(0, 10)}...\``;

      default:
        return `${emoji} Alert: ${alert.type}`;
    }
  }

  formatEmailHTML(alert) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">🚨 Polymarket Insider Alert</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
          <h3>${alert.type.replace(/_/g, ' ')}</h3>
          <p><strong>Amount:</strong> $${alert.amount?.toLocaleString() || 'N/A'}</p>
          <p><strong>Market:</strong> ${alert.market || 'N/A'}</p>
          <p><strong>Wallet:</strong> <code>${alert.wallet}</code></p>
        </div>
      </div>
    `;
  }

  getAlertEmoji(type) {
    const emojiMap = {
      'NEW_WALLET_LARGE_BET': '🆕',
      'YOUNG_WALLET_LARGE_BET': '👶',
      'RAPID_ACCUMULATION': '⚡',
      'CONCENTRATED_BET': '🎯'
    };
    return emojiMap[type] || '🚨';
  }
}
