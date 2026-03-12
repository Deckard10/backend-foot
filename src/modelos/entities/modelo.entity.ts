import { Producto } from "../../productos/entities/producto.entity";
import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Modelo {
    @PrimaryGeneratedColumn()
    idModelo: number;

    @Column({ name: 'NombreModelo', unique: true })
    nombreModelo: string;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Producto, (producto) => producto.modelo)
    productos: Producto[];

}
