import * as v from 'valibot';

export default (self: any) => {
  return {
    page: v.optional(
      v.pipe(
        v.string(),
        v.transform((input) => Number(input)),
        v.number(),
      ),
    ),
    limit: v.optional(
      v.pipe(
        v.string(),
        v.transform((input) => Number(input)),
        v.maxValue(100),
      ),
    ),
  };
};
