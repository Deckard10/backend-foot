import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, IsString, Max, Min } from "class-validator";


export class FilterProductoDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Type(() => Number) // Transforma el string de la URL a número
    @IsNumber()
    idMarca?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    minPrecio?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    maxPrecio?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number;
}