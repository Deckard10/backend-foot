import { PartialType } from '@nestjs/swagger';
import { CreateColoreDto } from './create-colore.dto';

export class UpdateColoreDto extends PartialType(CreateColoreDto) {}
