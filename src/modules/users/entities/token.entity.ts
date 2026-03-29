// import {
//   Model,
//   DataType,
//   Sequelize,
//   Default,
//   Column,
//   PrimaryKey,
//   BelongsTo,
//   Table,
// } from 'sequelize-typescript';
// import BaseModel from '../../../core/database/BaseModel';

// @Table({ timestamps: true, tableName: 'otp',underscored:true,paranoid:true })
// export default class Otp extends BaseModel<Otp> {
//   @Column(DataType.STRING)
//   user: string;

//   @Column(DataType.STRING(6))
//   otp: string;

//   @Column(DataType.DATE)
//   expires_at: Date;

//   @Column(DataType.DATE)
//   created_at: Date;

// }

// src/modules/users/entities/token.entity.ts



import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseModel } from 'src/core/database/BaseModel';
import { User }  from 'src/modules/users/entities/user.entity'; // Adjust the import path as necessary
// token.entity.ts
@Entity({ name: 'tokens' })
export class Token extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  user_email: string;

  @Column({ type: 'varchar', length: 500 })
  token: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'timestamp', nullable: false })
  expires_at: Date;

  // // Relation to User
  // @ManyToOne(() => User, { nullable: true })
  // @JoinColumn({ name: 'user_id' })
  // user?: User;
}
