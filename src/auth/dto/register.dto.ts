import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "../../common/enum/rol.enum";

export class RegisterDto {

    @IsString()
    @MinLength(1)
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    @Transform(({ value }) => value.trim())
    password: string;

    @IsEnum(Role)
    role?: Role

    @IsBoolean()
    @IsOptional() // Permite que el campo no venga en la petición
    enabled?: boolean;

}