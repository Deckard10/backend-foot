
import { Role } from "../../common/enum/rol.enum";
import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 500 })
    name: string;

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ nullable: false, select: false })
    password: string;

    @Column({type: 'enum', default: Role.GESTOR, enum: Role})
    role: Role;

    @Column({ default: true })
    enabled: boolean;

    @DeleteDateColumn()
    deleteAt: Date;
    
}
