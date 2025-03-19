import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { ObjectLiteral } from "../../../typings/shared.type";

export type Relation<T> = {
    table: string;        // Related table
    foreignKey: keyof T;  // Foreign key in current table
    targetKey: string;    // Target primary key in related table
    alias?: string;       // Alias for the joined table
};

interface FindOptions<T> {
    where?: Partial<Record<keyof T, any>> | Array<Partial<Record<keyof T, any>>>;
    relations?: { [K in keyof T]?: boolean };
    order?: { [K in keyof T]: 'ASC' | 'DESC' };
    page?: number;
    limit?: number;
    skip?: number;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

@Injectable()
export abstract class BaseRepository<T extends ObjectLiteral> {
    constructor(
        protected readonly dbService: DatabaseService,
        public readonly tableName: string,
        private readonly definedRelations: Relation<T>[] = [] // Default relations for entity
    ) {}

    /**
     * Find one record with optional conditions and relations.
     *
     * @param options - The find options (where conditions & relations).
     */
    async findOne(options: FindOptions<T> = {}): Promise<T | null> {
        const sql = await this.buildSelectQuery(options);
        const values = Object.values(options.where || {});

        const result = await this.dbService.query(sql, values);
        const nestedResult = this.nestRelatedEntities(result, options.relations);

        return nestedResult.length ? nestedResult[0] : result.length ? result[0] : null;
    }

    /**
     * Find multiple records with optional conditions and relations.
     *
     * @param options - The find options (where conditions & relations).
     */
    async find(options: FindOptions<T> = {}): Promise<T[]> {
        const sql = await this.buildSelectQuery(options);
        const values = Array.isArray(options.where) ? options.where.map(obj => Object.values(obj)[0]) : Object.values(options.where || {});

        const result = await this.dbService.query(sql, values);
        const nestedResult = this.nestRelatedEntities(result, options.relations);

        return nestedResult.length ? nestedResult : result;
    }

