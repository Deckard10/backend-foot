import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TallasService } from './tallas.service';
import { CreateTallaDto } from './dto/create-talla.dto';
import { UpdateTallaDto } from './dto/update-talla.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enum/rol.enum';

@Auth(Role.ADMIN, Role.GESTOR)
@Controller('tallas')
export class TallasController {
  constructor(private readonly tallasService: TallasService) {}

  @Post()
  create(@Body() createTallaDto: CreateTallaDto) {
    return this.tallasService.create(createTallaDto);
  }

  @Get()
  findAll() {
    return this.tallasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tallasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTallaDto: UpdateTallaDto) {
    return this.tallasService.update(+id, updateTallaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tallasService.remove(+id);
  }
}
