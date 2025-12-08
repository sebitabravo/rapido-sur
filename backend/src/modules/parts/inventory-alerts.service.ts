import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PartsService } from "./parts.service";
import { MailService } from "../mail/mail.service";
import { EventsGateway } from "../websockets/events.gateway";

/**
 * Service for inventory alerts (low stock notifications)
 * Runs daily cron job to check stock levels
 */
@Injectable()
export class InventoryAlertsService {
  private readonly logger = new Logger(InventoryAlertsService.name);
  private readonly cronEnabled: boolean;

  constructor(
    private readonly partsService: PartsService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly eventsGateway: EventsGateway,
  ) {
    this.cronEnabled =
      this.configService.get<string>("ENABLE_CRON") === "true";
    if (this.cronEnabled) {
      this.logger.log("Inventory alerts cron job is ENABLED");
    } else {
      this.logger.warn("Inventory alerts cron job is DISABLED");
    }
  }

  /**
   * Cron job that runs daily at 7:00 AM to check for low stock
   * Can be configured via ALERTS_CRON_SCHEDULE env var
   * Default: Every day at 7:00 AM (1 hour after vehicle maintenance alerts)
   */
  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async checkLowStockDaily() {
    if (!this.cronEnabled) {
      this.logger.debug("Cron job skipped (ENABLE_CRON=false)");
      return;
    }

    this.logger.log("Starting daily low stock check...");

    try {
      const result = await this.partsService.checkLowStockAlerts();

      if (result.lowStockParts.length === 0) {
        this.logger.log("No low stock parts found. No alerts sent.");
        return;
      }

      // Format parts for email
      const formattedParts = result.lowStockParts.map((part) => ({
        codigo: part.codigo,
        nombre: part.nombre,
        cantidad_stock: part.cantidad_stock,
        stock_minimo: part.stock_minimo,
      }));

      // Send email alert
      await this.mailService.sendLowStockAlert(formattedParts);

      // Emit WebSocket event for real-time notification
      this.eventsGateway.emitLowStockAlert({
        parts: formattedParts,
        totalParts: formattedParts.length,
      });

      this.logger.log(
        `Low stock alert sent successfully for ${formattedParts.length} parts`,
      );
    } catch (error) {
      this.logger.error("Error during low stock check:", error);
      throw error;
    }
  }

  /**
   * Manual trigger for low stock check
   * Can be called via API endpoint for testing or manual execution
   */
  async checkNow(): Promise<{
    partsFound: number;
    alertSent: boolean;
    parts: Array<{
      codigo: string;
      nombre: string;
      cantidad_stock: number;
      stock_minimo: number;
    }>;
  }> {
    this.logger.log("Manual low stock check triggered");

    const result = await this.partsService.checkLowStockAlerts();

    if (result.lowStockParts.length === 0) {
      return {
        partsFound: 0,
        alertSent: false,
        parts: [],
      };
    }

    const formattedParts = result.lowStockParts.map((part) => ({
      codigo: part.codigo,
      nombre: part.nombre,
      cantidad_stock: part.cantidad_stock,
      stock_minimo: part.stock_minimo,
    }));

    try {
      await this.mailService.sendLowStockAlert(formattedParts);

      // Emit WebSocket event for real-time notification
      this.eventsGateway.emitLowStockAlert({
        parts: formattedParts,
        totalParts: formattedParts.length,
      });

      return {
        partsFound: formattedParts.length,
        alertSent: true,
        parts: formattedParts,
      };
    } catch (error) {
      this.logger.error("Failed to send low stock alert:", error);
      return {
        partsFound: formattedParts.length,
        alertSent: false,
        parts: formattedParts,
      };
    }
  }
}
