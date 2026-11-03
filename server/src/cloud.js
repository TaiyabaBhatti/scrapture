import { v2 as cloudinary } from 'cloudinary';

export const cloudReady = () =>
  Boolean(process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET));

let configured = false;
export async function uploadImage(dataUrl) {
  if (!cloudReady()) throw new Error('Image storage is not set up yet (Cloudinary keys missing)');
  if (!configured) {
    if (!process.env.CLOUDINARY_URL) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
    }
    configured = true;
  }
  const r = await cloudinary.uploader.upload(dataUrl, { folder: 'scrapture', resource_type: 'image' });
  return r.secure_url;
}
