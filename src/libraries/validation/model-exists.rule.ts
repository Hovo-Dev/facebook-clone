import {ObjectLiteral} from "../../typings/shared.type";
import { BaseRepository } from '../../modules/database/repositories/base.repository';

export type QueryCallback<T> = (where: Partial<T>) => Partial<T>;

export default <T extends ObjectLiteral>(
    field: keyof T,
    repository: BaseRepository<T>,
    callback?: QueryCallback<T>
) => {
  return async (input) => {
    let whereCondition: Partial<T> = { [field]: Array.isArray(input) ? { $in: input } : input } as Partial<T>;

    // Apply callback modifications if provided
    if (callback) {
      whereCondition = callback(whereCondition);
    }

    // Use BaseRepository to find records
    const result = await repository.find({ where: whereCondition });

    // Ensures all exist
    return result?.length === (Array.isArray(input) ? input.length : 1);
  };
};
