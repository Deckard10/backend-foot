import { Color } from "src/colores/entities/color.entity";
import { Marca } from "src/marcas/entities/marca.entity";
import { Modelo } from "src/modelos/entities/modelo.entity";
import { Talla } from "src/tallas/entities/talla.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Producto {

    @PrimaryGeneratedColumn()
    idProducto: number;

    @Column({ name: 'NombreProducto' })
    nombreProducto: string;

    @Column({ type: 'text', nullable: true })
    imagen: string;

    @DeleteDateColumn()
    deleteAt: Date;

    @Column({ name: 'PrecioVenta', type: 'decimal', precision: 10, scale: 2 })
    precioVenta: number;

    @ManyToOne(() => Marca, (marca) => marca, {eager: true})
    @JoinColumn({ name: 'idMarca' })
    marca: Marca;

    @ManyToOne(() => Modelo,(modelo) => modelo.productos , { eager: true})
    @JoinColumn({ name: 'idModelo' })
    modelo: Modelo;

    @ManyToOne(() => Color, (color) => color.productos, {eager: true})
    @JoinColumn({ name: 'idColor'})
    color: Color;

    @ManyToOne(() => Talla, (talle) => talle.productos ,{eager: true})
    @JoinColumn({ name: 'idTalla' })
    talla: Talla;

}
