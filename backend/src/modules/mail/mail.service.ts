import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";
import { Alerta } from "../alerts/entities/alerta.entity";

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  /**
   * Initialize nodemailer transporter with SMTP configuration from environment variables
   */
  private initializeTransporter() {
    const mailConfig = {
      host: this.configService.get<string>("MAIL_HOST"),
      port: this.configService.get<number>("MAIL_PORT"),
      secure: this.configService.get<boolean>("MAIL_SECURE"),
      auth: {
        user: this.configService.get<string>("MAIL_USER"),
        pass: this.configService.get<string>("MAIL_PASSWORD"),
      },
    };

    this.transporter = nodemailer.createTransport(mailConfig);

    // Verify transporter configuration
    this.transporter.verify((error: Error | null) => {
      if (error) {
        this.logger.error("Error configuring mail transporter:", error);
      } else {
        this.logger.log("Mail transporter configured successfully");
      }
    });
  }

  /**
   * Send a generic email
   * @param to Recipient email address
   * @param subject Email subject
   * @param html HTML content of the email
   */
  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      const mailOptions = {
        from: this.configService.get<string>("MAIL_FROM"),
        to,
        subject,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${to}`);
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
}
