import { Injectable } from '@nestjs/common';
import { IPasswordHasher } from '../../application/services/password-hasher.interface';
import * as argon2 from 'argon2';

@Injectable()
export class Argon2HasherService implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}
