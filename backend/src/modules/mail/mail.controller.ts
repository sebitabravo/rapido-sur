import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Usuario } from '../users/entities/usuario.entity';
import { MailService } from './mail.service';
import { RolUsuario } from '../../common/enums';

@ApiTags('mail')
@ApiBearerAuth('JWT-auth')
@Controller('mail')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test')
  @Roles(RolUsuario.Administrador)
  @ApiOperation({ summary: 'Send test email to verify Resend configuration' })
  async sendTestEmail() {
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🚀 Rápido Sur</h1>
            <p style="color: #e0e0e0; margin: 10px 0 0 0;">Sistema de Gestión de Mantenimiento</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">✅ Email de Prueba</h2>
            
            <p style="color: #666; line-height: 1.6;">
              ¡Hola! Este es un email de prueba del sistema de notificaciones de Rápido Sur.
            </p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #667eea; margin-top: 0;">🔧 Funcionalidades Activas:</h3>
                <ul style="color: #666; line-height: 1.8;">
                  <li>✅ Notificación de creación de OT</li>
                  <li>✅ Notificación de actualización de OT</li>
                  <li>✅ Notificación de asignación de mecánico</li>
                  <li>✅ Notificación de finalización de OT</li>
                  <li>✅ Alertas preventivas automáticas</li>
                </ul>
              </div>
              
              <div style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
                <p style="margin: 0; color: #1976D2; font-weight: bold;">📧 Configuración de Email</p>
                <p style="margin: 10px 0 0 0; color: #666;">
                  <strong>Proveedor:</strong> Resend<br>
                  <strong>Dominio:</strong> send.sbravo.app<br>
                  <strong>API Key:</strong> re_fBm...jjgp (configurada)<br>
                  <strong>Fecha:</strong> ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                Si recibiste este email, significa que el sistema de notificaciones está funcionando correctamente. 🎉
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3001" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Acceder al Sistema
                </a>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>Rápido Sur - Sistema de Gestión de Mantenimiento Vehicular</p>
            <p>Este es un email automático generado para pruebas.</p>
          </div>
        </div>
      `;

      await this.mailService.sendMail(
        'sebastianalejandrobravocampos@gmail.com',
        '✅ Prueba de Sistema de Emails - Rápido Sur',
        emailHtml
      );

      return {
        success: true,
        message: 'Email de prueba enviado exitosamente a sebastianalejandrobravocampos@gmail.com',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al enviar email de prueba',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
