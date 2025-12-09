import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Resend } from 'resend';
import { Alerta } from "../alerts/entities/alerta.entity";
import { Usuario } from "../users/entities/usuario.entity";
import { RolUsuario } from "../../common/enums";

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {
    this.initializeResend();
  }

  /**
   * Check if user has email notifications enabled
   * @param email User's email address
   * @returns Object with notification preferences
   */
  private async getUserNotificationPreferences(email: string): Promise<{
    notif_email: boolean;
    notif_mantenimiento: boolean;
    notif_reportes_semanales: boolean;
  } | null> {
    try {
      const user = await this.usuarioRepository.findOne({ where: { email } });
      if (!user) return null;
      return {
        notif_email: user.notif_email ?? true,
        notif_mantenimiento: user.notif_mantenimiento ?? true,
        notif_reportes_semanales: user.notif_reportes_semanales ?? false,
      };
    } catch (error) {
      this.logger.warn(`Could not fetch preferences for ${email}, defaulting to enabled`);
      return { notif_email: true, notif_mantenimiento: true, notif_reportes_semanales: false };
    }
  }

  /**
   * Send email only if user has notifications enabled
   * Important emails (isImportant=true) are always sent
   */
  async sendMailWithPreferences(
    to: string,
    subject: string,
    html: string,
    options: { isImportant?: boolean; isMaintenanceAlert?: boolean; isWeeklyReport?: boolean } = {}
  ): Promise<boolean> {
    const { isImportant = false, isMaintenanceAlert = false, isWeeklyReport = false } = options;
    
    // Important emails are always sent
    if (isImportant) {
      await this.sendMail(to, subject, html);
      return true;
    }
    
    const prefs = await this.getUserNotificationPreferences(to);
    
    // If no user found or general email disabled, don't send (except important)
    if (!prefs || !prefs.notif_email) {
      this.logger.log(`Email to ${to} skipped: notifications disabled`);
      return false;
    }
    
    // Check specific notification type
    if (isMaintenanceAlert && !prefs.notif_mantenimiento) {
      this.logger.log(`Maintenance alert to ${to} skipped: preference disabled`);
      return false;
    }
    
    if (isWeeklyReport && !prefs.notif_reportes_semanales) {
      this.logger.log(`Weekly report to ${to} skipped: preference disabled`);
      return false;
    }
    
    await this.sendMail(to, subject, html);
    return true;
  }

  /**
   * Initialize Resend client with API key from environment variables
   */
  private initializeResend() {
    const apiKey = this.configService.get<string>("RESEND_API_KEY");
    
    if (!apiKey) {
      this.logger.error("RESEND_API_KEY not configured");
      throw new Error("RESEND_API_KEY not configured in environment variables");
    }

    this.resend = new Resend(apiKey);
    this.logger.log("Resend client initialized successfully");
  }

  /**
   * Send a generic email using Resend
   * @param to Recipient email address
   * @param subject Email subject
   * @param html HTML content of the email
   */
  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.configService.get<string>("MAIL_FROM") || 'Rápido Sur <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      });

      if (error) {
        this.logger.error(`Failed to send email to ${to}:`, error);
        throw error;
      }

      this.logger.log(`Email sent successfully to ${to}`, data);
    } catch (error: unknown) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Send preventive maintenance alert to ALL maintenance managers and admins
   * Sends to users with role JefeMantenimiento or Administrador who have notifications enabled
   * @param alerts Array of alert objects with vehicle information
   */
  async sendPreventiveAlerts(
    alerts: Array<{
      patente: string;
      modelo: string;
      razon: string;
    }>,
  ): Promise<void> {
    // Find all maintenance managers and admins with maintenance notifications enabled
    const managers = await this.usuarioRepository.find({
      where: [
        { rol: RolUsuario.JefeMantenimiento, activo: true, notif_mantenimiento: true },
        { rol: RolUsuario.Administrador, activo: true, notif_mantenimiento: true },
      ],
    });

    if (managers.length === 0) {
      // Fallback to environment variable if no managers found
      const fallbackEmail = this.configService.get<string>("MAINTENANCE_MANAGER_EMAIL");
      if (fallbackEmail) {
        this.logger.warn("No managers with notifications enabled found, using fallback email");
        await this.sendPreventiveAlertsToEmail(fallbackEmail, alerts);
      } else {
        this.logger.error("No managers found and MAINTENANCE_MANAGER_EMAIL not configured");
      }
      return;
    }

    this.logger.log(`Sending preventive alerts to ${managers.length} managers`);

    // Send to all managers
    for (const manager of managers) {
      try {
        await this.sendPreventiveAlertsToEmail(manager.email, alerts);
        this.logger.log(`Preventive alert sent to ${manager.email}`);
      } catch (error) {
        this.logger.error(`Failed to send preventive alert to ${manager.email}:`, error);
      }
    }
  }

  /**
   * Send preventive alerts to a specific email
   * @param email Recipient email address
   * @param alerts Array of alert objects
   */
  private async sendPreventiveAlertsToEmail(
    email: string,
    alerts: Array<{
      patente: string;
      modelo: string;
      razon: string;
    }>,
  ): Promise<void> {

    const alertRows = alerts
      .map(
        (alert) => `
        <tr>
          <td style="padding: 12px; border: 1px solid #ddd;">${alert.patente}</td>
          <td style="padding: 12px; border: 1px solid #ddd;">${alert.modelo}</td>
          <td style="padding: 12px; border: 1px solid #ddd;">${alert.razon}</td>
        </tr>
      `,
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Alertas de Mantenimiento Preventivo</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #d32f2f;">⚠️ Alertas de Mantenimiento Preventivo</h1>
            <p>Los siguientes vehículos requieren mantenimiento preventivo próximamente:</p>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Patente</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Modelo</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Razón</th>
                </tr>
              </thead>
              <tbody>
                ${alertRows}
              </tbody>
            </table>

            <p style="margin-top: 20px;">
              <a href="${this.configService.get<string>("FRONTEND_URL")}/ordenes-trabajo/nueva"
                 style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Crear Orden de Trabajo
              </a>
            </p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              Este es un mensaje automático del Sistema de Gestión de Mantenimiento - Rápido Sur<br>
              Por favor no responder a este correo.
            </p>
          </div>
        </body>
      </html>
    `;

    // Send directly (preferences already checked in parent method)
    await this.sendMail(
      email,
      "⚠️ Alertas de Mantenimiento Preventivo - Rápido Sur",
      html
    );
  }

  /**
   * Send preventive alerts with Alerta entities
   * Used by AlertsService cron job
   */
  async enviarAlertasPreventivas(alertas: Alerta[]): Promise<void> {
    const formattedAlerts = alertas.map((alerta) => ({
      patente: alerta.vehiculo.patente,
      modelo: `${alerta.vehiculo.marca} ${alerta.vehiculo.modelo}`,
      razon: alerta.mensaje.split(": ")[1] || alerta.mensaje, // Extract reason from message
    }));

    await this.sendPreventiveAlerts(formattedAlerts);
  }

  /**
   * Send work order assignment notification to mechanic
   * @param mechanicEmail Mechanic's email address
   * @param mechanicName Mechanic's name
   * @param workOrderNumber Work order number
   * @param vehiclePatente Vehicle license plate
   */
  async sendWorkOrderAssignment(
    mechanicEmail: string,
    mechanicName: string,
    workOrderNumber: string,
    vehiclePatente: string,
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Nueva Orden de Trabajo Asignada</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1976d2;">🔧 Nueva Orden de Trabajo Asignada</h1>
            <p>Hola <strong>${mechanicName}</strong>,</p>
            <p>Se te ha asignado una nueva orden de trabajo:</p>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Número de OT:</strong> ${workOrderNumber}</p>
              <p style="margin: 8px 0;"><strong>Vehículo:</strong> ${vehiclePatente}</p>
            </div>

            <p>
              <a href="${this.configService.get<string>("FRONTEND_URL")}/ordenes-trabajo/${workOrderNumber}"
                 style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Ver Orden de Trabajo
              </a>
            </p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              Este es un mensaje automático del Sistema de Gestión de Mantenimiento - Rápido Sur
            </p>
          </div>
        </body>
      </html>
    `;

    // Work order assignment is IMPORTANT - always sent
    await this.sendMailWithPreferences(
      mechanicEmail,
      `Nueva Orden de Trabajo: ${workOrderNumber}`,
      html,
      { isImportant: true }
    );
  }

  /**
   * Send work order creation notification to mechanic and manager
   * @param mechanicEmail Mechanic's email (can be null if not assigned)
   * @param mechanicName Mechanic's name
   * @param managerEmail Manager's email
   * @param workOrderNumber Work order number
   * @param vehicleInfo Vehicle information
   * @param tipo Type of work order (Preventivo/Correctivo)
   */
  async sendWorkOrderCreated(
    mechanicEmail: string | null,
    mechanicName: string | null,
    managerEmail: string,
    workOrderNumber: string,
    vehicleInfo: { patente: string; marca: string; modelo: string },
    tipo: string,
  ): Promise<void> {
    const vehicleDisplay = `${vehicleInfo.marca} ${vehicleInfo.modelo} (${vehicleInfo.patente})`;

    // Email to manager
    const managerHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Nueva Orden de Trabajo Creada</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1976d2;">📝 Nueva Orden de Trabajo Creada</h1>
            <p>Se ha creado una nueva orden de trabajo en el sistema:</p>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Número de OT:</strong> ${workOrderNumber}</p>
              <p style="margin: 8px 0;"><strong>Tipo:</strong> ${tipo}</p>
              <p style="margin: 8px 0;"><strong>Vehículo:</strong> ${vehicleDisplay}</p>
              <p style="margin: 8px 0;"><strong>Mecánico:</strong> ${mechanicName || 'Sin asignar'}</p>
            </div>

            <p>
              <a href="${this.configService.get<string>("FRONTEND_URL")}/ordenes-trabajo"
                 style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Ver Orden de Trabajo
              </a>
            </p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              Este es un mensaje automático del Sistema de Gestión de Mantenimiento - Rápido Sur
            </p>
          </div>
        </body>
      </html>
    `;

    // OT creation notification to manager is IMPORTANT
    await this.sendMailWithPreferences(
      managerEmail,
      `✅ Nueva OT Creada: ${workOrderNumber}`,
      managerHtml,
      { isImportant: true }
    );

    // Email to mechanic if assigned
    if (mechanicEmail && mechanicName) {
      const mechanicHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Nueva Orden de Trabajo Asignada</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #1976d2;">🔧 Nueva Orden de Trabajo Asignada</h1>
              <p>Hola <strong>${mechanicName}</strong>,</p>
              <p>Se te ha asignado una nueva orden de trabajo:</p>

              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 8px 0;"><strong>Número de OT:</strong> ${workOrderNumber}</p>
                <p style="margin: 8px 0;"><strong>Tipo:</strong> ${tipo}</p>
                <p style="margin: 8px 0;"><strong>Vehículo:</strong> ${vehicleDisplay}</p>
              </div>

              <p>
                <a href="${this.configService.get<string>("FRONTEND_URL")}/ordenes-trabajo"
                   style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  Ver Orden de Trabajo
                </a>
              </p>

              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 12px;">
                Este es un mensaje automático del Sistema de Gestión de Mantenimiento - Rápido Sur
              </p>
            </div>
          </body>
        </html>
      `;

      // OT assignment to mechanic is IMPORTANT
      await this.sendMailWithPreferences(
        mechanicEmail,
        `🔧 Nueva OT Asignada: ${workOrderNumber}`,
        mechanicHtml,
        { isImportant: true }
      );
    }
  }

  /**
   * Send work order update notification to mechanic and manager
   * @param mechanicEmail Mechanic's email (can be null)
   * @param mechanicName Mechanic's name
   * @param managerEmail Manager's email
   * @param workOrderNumber Work order number
   * @param vehicleInfo Vehicle information
   * @param changes Description of changes made
   */
  async sendWorkOrderUpdated(
    mechanicEmail: string | null,
    mechanicName: string | null,
    managerEmail: string,
    workOrderNumber: string,
    vehicleInfo: { patente: string; marca: string; modelo: string },
    changes: string,
  ): Promise<void> {
    const vehicleDisplay = `${vehicleInfo.marca} ${vehicleInfo.modelo} (${vehicleInfo.patente})`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Orden de Trabajo Actualizada</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #ff9800;">🔄 Orden de Trabajo Actualizada</h1>
            <p>La orden de trabajo <strong>${workOrderNumber}</strong> ha sido actualizada:</p>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Número de OT:</strong> ${workOrderNumber}</p>
              <p style="margin: 8px 0;"><strong>Vehículo:</strong> ${vehicleDisplay}</p>
              <p style="margin: 8px 0;"><strong>Cambios:</strong> ${changes}</p>
            </div>

            <p>
              <a href="${this.configService.get<string>("FRONTEND_URL")}/ordenes-trabajo"
                 style="background-color: #ff9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Ver Orden de Trabajo
              </a>
            </p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              Este es un mensaje automático del Sistema de Gestión de Mantenimiento - Rápido Sur
            </p>
          </div>
        </body>
      </html>
    `;

    // OT updates are IMPORTANT
    await this.sendMailWithPreferences(
      managerEmail,
      `🔄 OT Actualizada: ${workOrderNumber}`,
      html,
      { isImportant: true }
    );

    // Send to mechanic if assigned
    if (mechanicEmail && mechanicName) {
      await this.sendMailWithPreferences(
        mechanicEmail,
        `🔄 OT Actualizada: ${workOrderNumber}`,
        html,
        { isImportant: true }
      );
    }
  }

  /**
   * Send work order completion notification to manager
   * @param managerEmail Manager's email
   * @param mechanicName Mechanic who completed the work
   * @param workOrderNumber Work order number
   * @param vehicleInfo Vehicle information
   */
  async sendWorkOrderCompleted(
    managerEmail: string,
    mechanicName: string,
    workOrderNumber: string,
    vehicleInfo: { patente: string; marca: string; modelo: string },
  ): Promise<void> {
    const vehicleDisplay = `${vehicleInfo.marca} ${vehicleInfo.modelo} (${vehicleInfo.patente})`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Orden de Trabajo Finalizada</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4caf50;">✅ Orden de Trabajo Finalizada</h1>
            <p>La orden de trabajo <strong>${workOrderNumber}</strong> ha sido completada:</p>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Número de OT:</strong> ${workOrderNumber}</p>
              <p style="margin: 8px 0;"><strong>Vehículo:</strong> ${vehicleDisplay}</p>
              <p style="margin: 8px 0;"><strong>Completado por:</strong> ${mechanicName}</p>
            </div>

            <p>
              <a href="${this.configService.get<string>("FRONTEND_URL")}/ordenes-trabajo"
                 style="background-color: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Ver Orden de Trabajo
              </a>
            </p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              Este es un mensaje automático del Sistema de Gestión de Mantenimiento - Rápido Sur
            </p>
          </div>
        </body>
      </html>
    `;

    // OT completion is IMPORTANT
    await this.sendMailWithPreferences(
      managerEmail,
      `✅ OT Finalizada: ${workOrderNumber}`,
      html,
      { isImportant: true }
    );
  }

  /**
   * Send low stock alert to manager
   * @param lowStockParts Array of parts with low stock
   */
  async sendLowStockAlert(
    lowStockParts: Array<{
      codigo: string;
      nombre: string;
      cantidad_stock: number;
      stock_minimo: number;
    }>,
  ): Promise<void> {
    const managerEmail = this.configService.get<string>(
      "MAINTENANCE_MANAGER_EMAIL",
    );

    if (!managerEmail) {
      this.logger.error("MAINTENANCE_MANAGER_EMAIL not configured");
      throw new Error("Manager email not configured in environment variables");
    }

    const partRows = lowStockParts
      .map(
        (part) => `
        <tr>
          <td style="padding: 12px; border: 1px solid #ddd;">${part.codigo}</td>
          <td style="padding: 12px; border: 1px solid #ddd;">${part.nombre}</td>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${part.cantidad_stock}</td>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${part.stock_minimo}</td>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: center; color: ${part.cantidad_stock === 0 ? '#d32f2f' : '#ff9800'}; font-weight: bold;">
            ${part.cantidad_stock === 0 ? 'Sin Stock' : 'Stock Bajo'}
          </td>
        </tr>
      `,
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Alerta de Stock Bajo - Repuestos</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 900px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #ff9800;">⚠️ Alerta de Stock Bajo - Repuestos</h1>
            <p>Los siguientes repuestos tienen stock bajo o agotado y requieren reabastecimiento:</p>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Código</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Repuesto</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Stock Actual</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Stock Mínimo</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Estado</th>
                </tr>
              </thead>
              <tbody>
                ${partRows}
              </tbody>
            </table>

            <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
              <p style="margin: 0;"><strong>⚠️ Acción requerida:</strong> Es necesario realizar un pedido de reabastecimiento para estos repuestos.</p>
            </div>

            <p style="margin-top: 20px;">
              <a href="${this.configService.get<string>("FRONTEND_URL")}/parts"
                 style="background-color: #ff9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Gestionar Inventario
              </a>
            </p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              Este es un mensaje automático del Sistema de Gestión de Mantenimiento - Rápido Sur<br>
              Por favor no responder a este correo.
            </p>
          </div>
        </body>
      </html>
    `;

    // Low stock alerts are maintenance alerts - respect preferences
    await this.sendMailWithPreferences(
      managerEmail,
      "⚠️ Alerta de Stock Bajo - Repuestos - Rápido Sur",
      html,
      { isMaintenanceAlert: true }
    );

    this.logger.log(`Low stock alert sent to ${managerEmail} for ${lowStockParts.length} parts`);
  }
}
