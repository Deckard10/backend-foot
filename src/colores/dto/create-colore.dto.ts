import { IsString, MinLength } from 'class-validator';

export class CreateColoreDto {
	@IsString()
	@MinLength(1)
	nombreColor: string;
}
