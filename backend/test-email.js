// Test script to verify Resend email functionality
const { Resend } = require('resend');

const resend = new Resend('re_fBm4njjG_BvBYFUUQM8bGUu7mEGzojjgp');

async function testEmail() {
  try {
    console.log('📧 Enviando email de prueba...\n');
    
    const { data, error } = await resend.emails.send({
      from: 'Rápido Sur <noreply@send.sbravo.app>',
      to: ['jefe.mantenimiento@rapidosur.cl'],
      subject: '✅ Prueba de Sistema de Emails - Rápido Sur',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🚀 Rápido Sur</h1>
            <p style="color: #e0e0e0; margin: 10px 0 0 0;">Sistema de Gestión de Mantenimiento</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">✅ Email de Prueba</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Este es un email de prueba del sistema de notificaciones de Rápido Sur.
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
            
            <p style="color: #666; line-height: 1.6;">
              <strong>Proveedor de email:</strong> Resend<br>
              <strong>Dominio:</strong> send.sbravo.app<br>
              <strong>Fecha:</strong> ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3001" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Acceder al Sistema
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>Rápido Sur - Sistema de Gestión de Mantenimiento Vehicular</p>
            <p>Este es un email automático, por favor no responder.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Error al enviar email:', error);
      return;
    }

    console.log('✅ Email enviado exitosamente!');
    console.log('📋 Detalles:', JSON.stringify(data, null, 2));
    console.log('\n✉️  Revisa tu bandeja de entrada en: jefe.mantenimiento@rapidosur.cl');
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

testEmail();
