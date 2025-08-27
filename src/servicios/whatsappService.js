import { Client, LocalAuth } from 'whatsapp-web.js';

class WhatsAppService {
    constructor() {
        this.client = null;
        this.isReady = false;
        this.isInitialized = false;
    }

    // Inicializar el cliente de WhatsApp
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        try {
            console.log('📱 Inicializando WhatsApp Service...');
            
            this.client = new Client({
                authStrategy: new LocalAuth(),
                puppeteer: {
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                }
            });

            this.client.on('qr', (qr) => {
                console.log('📱 Código QR para WhatsApp:', qr);
                // Aquí podrías mostrar el QR en una interfaz web
            });

            this.client.on('ready', () => {
                console.log('✅ WhatsApp Service listo');
                this.isReady = true;
            });

            this.client.on('auth_failure', (msg) => {
                console.error('❌ Error de autenticación WhatsApp:', msg);
                this.isReady = false;
            });

            this.client.on('disconnected', (reason) => {
                console.log('📱 WhatsApp desconectado:', reason);
                this.isReady = false;
            });

            await this.client.initialize();
            this.isInitialized = true;

        } catch (error) {
            console.error('❌ Error inicializando WhatsApp Service:', error);
            throw error;
        }
    }

    // Enviar notificación de emergencia
    async enviarNotificacionEmergencia(alerta, operadores) {
        if (!this.isReady) {
            console.warn('⚠️ WhatsApp Service no está listo');
            return false;
        }

        try {
            console.log('📱 Enviando notificaciones de emergencia...');
            
            const mensaje = this.crearMensajeEmergencia(alerta);
            const urlApp = process.env.APP_URL || 'https://web-production-a73f.up.railway.app';
            
            let enviados = 0;
            let fallidos = 0;

            for (const operador of operadores) {
                if (operador.telefono && operador.disponible) {
                    try {
                        const numeroFormateado = this.formatearNumero(operador.telefono);
                        const mensajeCompleto = `${mensaje}\n\n🔗 Abrir aplicación: ${urlApp}`;
                        
                        await this.client.sendMessage(numeroFormateado, mensajeCompleto);
                        console.log(`✅ Notificación enviada a ${operador.nombre} (${operador.telefono})`);
                        enviados++;
                        
                        // Esperar un poco entre mensajes para evitar spam
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                    } catch (error) {
                        console.error(`❌ Error enviando mensaje a ${operador.nombre}:`, error);
                        fallidos++;
                    }
                }
            }

            console.log(`📊 Resumen de notificaciones: ${enviados} enviadas, ${fallidos} fallidas`);
            return { enviados, fallidos };

        } catch (error) {
            console.error('❌ Error enviando notificaciones:', error);
            return false;
        }
    }

    // Crear mensaje de emergencia
    crearMensajeEmergencia(alerta) {
        const emojis = {
            'incendio_estructural': '🔥',
            'incendio_forestal': '🌲',
            'accidente_vehicular': '🚗',
            'rescate': '🆘',
            'fuga_gas': '⛽',
            'otro': '⚠️'
        };

        const prioridades = {
            'baja': '🟢',
            'media': '🟡',
            'alta': '🔴'
        };

        const emoji = emojis[alerta.tipo] || '🚨';
        const prioridadEmoji = prioridades[alerta.prioridad] || '🟡';

        return `🚨 *ALERTA DE EMERGENCIA* 🚨

${emoji} *Tipo:* ${this.capitalizar(alerta.tipo)}
${prioridadEmoji} *Prioridad:* ${this.capitalizar(alerta.prioridad)}
📋 *Título:* ${alerta.titulo}
📍 *Ubicación:* ${alerta.direccion || 'Ver en mapa'}
📝 *Descripción:* ${alerta.descripcion}

👥 *Personas afectadas:* ${alerta.personas_afectadas || 0}
🚨 *Riesgos:* ${alerta.riesgos_especificos || 'No especificados'}

⏰ *Fecha:* ${new Date().toLocaleString('es-AR')}
👤 *Reportado por:* ${alerta.usuario_nombre}

*Se requiere concurrencia inmediata*`;
    }

    // Formatear número de teléfono
    formatearNumero(telefono) {
        // Remover espacios, guiones y paréntesis
        let numero = telefono.replace(/[\s\-\(\)]/g, '');
        
        // Si empieza con 0, removerlo
        if (numero.startsWith('0')) {
            numero = numero.substring(1);
        }
        
        // Si no empieza con 54, agregarlo
        if (!numero.startsWith('54')) {
            numero = '54' + numero;
        }
        
        // Agregar @c.us para WhatsApp
        return numero + '@c.us';
    }

    // Capitalizar primera letra
    capitalizar(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
    }

    // Verificar si el servicio está listo
    isServiceReady() {
        return this.isReady;
    }

    // Desconectar el cliente
    async disconnect() {
        if (this.client) {
            await this.client.destroy();
            this.isReady = false;
            this.isInitialized = false;
            console.log('📱 WhatsApp Service desconectado');
        }
    }
}

// Exportar instancia singleton
export default new WhatsAppService();
