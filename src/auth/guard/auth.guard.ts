import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { jwtConstants } from '../constants/jwt.constant';
import * as jwt from 'jsonwebtoken';


@Injectable()
export class AuthGuard implements CanActivate {

  async canActivate(context: ExecutionContext): Promise<boolean> {
    
    // El objeto context proporciona información
    // sobre la solicitud entrante y el entorno de ejecución.
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    const jwtSecret = process.env.JWT_SECRET ?? jwtConstants.secret;

    try {
      const payload = jwt.verify(token, jwtSecret);
      request.user = payload;
    } catch (e) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request) {
    return request.cookies?.['access_token'];
    // const [type, token] = request.headers.authorization?.split(" ") ?? [];
    // return type === "Bearer" ? token: undefined;
  } 
}
