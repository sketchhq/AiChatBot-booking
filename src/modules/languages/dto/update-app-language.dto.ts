import { PartialType } from '@nestjs/mapped-types';
import { CreateAppLanguageDto } from './create-app-language.dto';

export class UpdateAppLanguageDto extends PartialType(CreateAppLanguageDto) {}
