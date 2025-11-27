import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from 'resend';
import { Alerta } from "../alerts/entities/alerta.entity";

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.initializeResend();
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
        from: this.configService.get<string>("MAIL_FROM") || 'Rápido Sur <noreply@send.sbravo.app>',
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
   * Send preventive maintenance alert to maintenance manager
   * @param alerts Array of alert objects with vehicle information
   */
  async sendPreventiveAlerts(
    alerts: Array<{
      patente: string;
      modelo: string;
      razon: string;
    }>,
  ): Promise<void> {
    const managerEmail = this.configService.get<string>(
      "MAINTENANCE_MANAGER_EMAIL",
    );

    if (!managerEmail) {
      this.logger.error("MAINTENANCE_MANAGER_EMAIL not configured");
      throw new Error("Manager email not configured in environment variables");
    }

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

    await this.sendMail(
      managerEmail,
      "⚠️ Alertas de Mantenimiento Preventivo - Rápido Sur",
      html,
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

    await this.sendMail(
      mechanicEmail,
      `Nueva Orden de Trabajo: ${workOrderNumber}`,
      html,
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

    await this.sendMail(
      managerEmail,
      `✅ Nueva OT Creada: ${workOrderNumber}`,
      managerHtml,
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

      await this.sendMail(
        mechanicEmail,
        `🔧 Nueva OT Asignada: ${workOrderNumber}`,
        mechanicHtml,
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

    // Send to manager
    await this.sendMail(
      managerEmail,
      `🔄 OT Actualizada: ${workOrderNumber}`,
      html,
    );

    // Send to mechanic if assigned
    if (mechanicEmail && mechanicName) {
      await this.sendMail(
        mechanicEmail,
        `🔄 OT Actualizada: ${workOrderNumber}`,
        html,
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

    await this.sendMail(
      managerEmail,
      `✅ OT Finalizada: ${workOrderNumber}`,
      html,
    );
  }
}
