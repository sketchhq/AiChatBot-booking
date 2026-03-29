import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { logger } from './logger';

export default class Encryption {
  static encryptValue = (input_data: any) => {
    try {
      let cipher = crypto.createCipheriv(
        process.env.ECY_ALGO,
        process.env.ECY_KEY,
        process.env.ECY_IV,
      );
      let encrypted = cipher.update(input_data, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      return encrypted;
    } catch (error) {
      logger.error('EncryptValue_Error_:' + JSON.stringify(error?.stack || error?.message || error));
      throw new Error(error);
    }

  };
  static decryptValue = (input_data: any) => {
    try {
      let decrypted = null;
      if (input_data) {
        let decipher = crypto.createDecipheriv(
          process.env.ECY_ALGO,
          process.env.ECY_KEY,
          process.env.ECY_IV,
        );
        decrypted = decipher.update(input_data, 'base64', 'utf8');
        decrypted = decrypted + decipher.final('utf8');

      }
      return decrypted;
    } catch (error) {
      logger.error('DecryptValue_Error_:' + JSON.stringify(error?.stack || error?.message || error));
      throw new Error(error);
    }

  };

  static hashPassword(password: string) {
    const hash = bcrypt.hashSync(password, 8);
    return hash;
  }

  static comparePassword(enteredPassword: string, dbPassword: string) {
    const match = bcrypt.compareSync(enteredPassword, dbPassword);
    return match;
  }

  /** 256‑bit hex string (64 chars) */
static generateRawToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/** One‑way SHA‑256 */
static hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}
}