    /**
     * Counts the number of records in the table that match the specified conditions.
     * @param where - An optional object representing the WHERE conditions for filtering records.
     *                The keys are column names, and the values are the values to match.
     *                For string values, case-insensitive search is performed using the ILIKE operator.
     * @returns The count of records that match the specified conditions.
     */
    async count(where?: Record<string, any> | Array<Record<string, any>>): Promise<number> {
        // Initialize an array to hold the WHERE clause conditions
        const whereConditions: string[] = [];
        // Initialize an array to hold the parameter values for the query
        const values: any[] = [];

        // If a 'where' object or array is provided, construct the WHERE clause
        if (where && Object.values(where).length > 0) {
            const whereArray = Array.isArray(where) ? where : [where];

            whereArray.forEach((conditionGroup) => {
                const conditions = Object.keys(conditionGroup).map((key) => {
                    const value = conditionGroup[key];
                    const paramIndex = values.length + 1;

                    if (typeof value === 'object' && value !== null) {
                        if ('not' in value) {
                            // Handle NOT EQUAL condition
                            values.push(value.not);
                            return `${key} <> $${paramIndex}`;
                        }
                        // Add more conditions as needed (e.g., greater than, less than)
                    } else if (typeof value === 'string' && value.includes('%')) {
                        // Use ILIKE for string values containing '%'
                        values.push(value);
                        return `${key} ILIKE $${paramIndex}`;
                    } else {
                        // Use exact match for other values
                        values.push(value);
                        return `${key} = $${paramIndex}`;
                    }
                }).join(' AND ');

                whereConditions.push(`(${conditions})`);
            });
        }

        // Construct the WHERE clause by joining individual conditions with 'OR'
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' OR ')}` : '';

        // Construct the final SQL query
        const query = `SELECT COUNT(*) FROM ${this.tableName} ${whereClause}`;

        // Execute the query using the connection pool
        const result = await this.dbService.query(query, values);

        // Return the count as a number
        return parseInt(result[0].count, 10);
    }

    /**
     * Find multiple records with pagination.
     *
     * @param options - The find options (where conditions, relations, limit, offset & order).
     **/
    async findPaginated(options: FindOptions<T>): Promise<PaginatedResult<T>> {
        let { page, limit, order } = options;
        if (!page) page = 1;
        if (!limit) limit = 10;

        const skip = (Number(page) - 1) * (Number(limit));

        // Retrieve data using the existing find method
        const data = await this.find({
            where: options?.where || {},
            relations: options?.relations || {},
            limit: Number(limit),
            order,
            skip,
        });

        // Retrieve total count using the existing count method
        const total = await this.count(options.where);

        return {
            data,
            total,
            page: page || 1,
            limit: limit || 10,
        };
    }

    /**
     * Insert a new record.
     *
     * @param data - The data to insert.
     */
    async insert(data: Partial<T>): Promise<T> {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const columns = keys.join(', ');
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');

        const sql = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
        const result = await this.dbService.query(sql, values);

        return result[0];
    }

    /**
     * Update records matching the condition.
     *
     * @param condition - The condition object.
     * @param data - The new data to update.
     */
    async update(condition: Partial<T>, data: Partial<T>): Promise<void> {
        const conditionKeys = Object.keys(condition);
        const conditionValues = Object.values(condition);
        const dataKeys = Object.keys(data);
        const dataValues = Object.values(data);

        const setClause = dataKeys.map((key, index) => `${key} = $${index + 1}`).join(', ');
        const whereClause = conditionKeys.map((key, index) => `${key} = $${index + dataKeys.length + 1}`).join(' AND ');

        const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE ${whereClause}`;
        await this.dbService.query(sql, [...dataValues, ...conditionValues]);
    }

    /**
     * Delete records matching the condition.
     *
     * @param condition - The condition object.
     */
    async delete(condition: Partial<T>): Promise<void> {
        const keys = Object.keys(condition);
        const values = Object.values(condition);
        const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');

        const sql = `DELETE FROM ${this.tableName} WHERE ${whereClause}`;
        await this.dbService.query(sql, values);
    }

    /**
     * Build the SELECT query with WHERE conditions and JOINs.
     *
     * @param options - The find options (where conditions & relations).
     */
    private async buildSelectQuery(options: FindOptions<T>): Promise<string> {
        // 1. Construct the WHERE clause
        let whereConditions = '';

        if (options.where && Object.values(options.where).length > 0) {
            const whereArray = Array.isArray(options.where) ? options.where : [options.where];

            whereConditions = whereArray.map((conditionGroup, groupIndex) => {
                const conditions = Object.keys(conditionGroup).map((key, index) => {
                    const value = conditionGroup[key as keyof T];
                    const paramIndex = groupIndex * Object.keys(conditionGroup).length + index + 1;

                    if (typeof value === 'object' && value !== null) {
                        if ('not' in value) {
                            // Handle NOT EQUAL condition
                            return `${this.tableName}.${key} <> $${paramIndex}`;
                        }
                        // Add more conditions as needed (e.g., greater than, less than)
                    } else if (typeof value === 'string' && value.includes('%')) {
                        // Use ILIKE for string values containing '%'
                        return `${this.tableName}.${key} ILIKE $${paramIndex}`;
                    } else {
                        // Use exact match for other values
                        return `${this.tableName}.${key} = $${paramIndex}`;
                    }
                }).join(' AND ');

                return `(${conditions})`;
            }).join(' OR ');
        }

        const whereClause = whereConditions ? `WHERE ${whereConditions}` : '';

        // 2. Retrieve column names for the base table and related tables
        const baseTableColumns = await this.getColumnNames(this.tableName);
        const baseTableAlias = this.tableName;
        const baseTableSelect = baseTableColumns
          .map(column => `${baseTableAlias}.${column} AS "${baseTableAlias}_${column}"`)
          .join(', ');

        const relationSelects = await Promise.all(
          this.definedRelations
            .filter(relation => options.relations?.[relation.foreignKey as keyof T])
            .map(async relation => {
                const relationAlias = relation.alias || relation.table;
                const columns = await this.getColumnNames(relation.table);
                return columns
                  .map(column => `${relationAlias}.${column} AS "${relationAlias}_${column}"`)
                  .join(', ');
            })
        );

        const selectClause = [baseTableSelect, ...relationSelects].filter(Boolean).join(', ');

        // 3. Build the FROM and JOIN clauses
        let sql = `SELECT ${selectClause} FROM ${this.tableName}`;
        if (options.relations) {
            sql += this.buildJoinClause(options.relations);
        }

        // 4. Append the WHERE clause
        sql += ` ${whereClause}`;

        // 5. Append ORDER BY clause if provided
        if (options.order) {
            const orderClauses = Object.entries(options.order).map(([column, direction]) => {
                const dir = direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
                return `${this.tableName}.${column} ${dir}`;
            });
            sql += ` ORDER BY ${orderClauses.join(', ')}`;
        }

        // 6. Append LIMIT and OFFSET clauses for pagination
        if (options.limit !== undefined) {
            sql += ` LIMIT ${options.limit}`;
        }
        if (options.skip !== undefined) {
            sql += ` OFFSET ${options.skip}`;
        }

        return sql;
    }

    /**
     * Retrieve column names for a given table.
     *
     * @param tableName - The name of the table.
     */
    private async getColumnNames(tableName: string): Promise<string[]> {
        const sql = `
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = $1
            ORDER BY ordinal_position;
        `;

        const result = await this.dbService.query(sql, [tableName]);
        return result.map((row: any) => row.column_name);
    }

    /**
     * Build SQL JOIN clause dynamically based on requested relations.
     *
     * @param requestedRelations - Relations requested by the user.
     */
    private buildJoinClause(requestedRelations: { [K in keyof T]?: boolean }): string {
        return this.definedRelations
          .filter(relation => requestedRelations[relation.foreignKey as keyof T])
          .map(relation =>
            ` LEFT JOIN ${relation.table} AS ${relation.alias || relation.table}
          ON ${this.tableName}.${relation.foreignKey as string} = ${relation.alias || relation.table}.${relation.targetKey}`
          )
          .join(' ');
    }

    /**
     * Nest related entities within the main entity based on defined relations.
     *
     * @param rows - The rows returned from the database query.
     * @param requestedRelations - The relations requested by the user.
     * @returns An array of entities with nested related entities.
     */
    private nestRelatedEntities(rows: any[], requestedRelations?: { [K in keyof T]?: boolean }): T[] {
        const entitiesMap = new Map<any, T>();

        rows.forEach(row => {
            // Extract main entity data
            const entityId = row[`${this.tableName}_id`]; // Assuming 'id' is the primary key
            if (!entitiesMap.has(entityId)) {
                const mainEntityData = this.extractEntityData(row, this.tableName);
                entitiesMap.set(entityId, mainEntityData);
            }

            const mainEntity = entitiesMap.get(entityId);

            // Ensure mainEntity is defined before proceeding
            if (mainEntity) {
                // Extract related entities data based on requested relations
                this.definedRelations.forEach(relation => {
                    const relationAlias = relation.alias || relation.table;
                    if (requestedRelations?.[relation.foreignKey as keyof T]) {
                        const relatedEntityData = this.extractEntityData(row, relationAlias);

                        if (relatedEntityData && Object.values(relatedEntityData).some(value => value !== null)) {
                            // @ts-ignore
                            mainEntity[relationAlias] = relatedEntityData;
                        }
                    }
                });
            }
        });

        return Array.from(entitiesMap.values());
    }

    /**
     * Extracts data for a specific entity from a row based on the table alias.
     *
     * @param row - The row returned from the database query.
     * @param alias - The alias of the table/entity.
     * @returns An object representing the entity data.
     */
    private extractEntityData(row: any, alias: string): any {
        const entityData: any = {};

        Object.keys(row).forEach(column => {
            if (column.startsWith(`${alias}_`)) {
                const propertyName = column.replace(`${alias}_`, '');
                entityData[propertyName] = row[column];
            }
        });

        return entityData;
    }
}
