import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateColoreDto } from './dto/create-colore.dto';
import { UpdateColoreDto } from './dto/update-colore.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Color } from './entities/color.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class ColoresService {

  constructor(
    @InjectRepository(Color)
    private coloresRepository: Repository<Color>
  ) { }


  async create(createColoreDto: CreateColoreDto) {
    const { nombreColor } = createColoreDto;

    const existeColor = await this.coloresRepository.findOneBy({
      nombreColor: nombreColor.trim(),
    })

    if (existeColor) {
      throw new ConflictException(`El color "${nombreColor}" ya se ecuentra registrado.`);
    }

    try {
      const nuevocolor = this.coloresRepository.create({
        nombreColor: nombreColor.trim(),
      });
      return await this.coloresRepository.save(nuevocolor);
    } catch (error) {
      throw new InternalServerErrorException('Error inesperado al intentar registrar el color.');
    }

  }

  async findAll() {
    return await this.coloresRepository.find();
  }

  async findOne(id: number) {
    const color = await this.coloresRepository.findOneBy({ idColor: id });

    if (!color) {
      throw new NotFoundException(`Color con id ${id} no encontrado.`);
    }

    return color;
  }

  async update(id: number, updateColoreDto: UpdateColoreDto) {
    const color = await this.coloresRepository.findOneBy({ idColor: id });

    if (!color) {
      throw new NotFoundException(`Color con id ${id} no encontrado.`);
    }

    const nombreColor = updateColoreDto.nombreColor?.trim();

    if (nombreColor) {
      const existeColor = await this.coloresRepository.findOne({
        where: {
          nombreColor,
          idColor: Not(id),
        },
      });

      if (existeColor) {
        throw new ConflictException(`El color "${nombreColor}" ya existe.`);
      }
    }

    try {
      const colorActualizado = this.coloresRepository.merge(color, {
        nombreColor: nombreColor ?? color.nombreColor,
      });

      return await this.coloresRepository.save(colorActualizado);
    } catch (error) {
      throw new InternalServerErrorException('No se pudo actualizar el color.');
    }
  }

  async remove(id: number) {
    const color = await this.findOne(id);

    await this.coloresRepository.softDelete({ idColor: id });

    return {
      success: true,
      message: `El color "${color.nombreColor}" fue eliminado.`,
      idEliminado: id
    };
  }

  async buscarOCrear(nombre: string) {
    let esNuevo = false;

    let color = await this.coloresRepository.findOneBy({
      nombreColor: nombre.trim()
    })

    if (!color) {
      // throw new NotFoundException(`El color "${nombre}" no existe en la base de datos.`);
      color = this.coloresRepository.create({
        nombreColor: nombre.trim()
      });
      await this.coloresRepository.save(color);
      esNuevo = true;
      console.log(`Nuevo color creada automátiamente: ${nombre}`)
    }

    return { ...color, esNuevo };
  }
}
