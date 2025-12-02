import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'english_dictionary'
  },
  externalApis: {
    pexelsApiKey: process.env.PEXELS_API_KEY || '',
    libreTranslateUrl:
      process.env.LIBRETRANSLATE_URL || 'https://libretranslate.de'
  }
};
