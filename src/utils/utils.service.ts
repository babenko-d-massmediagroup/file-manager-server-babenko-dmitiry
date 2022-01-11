import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';

@Injectable()
export class UtilsService {
  hashPayload(payload: string): string {
    return createHmac('sha256', process.env.SECRET)
      .update(payload)
      .digest('hex');
  }

  comparePasswords(password: string, encryptedPassword: string): boolean {
    return this.hashPayload(password) === encryptedPassword;
  }
}
