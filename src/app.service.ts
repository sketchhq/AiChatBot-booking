import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    // @InjectDataSource() private dataSource: DataSource, // Inject DataSource
  ) {}

  getHello(): string {
    return 'Hello World!!!   ';
  }

  // async runQuery() {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   // Perform queries using queryRunner...
  //   await queryRunner.release();
  // }
}
