# 📧 Configuración de Email para Verificación

## Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env`:

```env
# Configuración de Email (Gmail)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion
```

## Configuración de Gmail

### Paso 1: Activar Verificación en Dos Pasos
1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Seguridad > Verificación en dos pasos
3. Activa la verificación en dos pasoso 

### Paso 2: Generar Contraseña de Aplicación
1. Seguridad > Contraseñas de aplicación
2. Selecciona "Otra (nombre personalizado)"
3. Nombre: "Mapa de Emergencias"
4. Copia la contraseña generada (16 caracteres)

### Paso 3: Configurar Variables
- `EMAIL_USER`: Tu email de Gmail completo
- `EMAIL_PASSWORD`: La contraseña de aplicación generada (NO tu contraseña normal)

## Ejemplo de Configuración

```env
EMAIL_USER=federico.gomez.sc@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

## Notas Importantes

⚠️ **NUNCA uses tu contraseña normal de Gmail**
⚠️ **La contraseña de aplicación es de 16 caracteres con espacios**
⚠️ **Mantén estas credenciales seguras**

## Probar Configuración

Una vez configurado, el sistema:
1. Enviará códigos de verificación de 6 dígitos
2. Los códigos expiran en 10 minutos
3. Solo se puede usar cada código una vez
4. Se pueden reenviar códigos si es necesario
