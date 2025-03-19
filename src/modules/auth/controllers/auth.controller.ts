import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { UserDTO } from '../../../dtos/user.dto';
import AuthService from '../services/auth.service';
import { AuthTokenDTO } from '../../../dtos/auth-token.dto';
import { UserRequest } from '../../../typings/user-request.type';
import LoginValidationPipe, { LoginDto } from '../validation/login.pipeline';
import RegisterValidationPipe, { RegisterDto } from '../validation/register.pipeline';
import {AuthTokenRepository} from "../../database/repositories/auth-token.repository";
import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
      private readonly authService: AuthService,
      private readonly authTokenRepository: AuthTokenRepository,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(LoginValidationPipe) data: LoginDto,
  ) {
    const token = await this.authService.authenticate(data);

    return {
      user: new UserDTO(token._user),
      token: new AuthTokenDTO(token)
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(
    @Body(RegisterValidationPipe) data: RegisterDto,
  ) {
    const token = await this.authService.register(data);

    return {
      user: new UserDTO(token._user),
      token: new AuthTokenDTO(token)
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async logout(@Req() request: UserRequest) {
    await this.authTokenRepository.delete({ id: request.user.currentToken?.id });

    return null;
  }
}
