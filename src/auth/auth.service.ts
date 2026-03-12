import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }


    async register( { name, email, password, role}: RegisterDto ) {

        const user = await this.usersService.findOneEmail(email);

        if (user) {
            throw new BadRequestException("El email ya está registrado");
        }

        await this.usersService.create({
            name,
            email,
            role,
            password,
        });

        return {
            message: "User created successfully"
        };
    }

    async login( {email, password}: LoginDto, res: Response ) {
        const user = await this.usersService.findByEmailWithPassword(email);

        if (!user) {
            throw new UnauthorizedException("Credenciales inválidas");
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException("Credenciales inválidas");
        }

        const payload = { email: user.email, role: user.role };

        const token = await this.jwtService.signAsync(payload);

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 3600000,
            path: '/',
        })

        return {
            message: "Login exitoso"
        }

        // return {
        //     message: "Login successfully",
        //     token: token,
        //     email: user.email
        // };
    }

    async profile({email, role} : {email: string, role: string}) {
        // if (role !== 'admin') {
        //     throw new UnauthorizedException("No tienes permisos para acceder a esta información");
        // }
        return await this.usersService.findOneEmail(email);
    }



}
