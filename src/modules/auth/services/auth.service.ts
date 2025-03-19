import { v4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { now } from '../../../libraries/time';
import authConfig from '../../../config/auth';
import { LoginDto } from '../validation/login.pipeline';
import { RegisterDto } from '../validation/register.pipeline';
import { HashService } from '../../../libraries/hash.service';
import {UserInterface} from "../../database/interfaces/user.interface";
import {UserRepository} from "../../database/repositories/user.repository";
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {AuthTokenInterface} from "../../database/interfaces/auth-token.interface";
import {AuthTokenRepository} from "../../database/repositories/auth-token.repository";

@Injectable()
export default class AuthService {
  private readonly hashService: HashService;

  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {
    this.hashService = new HashService();
  }

  /**
   * Authenticate users with given credentials.
   *
   * @param email
   * @param password
   */
  public async authenticate({ email, password }: LoginDto) {
    // Validate users.
    // If users not found in db, then throw an exception.
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Validate password.
    await this.validatePassword(password, user.password);

    // After all checks, users have to be fine.
    return this.createJwtTokenForUser(user);
  }

  /**
   * Register new users and return auth credentials to it.
   *
   * @param data
   */
  public async register(data: RegisterDto) {
    const hashedPassword = await this.hashService.hash(data.password)

    const user = await this.userRepository.insert({ email: data.email, password: hashedPassword, first_name: data.first_name, last_name: data.last_name });

    // After all checks, users have to be fine.
    return this.createJwtTokenForUser(user);
  }

  /**
   * Validate users password
   *
   * @param password
   * @param userPassword
   */
  public async validatePassword(
    password: string,
    userPassword: string,
  ): Promise<void> {
    const isMatch = await this.hashService.verify(password, userPassword);
    if (!isMatch) {
      throw new UnauthorizedException("Incorrect Password");
    }
  }

  /**
   * Create token for a given id.
   *
   * @param user
   */
  public async createJwtTokenForUser(user: UserInterface): Promise<AuthTokenInterface> {
    // Generate jti.
    const jti = v4();

    // Generate payload for a token.
    const payload = {
      user_id: user.id,
      email: user.email,
      jti,
    };

    // Generate token itself
    const bearer = await this.jwtService.signAsync(payload);

    // Create token in database.
    const token = await this.authTokenRepository.insert({
      id: jti,
      user_id: user.id,
      expires_at: now().add(this.config.token_lifetime, 'days').toDate(),
    });

    // Set bearer token into token.
    token.bearer = bearer;

    // Set current users model as connected.
    token._user = user;

    return token;
  }
}
