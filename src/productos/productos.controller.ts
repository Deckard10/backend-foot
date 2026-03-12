import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { FilterProductoDto } from './dto/filter-producto.dto';
import { ExportProductosDto } from './dto/export-productos.dto';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfService } from './pdf/pdf.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enum/rol.enum';

@Auth(Role.ADMIN, Role.GESTOR)
@Controller('productos')
export class ProductosController {
  constructor(
    private readonly productosService: ProductosService,
    private readonly pdfService: PdfService
  ) { }

  @Post()
  create(@Body() createProductoDto: CreateProductoDto) {
    return this.productosService.create(createProductoDto);
  }

  @Get()
  @Auth(Role.ADMIN, Role.GESTOR, Role.CONSULTOR)
  findAll(@Query() filtroDto: FilterProductoDto) {
    return this.productosService.findAll(filtroDto);
  }

  @Get('exportar')
  async exportarExcel(
    @Res() res: Response,
    @Query() filterDto: FilterProductoDto
  ) {
    const productos = await this.productosService.findAll(filterDto);
    const buffer = await this.productosService.generarExcel(
      productos.map((producto) => ({
        idProducto: producto.idProducto,
        nombreProducto: producto.nombreProducto,
        precioVenta: producto.precioVenta,
        marcaNombre: producto.marca?.nombreMarca ?? 'N/A',
        modeloNombre: producto.modelo?.nombreModelo ?? 'N/A',
        colorNombre: producto.color?.nombreColor ?? 'N/A',
        tallaNombre: producto.talla?.nombreTalla ?? 'N/A',
      })),
    );

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=productos.xlsx',
    });
    res.send(buffer);
  }

  @Post('exportar')
  async exportarExcelFiltrado(
    @Body() body: ExportProductosDto,
    @Res() res: Response,
  ) {
    const buffer = await this.productosService.generarExcel(body.productos);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=productos.xlsx',
    });
    res.send(buffer);
  }

  @Get(':id')
  @Auth(Role.ADMIN, Role.GESTOR, Role.CONSULTOR)
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto) {
    return this.productosService.update(+id, updateProductoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosService.remove(+id);
  }

  @Post('cargar-excel')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(xlsx|xls)$/)) {
        return callback(new BadRequestException('Solo se permite archivos Excel'), false);
      }
      callback(null, true);
    }
  }))
  async cargarExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se ha proporcionado un archivo.');

    return await this.productosService.cargarMasivaExcel(file)

  }

  @Get(':id/ficha-tecnica-pdf')
  @Auth(Role.ADMIN, Role.GESTOR, Role.CONSULTOR)
  async descargarPdf(@Param('id') id: string, @Res() res: Response) {
    const producto = await this.productosService.findOne(+id);

    const buffer = await this.pdfService.generarFichaProducto(producto);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=ficha_producto_${producto.idProducto}.pdf`,
    });

    res.send(buffer);
  }
}
