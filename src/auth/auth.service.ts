import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) { }

  async login(email: string, password: string) {
    let user;
    try {
      user = await this.usersService.getUserByEmail(email);
    } catch (error: any) {
      if (error.name === 'NotFoundException') {
        throw new UnauthorizedException('E-mail or password incorrect.');
      }
      throw error;
    }

    if (!user) {
      throw new UnauthorizedException('E-mail or password incorrect.');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Email or password incorrects.');
    }

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
