import { PartialType } from '@nestjs/swagger';
import { CreateTallaDto } from './create-talla.dto';

export class UpdateTallaDto extends PartialType(CreateTallaDto) {}
