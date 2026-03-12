import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { Not, Repository } from 'typeorm';
import { FilterProductoDto } from './dto/filter-producto.dto';
import * as ExcelJS from 'exceljs'
import { MailService } from '../services/mail/mail.service';
import { MarcasService } from '../marcas/marcas.service';
import { ModelosService } from '../modelos/modelos.service';
import { ColoresService } from '../colores/colores.service';
import { TallasService } from '../tallas/tallas.service';
import { ReporteCarga } from './interface/interface.producto';

type ProductoExcelData = {
  idProducto: number;
  nombreProducto: string;
  precioVenta: number;
  marcaNombre: string;
  modeloNombre: string;
  colorNombre: string;
  tallaNombre: string;
};


@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    private readonly mailService: MailService,
    private marcaService: MarcasService,
    private modeloService: ModelosService,
    private colorService: ColoresService,
    private tallaService: TallasService
  ) { }

  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_LIMIT = 10;


  async create(createProductoDto: CreateProductoDto) {
    const { nombreProducto } = createProductoDto;

    const existeProducto = await this.productoRepository.findOneBy({
      nombreProducto: nombreProducto.trim(),
    })

    if (existeProducto) {
      throw new ConflictException(`El producto "${nombreProducto}" ya se ecuentra registrado.`);
    }

    try {
      const nuevoProducto = this.productoRepository.create({
        nombreProducto: nombreProducto.trim(),
        imagen: createProductoDto.imagen?.trim(),
        precioVenta: createProductoDto.precioVenta,
        marca: { idMarca: createProductoDto.idMarca },
        modelo: { idModelo: createProductoDto.idModelo },
        color: { idColor: createProductoDto.idColor },
        talla: { idTalla: createProductoDto.idTalla },
      });
      return await this.productoRepository.save(nuevoProducto);

    } catch (error) {
      throw new InternalServerErrorException('Error inesperado al intentar registrar el producto.');
    }
  }

  private buildFilteredQuery() {
    const query = this.productoRepository.createQueryBuilder('producto');

    // Cargamos la relación de marca
    query
      .leftJoinAndSelect('producto.marca', 'marca')
      .leftJoinAndSelect('producto.modelo', 'modelo')
      .leftJoinAndSelect('producto.talla', 'talla')
      .leftJoinAndSelect('producto.color', 'color');

    query.orderBy('producto.idProducto', 'ASC');

    return query;
  }

  async findAll(_: FilterProductoDto): Promise<Producto[]> {
    const query = this.buildFilteredQuery();

    return await query.getMany();
  }

  async findAllPaginated(filtrosDto: FilterProductoDto) {
    const page = filtrosDto.page ?? this.DEFAULT_PAGE;
    const limit = filtrosDto.limit ?? this.DEFAULT_LIMIT;

    const query = this.buildFilteredQuery()
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const producto = await this.productoRepository.findOne({
      where: { idProducto: id },
      relations: ['marca', 'modelo', 'color', 'talla']
    });
    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado.`);
    }
    return producto;
  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    const producto = await this.productoRepository.findOneBy({ idProducto: id });

    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado.`);
    }

    const precioAnterior = Number(producto.precioVenta);

    const nombreProducto = updateProductoDto.nombreProducto?.trim();

    if (nombreProducto) {
      const existeProducto = await this.productoRepository.findOne({
        where: {
          nombreProducto,
          idProducto: Not(id),
        },
      });

      if (existeProducto) {
        throw new ConflictException(`El producto "${nombreProducto}" ya existe.`);
      }
    }

    try {
      const productoActualizado = this.productoRepository.merge(producto, {
        nombreProducto,
        imagen:
          updateProductoDto.imagen !== undefined
            ? updateProductoDto.imagen?.trim()
            : producto.imagen,
        precioVenta: updateProductoDto.precioVenta ?? producto.precioVenta,
        marca: updateProductoDto.idMarca
          ? { idMarca: updateProductoDto.idMarca }
          : producto.marca,
        modelo: updateProductoDto.idModelo
          ? { idModelo: updateProductoDto.idModelo }
          : producto.modelo,
        color: updateProductoDto.idColor
          ? { idColor: updateProductoDto.idColor }
          : producto.color,
        talla: updateProductoDto.idTalla
          ? { idTalla: updateProductoDto.idTalla }
          : producto.talla,
      });

      const resultado = await this.productoRepository.save(productoActualizado);

      const nuevoPrecio = Number(resultado.precioVenta);

      if (updateProductoDto.precioVenta !== undefined && precioAnterior !== nuevoPrecio) {
        this.mailService.enviarNotificacionCambioPrecio(
          resultado.nombreProducto,
          precioAnterior,
          nuevoPrecio
        ).catch(err => console.error('Error al enviar correos: ', err));
      }

      return resultado;
    } catch (error) {
      throw new InternalServerErrorException('No se pudo actualizar el producto.');
    }
  }

  async remove(id: number) {
    const producto = await this.findOne(id);

    await this.productoRepository.softDelete({ idProducto: id });

    return {
      success: true,
      message: `El producto "${producto.nombreProducto}" fue eliminado exitosamente.`,
      idEliminado: id,
    }
  }

  async generarExcel(productos: ProductoExcelData[]): Promise<ExcelJS.Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Catálogo de Productos');

    worksheet.columns = [
      { header: 'ID', key: 'idProducto', width: 10 },
      { header: 'nombreProducto', key: 'nombreProducto', width: 30 },
      { header: 'Marca', key: 'marcaNombre', width: 20 },
      { header: 'Modelo', key: 'modeloNombre', width: 20 },
      { header: 'Color', key: 'colorNombre', width: 20 },
      { header: 'Talla', key: 'tallaNombre', width: 15 },
      { header: 'Precio de Venta', key: 'precioVenta', width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF7DD3FC' },
    };

    productos.forEach((p) => {
      worksheet.addRow({
        idProducto: p.idProducto,
        nombreProducto: p.nombreProducto,
        marcaNombre: p.marcaNombre || 'N/A',
        modeloNombre: p.modeloNombre || 'N/A',
        colorNombre: p.colorNombre || 'N/A',
        tallaNombre: p.tallaNombre || 'N/A',
        precioVenta: p.precioVenta,
      });
    });

    return await workbook.xlsx.writeBuffer();

  }

  async cargarMasivaExcel(file: Express.Multer.File) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as any);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new BadRequestException('El archivo Excel no contiene una hoja válida.');
    }

    const reporte: ReporteCarga = {
      productosNuevos: 0,
      productosSaltados: 0,
      detalles: {
        marcasCreadas: [],
        modelosCreados: [],
        coloresCreados: [],
        tallasCreadas: []
      }
    };

    const productosParaGuardar: Producto[] = [];

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      if (!row.getCell(1).value) continue;

      try {
        const nombreProducto = row.getCell(1).text;
        const nombreMarca = row.getCell(2).text.trim();
        const nombreModelo = row.getCell(3).text;
        const nombreColor = row.getCell(4).text.trim();
        const nombreTalla = row.getCell(5).text.trim();
        const precio = Number(row.getCell(6).value);
        const nombreImagen = row.getCell(7).text.trim() || '';
        // console.log(`Fila ${i}: Producto=${nombreProducto}, Marca=${nombreMarca}, Modelo=${nombreModelo}`);

        const marca = await this.marcaService.buscarOCrear(nombreMarca);
        if (marca.esNuevo) reporte.detalles.marcasCreadas.push(marca.nombreMarca);
        console.log(marca.esNuevo)

        const modelo = await this.modeloService.buscarOCrear(nombreModelo);
        if (modelo.esNuevo) reporte.detalles.modelosCreados.push(modelo.nombreModelo);

        const color = await this.colorService.buscarOCrear(nombreColor);
        if (color.esNuevo) reporte.detalles.coloresCreados.push(color.nombreColor);

        const talla = await this.tallaService.buscarOCrear(nombreTalla);
        if (talla.esNuevo) reporte.detalles.tallasCreadas.push(talla.nombreTalla);

        const productoExistente = await this.productoRepository.findOne({
          where: {
            nombreProducto: nombreProducto,
            precioVenta: precio,
            marca: { idMarca: marca.idMarca },
            modelo: { idModelo: modelo.idModelo },
            color: { idColor: color.idColor },
            talla: { idTalla: talla.idTalla }
          }
        })

        if (productoExistente) {
          reporte.productosSaltados++;
          console.log(`Producto duplicado detectado en fila ${i}: ${nombreProducto}. Saltando...`);
          continue;
        }

        const nuevo = this.productoRepository.create({
          nombreProducto,
          precioVenta: precio,
          marca,
          modelo,
          color,
          talla,
          imagen: nombreImagen
        })
        productosParaGuardar.push(nuevo);

      } catch (error) {
        throw new BadRequestException(`Error en la fila ${i}: ${error.message}`);
      }
    }

    if (productosParaGuardar.length > 0) {
      await this.productoRepository.save(productosParaGuardar);
    }
    reporte.productosNuevos = productosParaGuardar.length;

    return {
      message: 'Proceso completado exitosamente.',
      data: reporte
    };
  }

}
