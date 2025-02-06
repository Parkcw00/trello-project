import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) { }

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).send('Unauthorized');
    }

    try {
      const decoded = this.jwtService.verify(token);
      req['user'] = decoded;
      next();
    } catch (err) {
      return res.status(401).send('Unauthorized');
    }
  }
}