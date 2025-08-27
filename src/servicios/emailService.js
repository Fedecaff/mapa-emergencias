import nodemailer from 'nodemailer';

class EmailService {
    constructor() {
        this.transporter = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Configurar transporter para Gmail (puedes cambiar por otro proveedor)
            this.transporter = nodemailer.createTransporter({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD // Contraseña de aplicación de Gmail
                }
            });

            // Verificar conexión
            await this.transporter.verify();
            this.isInitialized = true;
            console.log('✅ Servicio de email inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando servicio de email:', error);
            this.isInitialized = false;
        }
    }

    async enviarCodigoVerificacion(email, codigo) {
        if (!this.isInitialized) {
            throw new Error('Servicio de email no inicializado');
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verificación de Email - Mapa de Emergencias',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(45deg, #3498db, #2980b9); color: white; padding: 20px; text-align: center;">
                        <h1>🔐 Verificación de Email</h1>
                    </div>
                    
                    <div style="padding: 20px; background: #f8f9fa;">
                        <h2>Hola!</h2>
                        <p>Has solicitado verificar tu dirección de email para el <strong>Mapa de Emergencias</strong>.</p>
                        
                        <div style="background: white; border: 2px solid #3498db; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                            <h3 style="color: #3498db; margin: 0;">Tu código de verificación es:</h3>
                            <div style="font-size: 32px; font-weight: bold; color: #2c3e50; letter-spacing: 8px; margin: 15px 0;">
                                ${codigo}
                            </div>
                            <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
                                Este código expira en 10 minutos
                            </p>
                        </div>
                        
                        <p><strong>¿No solicitaste esta verificación?</strong> Puedes ignorar este email de forma segura.</p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #7f8c8d; font-size: 12px;">
                            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
                            <p>Mapa de Emergencias - Sistema de Gestión</p>
                        </div>
                    </div>
                </div>
            `
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email de verificación enviado a ${email}`);
            return result;
        } catch (error) {
            console.error(`❌ Error enviando email a ${email}:`, error);
            throw error;
        }
    }

    async enviarNotificacionEmergencia(email, alerta) {
        if (!this.isInitialized) {
            throw new Error('Servicio de email no inicializado');
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `🚨 ALERTA DE EMERGENCIA - ${alerta.titulo}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(45deg, #e74c3c, #c0392b); color: white; padding: 20px; text-align: center;">
                        <h1>🚨 ALERTA DE EMERGENCIA</h1>
                    </div>
                    
                    <div style="padding: 20px; background: #f8f9fa;">
                        <h2 style="color: #e74c3c;">${alerta.titulo}</h2>
                        <p><strong>Descripción:</strong> ${alerta.descripcion}</p>
                        <p><strong>Tipo:</strong> ${alerta.tipo}</p>
                        <p><strong>Prioridad:</strong> ${alerta.prioridad.toUpperCase()}</p>
                        <p><strong>Dirección:</strong> ${alerta.direccion}</p>
                        
                        <div style="background: white; border: 2px solid #e74c3c; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                            <h3 style="color: #e74c3c;">Se requiere tu presencia inmediata</h3>
                            <p>Por favor, dirígete a la ubicación indicada lo antes posible.</p>
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #7f8c8d; font-size: 12px;">
                            <p>Mapa de Emergencias - Sistema de Gestión</p>
                        </div>
                    </div>
                </div>
            `
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Notificación de emergencia enviada a ${email}`);
            return result;
        } catch (error) {
            console.error(`❌ Error enviando notificación a ${email}:`, error);
            throw error;
        }
    }

    isReady() {
        return this.isInitialized;
    }
}

export default new EmailService();
