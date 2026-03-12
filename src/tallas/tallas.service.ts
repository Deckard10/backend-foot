import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTallaDto } from './dto/create-talla.dto';
import { UpdateTallaDto } from './dto/update-talla.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Talla } from './entities/talla.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class TallasService {
  constructor(
    @InjectRepository(Talla)
    private tallaRepository: Repository<Talla>
  ) { }


  async create(createTallaDto: CreateTallaDto) {

    const { nombreTalla } = createTallaDto;
    const existeTalla = await this.tallaRepository.findOneBy({
      nombreTalla: nombreTalla.trim(),
    })

    if (existeTalla) {
      throw new ConflictException(`La talla "${nombreTalla}" ya se ecuentra registrado.`);
    }

    try {
      const nuevoTalla = this.tallaRepository.create({
        nombreTalla: nombreTalla.trim(),
      });
      return await this.tallaRepository.save(nuevoTalla);
    } catch (error) {
      throw new InternalServerErrorException('Error inesperado al intentar registrar la talla.');
    }
  }

  async findAll() {
    return await this.tallaRepository.find();
  }

  async findOne(id: number) {
    const talla = await this.tallaRepository.findOneBy({ idTalla: id });

    if (!talla) {
      throw new NotFoundException(`Talla con id ${id} no encontrada.`);
    }

    return talla;
  }

  async update(id: number, updateTallaDto: UpdateTallaDto) {
    const talla = await this.tallaRepository.findOneBy({ idTalla: id });

    if (!talla) {
      throw new NotFoundException(`Talla con id ${id} no encontrada.`);
    }

    const nombreTalla = updateTallaDto.nombreTalla?.trim();

    if (nombreTalla) {
      const existeTalla = await this.tallaRepository.findOne({
        where: {
          nombreTalla,
          idTalla: Not(id),
        },
      });

      if (existeTalla) {
        throw new ConflictException(`La talla "${nombreTalla}" ya existe.`);
      }
    }

    try {
      const tallaActualizada = this.tallaRepository.merge(talla, {
        nombreTalla: nombreTalla ?? talla.nombreTalla,
      });

      return await this.tallaRepository.save(tallaActualizada);
    } catch (error) {
      throw new InternalServerErrorException('No se pudo actualizar la talla.');
    }
  }

  async remove(id: number) {
    const talla = await this.findOne(id);

    await this.tallaRepository.softDelete({ idTalla: id });

    return {
      success: true,
      message: `La talla "${talla.nombreTalla}" fue eliminado exitosamente.`,
      idEliminado: id,
    }
  }

  async buscarOCrear(nombre: string) {
    let esNuevo =  false;

    let talla = await this.tallaRepository.findOneBy({
      nombreTalla: nombre.trim()
    })
    if (!talla) {
      // throw new NotFoundException(`El color "${nombre}" no existe en la base de datos.`);
      talla = this.tallaRepository.create({
        nombreTalla: nombre.trim()
      });
      await this.tallaRepository.save(talla);
      esNuevo = true;
      console.log(`Nueva Talla creada automátiamente: ${nombre}`)
    }
    
    return {...talla, esNuevo};
  }

}
