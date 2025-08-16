# 🚀 Guía de Despliegue - Mapa de Emergencias

## 📋 Requisitos Previos

- Cuenta en [GitHub](https://github.com)
- Cuenta en [Netlify](https://netlify.com)
- Cuenta en [Railway](https://railway.app) o [Heroku](https://heroku.com) para el backend

## 🎯 Pasos para el Despliegue

### 1. Preparar el Repositorio

```bash
# Asegúrate de que todos los cambios estén commitados
git add .
git commit -m "Preparar para despliegue en Netlify"
git push origin main
```

### 2. Desplegar Backend (Railway/Heroku)

#### Opción A: Railway (Recomendado)
1. Ve a [railway.app](https://railway.app)
2. Conecta tu repositorio de GitHub
3. Selecciona el proyecto
4. Configura las variables de entorno:
   - `NODE_ENV=production`
   - `PUERTO=3000`
5. Railway detectará automáticamente que es una app Node.js

#### Opción B: Heroku
1. Ve a [heroku.com](https://heroku.com)
2. Crea una nueva app
3. Conecta tu repositorio
4. Configura las variables de entorno

### 3. Desplegar Frontend en Netlify

1. Ve a [netlify.com](https://netlify.com)
2. Haz clic en "New site from Git"
3. Selecciona tu repositorio de GitHub
4. Configura el build:
   - **Build command**: `npm run build`
   - **Publish directory**: `public`
5. Haz clic en "Deploy site"

### 4. Configurar Variables de Entorno

En Netlify, ve a **Site settings > Environment variables** y agrega:

```
API_URL=https://tu-backend-url.com/api
```

### 5. Actualizar Configuración

Una vez que tengas la URL del backend, actualiza:

1. **`public/js/config.js`**: Cambia `tu-backend-url.com` por tu URL real
2. **`netlify.toml`**: Actualiza la URL del backend
3. **`public/_redirects`**: Actualiza la URL del backend

### 6. Configurar Dominio Personalizado (Opcional)

1. Ve a **Domain settings** en Netlify
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

## 🔧 Configuración de Producción

### Variables de Entorno del Backend

```env
NODE_ENV=production
PUERTO=3000
JWT_SECRET=tu-secret-super-seguro
```

### Variables de Entorno del Frontend

```env
API_URL=https://tu-backend-url.com/api
```

## 📱 URLs de Acceso

- **Frontend**: `https://tu-app.netlify.app`
- **Backend**: `https://tu-backend-url.com`

## 🔍 Verificación

1. ✅ El frontend carga correctamente
2. ✅ El login funciona
3. ✅ Los puntos se cargan en el mapa
4. ✅ Se pueden crear/editar puntos (admin)
5. ✅ Se pueden crear usuarios (admin)

## 🛠️ Solución de Problemas

### Error de CORS
- Verifica que el backend tenga configurado CORS correctamente
- Asegúrate de que la URL del frontend esté en la lista de orígenes permitidos

### Error de API
- Verifica que la URL del backend sea correcta
- Revisa los logs del backend para errores

### Error de Build
- Verifica que el comando de build sea correcto
- Revisa los logs de Netlify para errores específicos

## 📞 Soporte

Si tienes problemas, revisa:
1. Los logs de Netlify
2. Los logs del backend
3. La consola del navegador
4. La pestaña Network en las herramientas de desarrollador
