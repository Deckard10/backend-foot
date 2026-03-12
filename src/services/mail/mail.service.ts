import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from '../../common/enum/rol.enum';

@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }


    async enviarNotificacionCambioPrecio(nombreProducto: string, precioViejo: number, precioNuevo: number) {
        const admins = await this.userRepository.find({
            where: { role: Role.ADMIN },
            select: ['email'],
        });

        if (admins.length === 0) return;

        for (const admin of admins) {
            try {
            await this.mailerService.sendMail({
                to: admin.email,
                subject: `Cambio de precio en ${nombreProducto}`,
                html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
                    <h2 style="color: #007bff;">Actualización de Catálogo</h2>
                    <p>Hola, se ha detectado un cambio de precio en el sistema:</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 5px solid #007bff;">
                        <p><strong>Producto:</strong> ${nombreProducto}</p>
                        <p><strong>Precio Anterior:</strong> <span style="color: #dc3545;">S/ ${precioViejo}</span></p>
                        <p><strong>Precio Nuevo:</strong> <span style="color: #28a745;">S/ ${precioNuevo}</span></p>
                    </div>
                    <p style="font-size: 0.8em; color: #6c757d; margin-top: 20px;">
                    Este es un aviso automático generado por el módulo de mantenimiento de productos.
                    </p>
                </div>
                `,
            });
            console.log(`:3 Notificación enviada a: ${admin.email}`);
        } catch (error) {
            console.error('Error al enviar correo de notificación: :C', error);
        }
        }
    }
}
