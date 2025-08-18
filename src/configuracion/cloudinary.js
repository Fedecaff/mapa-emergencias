import cloudinary from 'cloudinary';

// Configuración de Cloudinary
console.log('☁️ Configurando Cloudinary...');
console.log('📋 Variables de entorno:');
console.log('- CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('- CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '***' : 'NO DEFINIDA');
console.log('- CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '***' : 'NO DEFINIDA');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dkfze9m4v',
    api_key: process.env.CLOUDINARY_API_KEY || '371543887124647',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'JwS5JzJ8SNGeBjHKLvfVANYOKuA'
});

console.log('✅ Cloudinary configurado con cloud_name:', cloudinary.config().cloud_name);

export default cloudinary;
