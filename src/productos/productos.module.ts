import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { MailModule } from '../services/mail/mail.module';
import { MarcasModule } from 'src/marcas/marcas.module';
import { ColoresModule } from 'src/colores/colores.module';
import { ModelosModule } from 'src/modelos/modelos.module';
import { TallasModule } from 'src/tallas/tallas.module';
import { PdfService } from './pdf/pdf.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto]), 
    MailModule,
    ColoresModule,
    MarcasModule,
    ModelosModule,
    TallasModule

  ],
  controllers: [ProductosController],
  providers: [ProductosService, PdfService],
})
export class ProductosModule {}
