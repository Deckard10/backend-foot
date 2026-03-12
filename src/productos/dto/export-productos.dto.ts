import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ExportProductoItemDto {
  @Type(() => Number)
  @IsNumber()
  idProducto: number;

  @IsString()
  nombreProducto: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  precioVenta: number;

  @IsString()
  marcaNombre: string;

  @IsString()
  modeloNombre: string;

  @IsString()
  colorNombre: string;

  @IsString()
  tallaNombre: string;
}

export class ExportProductosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExportProductoItemDto)
  productos: ExportProductoItemDto[];
}
