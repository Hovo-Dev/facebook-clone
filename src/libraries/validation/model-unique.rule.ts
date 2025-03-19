import { BaseRepository } from '../../modules/database/repositories/base.repository';
import {ObjectLiteral} from "../../typings/shared.type";

export type QueryCallback<T> = (where: Partial<T>) => Partial<T>;

export default <T extends ObjectLiteral>(
    field: keyof T,
    repository: BaseRepository<T>,
    callback?: QueryCallback<T>
) => {
  return async (input) => {
    let whereCondition: Partial<T> = { [field]: input } as Partial<T>;

    // Apply callback modifications if provided
    if (callback) {
      whereCondition = callback(whereCondition);
    }

    // Use Repository to find a record
    const result = await repository.findOne({ where: whereCondition });

    // Returns `true` if no record exists (meaning it's unique)
    return result === null;
  };
};
