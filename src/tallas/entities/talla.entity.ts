import { Producto } from "src/productos/entities/producto.entity";
import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Talla {
    @PrimaryGeneratedColumn()
    idTalla: number;

    @Column({ name: 'NombreTalla', unique: true })
    nombreTalla: string;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Producto, (producto) => producto.talla)
    productos: Producto[]
}
