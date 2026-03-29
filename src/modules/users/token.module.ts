// token.module.ts (if it exists)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import  { Token } from './entities/token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Token])],
  exports: [TypeOrmModule], //  export it!
})
export class TokenModule {}
