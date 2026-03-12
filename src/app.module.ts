import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProductosModule } from './productos/productos.module';
import { MarcasModule } from './marcas/marcas.module';
import { ModelosModule } from './modelos/modelos.module';
import { ColoresModule } from './colores/colores.module';
import { TallasModule } from './tallas/tallas.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './services/mail/mail.service';
import { MailModule } from './services/mail/mail.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.MYSQL_SSL === "true",
      extra: {
        ssl:
          process.env.MYSQL_SSL === "true"
            ? {
              rejectUnauthorized: false,
            }
            : null,
      },
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true, 
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        }
      },
      defaults: {
        from: `"Catálogo Sistema" <${process.env.EMAIL_FROM}>`
      }
    }),
    UsersModule,
    AuthModule,
    ProductosModule,
    MarcasModule,
    ModelosModule,
    ColoresModule,
    TallasModule,
    MailModule,
  ],
  controllers: [],
  providers: [MailService],
})
export class AppModule { }
