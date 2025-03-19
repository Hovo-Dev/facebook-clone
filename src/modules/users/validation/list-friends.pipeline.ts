import * as v from 'valibot';
import { Injectable } from '@nestjs/common';
import DefaultValidationPipe from '../../../libraries/validation.pipline';
import paginationValidator from '../../../libraries/pagination/pagination.validator';

@Injectable()
export default class ListFriendsValidationPipe extends DefaultValidationPipe {
  constructor() {
    super();
  }

  /**
   * Return schema rules for validation.
   *
   * @protected
   */
  protected rules() {
    return v.object({
      ...paginationValidator(this),
    });
  }
}
