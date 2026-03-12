import { Producto } from "../../productos/entities/producto.entity";
import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Color {
    @PrimaryGeneratedColumn()
    idColor: number;

    @Column({ name: 'NombreColor', unique: true })
    nombreColor: string;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Producto, (producto) => producto.color)
    productos: Producto[];
}
