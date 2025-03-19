import * as argon2 from 'argon2';
import hashingConfig from '../config/hashing';
import { ConfigService } from '@nestjs/config';

export class HashService {
  /**
   * Config service for service operations.
   *
   * @protected
   */
  protected configService: ConfigService;

  /**
   * Class constructor.
   */
  constructor() {
    this.configService = new ConfigService(hashingConfig());
  }

  /**
   * Hash given string.
   *
   * @param raw
   */
  public async hash(raw: string) {
    return argon2.hash(raw, this.getValidConfig());
  }

  /**
   * Verify given strings to be encoded by same way.
   *
   * @param raw
   * @param encoded
   */
  public async verify(raw: string, encoded: string) {
      return argon2.verify(encoded, raw, {
        secret: this.getValidConfig().secret,
      });
  }

  /**
   * Fetch valid config from config service.
   *
   * @private
   */
  private getValidConfig() {
    return {
      secret: this.configService.get<Buffer>('secret'),
    };
  }
}
