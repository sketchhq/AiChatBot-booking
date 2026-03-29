import { NestFactory } from '@nestjs/core';
// import { DatabaseSeeder } from './database.seeder';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';

async function runSeeder() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // const seeder = app.get(DatabaseSeeder);
  const dataSource = app.get(DataSource)
  // await seeder.seed(dataSource);
  await app.close();
}

runSeeder();
