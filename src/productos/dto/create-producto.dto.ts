import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateProductoDto {
	@IsString()
	@MinLength(1)
	nombreProducto: string;

	@IsNumber()
	idMarca: number;

	@IsNumber()
	idModelo: number;

	@IsNumber()
	idColor: number;

	@IsNumber()
	idTalla: number;

	@IsOptional()
	@IsString()
	imagen?: string;

	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0)
	precioVenta: number;
}
