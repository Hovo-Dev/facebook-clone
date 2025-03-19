import { registerAs } from '@nestjs/config';

export default registerAs('hashing', () => ({
  // Current project driver
  secret: Buffer.from(String(process.env.APP_KEY)),
}));
