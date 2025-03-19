import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { Injectable, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
    private pool: Pool;

    constructor(
      private configService: ConfigService,
    ) {
        const dbConfig = this.getDatabaseConfig();

        this.pool = new Pool({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
        });
    }

    private getDatabaseConfig() {
        const environment = process.env.NODE_ENV === 'test' ? 'testing' : 'postgres';
        return this.configService.get(`database.connections.${environment}`);
    }

    async query(sql: string, params?: any[]) {
        const client = await this.pool.connect();

        try {
            const result = await client.query(sql, params);
            return result.rows;
        } catch (err) {
            console.error({ message: err })
        } finally {
            client.release();
        }
    }

    onModuleDestroy() {
        this.pool.end();
    }
}
