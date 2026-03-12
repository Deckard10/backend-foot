import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateModeloDto } from './dto/create-modelo.dto';
import { UpdateModeloDto } from './dto/update-modelo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Modelo } from './entities/modelo.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class ModelosService {
  constructor(
    @InjectRepository(Modelo)
    private modeloRepository: Repository<Modelo>,
  ) {}


  async create(createModeloDto: CreateModeloDto) {
    const { nombreModelo } = createModeloDto;
    
        const existeMarca = await this.modeloRepository.findOneBy({
          nombreModelo: nombreModelo.trim(),
        })
    
        if (existeMarca) {
          throw new ConflictException(`El modelo "${nombreModelo}" ya se ecuentra registrado.`);
        }
    
        try {
          const nuevoModelo = this.modeloRepository.create({
            nombreModelo: nombreModelo.trim(),
          });
          return await this.modeloRepository.save(nuevoModelo);
        } catch (error) {
          throw new InternalServerErrorException('Error inesperado al intentar registrar la talla.');
        }
  }

  async findAll() {
    return await this.modeloRepository.find();
  }

  async findOne(id: number) {
    const modelo = await this.modeloRepository.findOneBy({ idModelo: id });

    if (!modelo) {
      throw new NotFoundException(`Modelo con id ${id} no encontrado.`);
    }

    return modelo;
  }

  async update(id: number, updateModeloDto: UpdateModeloDto) {
    const modelo = await this.modeloRepository.findOneBy({ idModelo: id });

    if (!modelo) {
      throw new NotFoundException(`Modelo con id ${id} no encontrado.`);
    }

    const nombreModelo = updateModeloDto.nombreModelo?.trim();

    if (nombreModelo) {
      const existeModelo = await this.modeloRepository.findOne({
        where: {
          nombreModelo,
          idModelo: Not(id),
        },
      });

      if (existeModelo) {
        throw new ConflictException(`El modelo "${nombreModelo}" ya existe.`);
      }
    }

    try {
      const modeloActualizado = this.modeloRepository.merge(modelo, {
        nombreModelo: nombreModelo ?? modelo.nombreModelo,
      });

      return await this.modeloRepository.save(modeloActualizado);
    } catch (error) {
      throw new InternalServerErrorException('No se pudo actualizar el modelo.');
    }
  }

  async remove(id: number) {
    const modelo = await this.findOne(id);

    await this.modeloRepository.softDelete({ idModelo: id });

    return {
      success: true,
      message: `El modelo "${modelo.nombreModelo}" fue eliminado.`,
      idEliminado: id
    };
  }

  async buscarOCrear(nombre: string) {
    let esNuevo =  false;
    let modelo = await this.modeloRepository.findOneBy({
      nombreModelo: nombre.trim()
    })
    if (!modelo) {
      // throw new NotFoundException(`El color "${nombre}" no existe en la base de datos.`);
      modelo = this.modeloRepository.create({
        nombreModelo: nombre.trim()
      });
      await this.modeloRepository.save(modelo);
      esNuevo = true;
      console.log(`Nueva modelo creada automátiamente: ${nombre}`)
    }
    
    return {...modelo, esNuevo};
  }

}
