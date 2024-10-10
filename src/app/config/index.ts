import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(process.cwd(), '.env'),
});

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  backend_api: process.env.BACKEND_API,
  frontend_url: process.env.FRONTEND_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  admin_name: process.env.ADMIN_NAME,
  admin_email: process.env.ADMIN_EMAIL,
  admin_password: process.env.ADMIN_PASSWORD,
  admin_profile_picture: process.env.ADMIN_PROFILE_PICTURE,
  admin_cover_picture: process.env.ADMIN_COVER_PICTURE,
  admin_mobile_number: process.env.ADMIN_MOBILE_NUMBER,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  sender_email: process.env.SENDER_EMAIL,
  sender_app_password: process.env.SENDER_APP_PASS,
  aamarpay_store_id: process.env.AAMARPAY_STORE_ID,
  aamarpay_signature_id: process.env.AAMARPAY_SIGNATURE_ID,
  aamarpay_url: process.env.AAMARPAY_URL,
  aamarpay_verify_url: process.env.AAMARPAY_VERIFY_URL,
  // meilisearch_host: process.env.MEILISEARCH_HOST,
  // meilisearch_master_key: process.env.MEILISEARCH_MASTER_KEY,
};
