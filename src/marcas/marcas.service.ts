import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Marca } from './entities/marca.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class MarcasService {

  constructor(
    @InjectRepository(Marca)
    private marcaRepository: Repository<Marca>,
  ) { }

  async create(createMarcaDto: CreateMarcaDto) {
    const { nombreMarca } = createMarcaDto;

    const existeMarca = await this.marcaRepository.findOneBy({
      nombreMarca: nombreMarca.trim(),
    })

    if (existeMarca) {
      throw new ConflictException(`La marca "${nombreMarca}" ya se ecuentra registrado.`);
    }

    try {
      const nuevaMarca = this.marcaRepository.create({
        nombreMarca: nombreMarca.trim(),
      });
      return await this.marcaRepository.save(nuevaMarca);
    } catch (error) {
      throw new InternalServerErrorException('Error inesperado al intentar registrar la talla.');
    }
  }

  async findAll() {
    return await this.marcaRepository.find();
  }

  async findOne(id: number) {
    const marca = await this.marcaRepository.findOneBy({ idMarca: id });

    if (!marca) {
      throw new NotFoundException(`Marca con id ${id} no encontrada.`);
    }

    return marca;
  }

  async update(id: number, updateMarcaDto: UpdateMarcaDto) {
    const marca = await this.marcaRepository.findOneBy({ idMarca: id });

    if (!marca) {
      throw new NotFoundException(`Marca con id ${id} no encontrada.`);
    }

    const nombreMarca = updateMarcaDto.nombreMarca?.trim();

    if (nombreMarca) {
      const existeMarca = await this.marcaRepository.findOne({
        where: {
          nombreMarca,
          idMarca: Not(id),
        },
      });

      if (existeMarca) {
        throw new ConflictException(`La marca "${nombreMarca}" ya existe.`);
      }
    }

    try {
      const marcaActualizada = this.marcaRepository.merge(marca, {
        nombreMarca: nombreMarca ?? marca.nombreMarca,
      });

      return await this.marcaRepository.save(marcaActualizada);
    } catch (error) {
      throw new InternalServerErrorException('No se pudo actualizar la marca.');
    }
  }

  async remove(id: number) {
    const marca = await this.findOne(id);

    await this.marcaRepository.softDelete({ idMarca: id });

    return {
      success: true,
      message: `La marca "${marca.nombreMarca}" fue eliminado.`,
      idEliminado: id
    };
  }

  async buscarOCrear(nombre: string) {
    let esNuevo = false;

    let marca = await this.marcaRepository.findOneBy({
      nombreMarca: nombre.trim()
    })
    if (!marca) {
      // throw new NotFoundException(`El color "${nombre}" no existe en la base de datos.`);
      marca = this.marcaRepository.create({
        nombreMarca: nombre.trim()
      });
      await this.marcaRepository.save(marca);
      esNuevo = true;
      console.log(`Nueva marca creada automátiamente: ${nombre}`)
    }

    return { ...marca, esNuevo };
  }
}
