import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppLanguagesService } from './app-languages.service';
import { AppLanguagesController } from './app-languages.controller';
import { AppLanguage } from './entities/app-languages.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppLanguage])],
  controllers: [AppLanguagesController],
  providers: [AppLanguagesService],
})
export class AppLanguagesModule {}
