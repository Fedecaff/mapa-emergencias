import cloudinary from 'cloudinary';

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dkfze9m4v',
    api_key: process.env.CLOUDINARY_API_KEY || '371543887124647',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'JwS5JzJ8SNGeBjHKLvfVANYOKuA'
});

export default cloudinary;
