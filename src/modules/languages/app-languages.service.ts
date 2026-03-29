import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository ,Like, ILike} from 'typeorm';
import { AppLanguage } from './entities/app-languages.entity';
import { CreateAppLanguageDto } from './dto/create-app-language.dto';
import { UpdateAppLanguageDto } from './dto/update-app-language.dto';


@Injectable()
export class AppLanguagesService {
  constructor(
    @InjectRepository(AppLanguage)
    private readonly languageRepo: Repository<AppLanguage>,
  ) {}

  async create(dto: CreateAppLanguageDto): Promise<AppLanguage> {
    const language = this.languageRepo.create(dto);
    return this.languageRepo.save(language);
  }

async findAll(search?: string): Promise<AppLanguage[]> {
  if (search?.trim()) {
    return this.languageRepo.find({
      where: [
        { language_name: ILike(`%${search}%`) },
        { language_description: ILike(`%${search}%`) },
      ],
    });
  }

  return this.languageRepo.find();
}
  async findOne(id: number): Promise<AppLanguage> {
    const language = await this.languageRepo.findOne({ where: { id } });
    if (!language) throw new NotFoundException('Language not found');
    return language;
  }

  async update(id: number, dto: UpdateAppLanguageDto): Promise<AppLanguage> {
    const language = await this.findOne(id);
    Object.assign(language, dto);
    return this.languageRepo.save(language);
  }

  async remove(id: number): Promise<void> {
    const language = await this.findOne(id);
    await this.languageRepo.remove(language);
  }
}
