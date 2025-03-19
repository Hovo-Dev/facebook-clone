import { HttpException, HttpStatus } from '@nestjs/common';
import {pickKeys} from "../helpers/object.helper";
import { BaseSchema, BaseSchemaAsync, PipeItem, PipeItemAsync } from 'valibot';
import {ObjectLiteral} from "../typings/shared.type";

type PathItem = {
  type: string;
  origin: 'key' | 'value';
  input: unknown;
  key?: unknown;
  value: unknown;
};

export type BaseIssue = {
  // Required info
  kind: 'schema' | 'validation' | 'transformation';
  type: string;
  input?: unknown;
  expected?: string | null;
  received?: string;
  message: string;

  // Optional info
  requirement?: unknown;
  path?: PathItem[];
  issues?: any[];
  lang?: string;
  abortEarly?: boolean;
  abortPipeEarly?: boolean;
  skipPipe?: boolean;
  attribute?: string;
  field?: string;
};

export type SchemaPipeAsync = [
  BaseSchema<unknown, unknown, any> | BaseSchemaAsync<unknown, unknown, any>,
  ...(PipeItem<any, unknown, any> | PipeItemAsync<any, unknown, any>)[],
];

export type SchemaPipe = [
  BaseSchema<unknown, unknown, any>,
  ...PipeItem<any, unknown, any>[],
];

export default class ValidationException extends HttpException {
  /**
   * Validation errors array.
   *
   * @private
   */
  private errors: BaseIssue[];

  constructor() {
    super('Unprocessable entity.', HttpStatus.UNPROCESSABLE_ENTITY);
  }

  /**
   * Set validation errors.
   *
   * @param errors
   */
  public withErrors(errors: BaseIssue[]) {
    this.errors = errors;

    return this;
  }

  /**
   * Return validation errors.
   */
  public getErrors(): BaseIssue[] {
    return this.errors;
  }

  /**
   * Render exception errors into flexible format.
   */
  public renderErrors() {
    let result: ObjectLiteral[] = [];

    for (let error of this.errors) {
      result.push(
          pickKeys(error, [
            'kind',
            'type',
            'message',
            'field',
            'attribute',
            'requirement',
            'input',
          ])
      );
    }

    return result;
  }
}
