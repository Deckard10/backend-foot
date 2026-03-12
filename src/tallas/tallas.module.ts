import { Module } from '@nestjs/common';
import { TallasService } from './tallas.service';
import { TallasController } from './tallas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Talla } from './entities/talla.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Talla])],
  controllers: [TallasController],
  providers: [TallasService],
  exports: [TallasService],
})
export class TallasModule {}
