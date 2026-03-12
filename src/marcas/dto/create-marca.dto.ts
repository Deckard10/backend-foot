import { IsString, MinLength } from 'class-validator';

export class CreateMarcaDto {
	@IsString()
	@MinLength(1)
	nombreMarca: string;
}
