import { IsString, MinLength } from 'class-validator';

export class CreateModeloDto {
	@IsString()
	@MinLength(1)
	nombreModelo: string;
}
