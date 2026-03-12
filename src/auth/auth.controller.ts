import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { Role } from '../common/enum/rol.enum';
import { Auth } from './decorators/auth.decorator';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import type { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) { }


    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        console.log(registerDto)
        return this.authService.register(registerDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response
    ) {
        return this.authService.login(loginDto, res);
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token');
        return {
            message: 'Sesión cerrada correctamente'
        }
    }


    // @Get('profile')
    // @Roles(Role.ADMIN)
    // @UseGuards(AuthGuard, RolesGuard)
    // getProfile(
    //     @Req() req: RequestWithUser
    // ) {
    //     return this.authService.profile(req.user);
    // }

    @ApiBearerAuth()
    @Get('profile')
    @Auth(Role.ADMIN, Role.GESTOR, Role.CONSULTOR)
    getProfile(@ActiveUser() user: UserActiveInterface) {
        // console.log(user)
        return this.authService.profile(user);
    }


}
