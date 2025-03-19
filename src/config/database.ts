import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  return {
    connection: process.env.DB_CONNECTION || 'postgres',
    connections: {
      postgres: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'app_db',
      },
      testing: {
        host: '127.0.0.1',
        port: 5432,
        user: 'test_user',
        password: 'test_password',
        database: 'test_db',
      },
    },
  };
});
