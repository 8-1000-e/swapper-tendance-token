import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export const WSOL_MINT = 'So11111111111111111111111111111111111111112';
export const JUPITER_ULTRA_URL = 'https://api.jup.ag/ultra/v1';
export const JUPITER_API_KEY = process.env.JUPITER_API_KEY || '';
