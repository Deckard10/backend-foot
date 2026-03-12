import { Transform } from "class-transformer";
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Role } from "../../common/enum/rol.enum";

export class CreateUserDto {
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @Transform(({ value }) => value?.trim())
    name: string;

    @IsEmail()
    email: string;

    @IsEnum(Role)
    @IsOptional()
    role?: Role;

    @IsString()
    @MinLength(6)
    @MaxLength(20)
    @Transform(({ value }) => value.trim())
    password: string;
}
