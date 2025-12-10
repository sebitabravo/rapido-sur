import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PartsService } from "./parts.service";
import { MailService } from "../mail/mail.service";
import { EventsGateway } from "../websockets/events.gateway";
import { Usuario } from "../users/entities/usuario.entity";
import { RolUsuario } from "../../common/enums";

/**
 * Service for inventory alerts (low stock notifications)
 * Runs daily cron job to check stock levels and notifies ALL maintenance managers
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
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
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
   * Get all active maintenance managers to send alerts
   * Falls back to MAINTENANCE_MANAGER_EMAIL if no managers found in DB
   */
  private async getMaintenanceManagerEmails(): Promise<string[]> {
    // Get all active maintenance managers and admins from database
    const managers = await this.usuarioRepo.find({
      where: [
        { rol: RolUsuario.JefeMantenimiento, activo: true },
        { rol: RolUsuario.Administrador, activo: true },
      ],
      select: ['email', 'nombre_completo', 'rol'],
    });

    const emails = managers
      .filter(m => m.email) // Filter out null emails
      .map(m => m.email);

    if (emails.length > 0) {
      this.logger.log(`Found ${emails.length} maintenance managers/admins: ${emails.join(', ')}`);
      return emails;
    }

    // Fallback to environment variable if no managers in DB
    const fallbackEmail = this.configService.get<string>("MAINTENANCE_MANAGER_EMAIL");
    if (fallbackEmail) {
      this.logger.warn(
        `No maintenance managers found in database, using fallback email: ${fallbackEmail}`
      );
      return [fallbackEmail];
    }

    this.logger.error("No maintenance manager emails found (neither in DB nor env var)");
    return [];
  }

  /**
   * Cron job that runs daily at 7:00 AM to check for low stock
   * Can be configured via ALERTS_CRON_SCHEDULE env var
   * Default: Every day at 7:00 AM (1 hour after vehicle maintenance alerts)
   * Sends alerts to ALL active maintenance managers and admins
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

      // Get all maintenance manager emails
      const managerEmails = await this.getMaintenanceManagerEmails();

      if (managerEmails.length === 0) {
        this.logger.error("Cannot send low stock alert: No manager emails configured");
        return;
      }

      // Format parts for email
      const formattedParts = result.lowStockParts.map((part) => ({
        codigo: part.codigo,
        nombre: part.nombre,
        cantidad_stock: part.cantidad_stock,
        stock_minimo: part.stock_minimo,
      }));

      // Send email alert to ALL managers
      await this.mailService.sendLowStockAlertToMultiple(formattedParts, managerEmails);

      // Emit WebSocket event for real-time notification
      this.eventsGateway.emitLowStockAlert({
        parts: formattedParts,
        totalParts: formattedParts.length,
      });

      this.logger.log(
        `Low stock alert sent successfully for ${formattedParts.length} parts to ${managerEmails.length} managers`,
      );
    } catch (error) {
      this.logger.error("Error during low stock check:", error);
      throw error;
    }
  }

  /**
   * Send low stock alert for a single part immediately
   * Called when stock falls below minimum after usage
   * @param part Part that fell below minimum stock
   */
  async notifyLowStockPart(part: {
    id: number;
    codigo: string;
    nombre: string;
    cantidad_stock: number;
    stock_minimo: number;
  }): Promise<void> {
    this.logger.log(
      `Low stock detected for ${part.codigo}: ${part.cantidad_stock}/${part.stock_minimo}`
    );

    const managerEmails = await this.getMaintenanceManagerEmails();

    if (managerEmails.length === 0) {
      this.logger.error("Cannot send low stock alert: No manager emails configured");
      return;
    }

    const formattedPart = {
      codigo: part.codigo,
      nombre: part.nombre,
      cantidad_stock: part.cantidad_stock,
      stock_minimo: part.stock_minimo,
    };

    try {
      // Send email alert to all managers
      await this.mailService.sendLowStockAlertToMultiple([formattedPart], managerEmails);

      // Emit WebSocket event for real-time notification
      this.eventsGateway.emitLowStockAlert({
        parts: [formattedPart],
        totalParts: 1,
      });

      this.logger.log(
        `Immediate low stock alert sent for ${part.codigo} to ${managerEmails.length} managers`
      );
    } catch (error) {
      this.logger.error(`Failed to send low stock alert for ${part.codigo}:`, error);
    }
  }

  /**
   * Manual trigger for low stock check
   * Can be called via API endpoint for testing or manual execution
   * Sends alerts to ALL active maintenance managers and admins
   */
  async checkNow(): Promise<{
    partsFound: number;
    alertSent: boolean;
    emailsSent: number;
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
        emailsSent: 0,
        parts: [],
      };
    }

    // Get all maintenance manager emails
    const managerEmails = await this.getMaintenanceManagerEmails();

    if (managerEmails.length === 0) {
      this.logger.error("Cannot send low stock alert: No manager emails configured");
      return {
        partsFound: result.lowStockParts.length,
        alertSent: false,
        emailsSent: 0,
        parts: result.lowStockParts.map((part) => ({
          codigo: part.codigo,
          nombre: part.nombre,
          cantidad_stock: part.cantidad_stock,
          stock_minimo: part.stock_minimo,
        })),
      };
    }

    const formattedParts = result.lowStockParts.map((part) => ({
      codigo: part.codigo,
      nombre: part.nombre,
      cantidad_stock: part.cantidad_stock,
      stock_minimo: part.stock_minimo,
    }));

    try {
      // Send email alert to ALL managers
      await this.mailService.sendLowStockAlertToMultiple(formattedParts, managerEmails);

      // Emit WebSocket event for real-time notification
      this.eventsGateway.emitLowStockAlert({
        parts: formattedParts,
        totalParts: formattedParts.length,
      });

      this.logger.log(
        `Manual low stock alert sent to ${managerEmails.length} managers for ${formattedParts.length} parts`,
      );

      return {
        partsFound: formattedParts.length,
        alertSent: true,
        emailsSent: managerEmails.length,
        parts: formattedParts,
      };
    } catch (error) {
      this.logger.error("Failed to send low stock alert:", error);
      return {
        partsFound: formattedParts.length,
        alertSent: false,
        emailsSent: 0,
        parts: formattedParts,
      };
    }
  }
}
