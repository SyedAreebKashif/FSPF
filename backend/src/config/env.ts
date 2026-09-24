import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file based on NODE_ENV if needed
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 65535, {
      message: 'PORT must be a valid port number between 1 and 65535',
    }),
  MONGO_URI: z
    .string()
    .min(1, 'MONGO_URI is required')
    .default('mongodb://127.0.0.1:27017/portfolio_db'),
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET must be at least 16 characters long')
    .default('super_secret_jwt_key_must_be_at_least_32_characters_long_for_security'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('*'),
  BCRYPT_SALT_ROUNDS: z
    .string()
    .default('10')
    .transform((val) => parseInt(val, 10)),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error('Environment configuration validation failed');
  }

  return result.data;
};

export const env = parseEnv();
export type EnvConfig = z.infer<typeof envSchema>;
