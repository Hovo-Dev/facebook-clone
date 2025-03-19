import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import {AuthTokenRepository} from "../../database/repositories/auth-token.repository";
import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authTokenRepository: AuthTokenRepository,
  ) {}

  /**
   * Determine that token is valid.
   *
   * @param context
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    // If token not found, then throw exception.
    if (!token) {
      throw new UnauthorizedException();
    }

    // Try to fetch users by given token.
    try {
      // Verify token.
      const payload = await this.jwtService.verifyAsync(token);

      // Fetch token model after token decoding.
      const tokenModel = await this.authTokenRepository.findOne({
        where: {
          id: payload.jti,
        },
        relations: {
          user_id: true,
        }
      });
      if (!tokenModel) {
        throw new UnauthorizedException(undefined, {
          cause: AuthGuard.name,
        });
      }

      // Get users.
      const user = tokenModel._user

      // Set current token.
      user.currentToken = tokenModel

      // Set users into request.
      request['user'] = user;
    } catch {
      throw new UnauthorizedException(undefined, {
        cause: AuthGuard.name,
      });
    }

    return true;
  }

  /**
   * Extract token from header.
   *
   * @param request
   * @private
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
