import * as v from 'valibot';
import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import modelUniqueRule from "../../../libraries/validation/model-unique.rule";
import DefaultValidationPipe from "../../../libraries/validation.pipline";
import {UserRepository} from "../../database/repositories/user.repository";
import {emailRegExp, passwordRegExp} from "../../../constants/regexp.constants";

export class RegisterDto {
  @ApiProperty()
  first_name: string;

  @ApiProperty()
  last_name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  password_confirmation: string;
}

@Injectable()
export default class RegisterValidationPipe extends DefaultValidationPipe {
  constructor(
      private readonly userRepository: UserRepository
  ) {
    super();
  }

  /**
   * Return whether parsing should do async.
   *
   * @protected
   */
  protected isAsync = true;

  /**
   * Return schema rules for validation.
   *
   * @protected
   */
  protected rules() {
    return v.pipeAsync(
      v.objectAsync({
        first_name: v.pipe(
          v.string(),
          v.trim(),
          v.minLength(3),
          v.maxLength(50),
        ),
        last_name: v.pipe(
          v.string(),
          v.trim(),
          v.minLength(3),
          v.maxLength(50),
        ),
        email: v.pipeAsync(
          v.string(),
          v.trim(),
          v.toLowerCase(),
          v.regex(emailRegExp),
          v.checkAsync(
              modelUniqueRule('email', this.userRepository),
            (issue) => `Email Must Be Unique: ` + issue.message,
          ),
        ),
        password: v.pipe(
          v.string(),
          v.minLength(12),
          v.maxLength(30),
          v.regex(passwordRegExp),
        ),
        password_confirmation: v.string(),
      }),
      v.forward(
        // @ts-ignore
        v.partialCheck(
          [['password'], ['password_confirmation']],
          (input) => input.password === input.password_confirmation,
        ),
        ['password'],
      ),
    );
  }
}
