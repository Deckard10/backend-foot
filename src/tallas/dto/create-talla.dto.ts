import { IsString, MinLength } from 'class-validator';

export class CreateTallaDto {
	@IsString()
	@MinLength(1)
	nombreTalla: string;
}
