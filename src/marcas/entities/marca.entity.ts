import { Producto } from "../../productos/entities/producto.entity";
import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Marca {
    @PrimaryGeneratedColumn()
    idMarca: number;

    @Column({ name: 'NombreMarca', unique: true })
    nombreMarca: string;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Producto, (producto) => producto.marca)
    productos: Producto[];
}
