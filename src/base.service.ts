// import { Injectable } from '@nestjs/common';
// import { EC200, EM104, EM106, EM116, EM127 } from 'src/core/constants';
// import Helpers from 'src/core/utils/helpers';
// import HandleResponse from 'src/core/utils/handle_response';
// import { Model, ModelCtor } from 'sequelize-typescript';
// import SequelizeFilter from 'src/core/interfaces/sequelize.interface';
// import { BulkCreateOptions, GroupedCountResultItem, Op } from 'sequelize';

// @Injectable()
// // export abstract class BaseService<T extends Model<T>> {
// export abstract class BaseService<T extends Model<T>> {
//   protected abstract model: ModelCtor<T>;

//   async create(data: any) {
//     const result = await Helpers.create(this.model, data);
//     return result;
//   }
//   async bulkCreate(data: Array<any>, bulkCreateOptions?: BulkCreateOptions) {
//     const result = await Helpers.bulkCreate(this.model, data, bulkCreateOptions);
//     return result;
//   }

//   async findAll(qry?: SequelizeFilter<T>) {
//     let query = qry ? qry : { where: { is_deleted: false } };
//     const result = await Helpers.findAll(this.model, query);
//     return result;
//   }
//   async findAndCountAll(qry?: SequelizeFilter<T>) {
//     let query = qry ? qry : { where: { is_deleted: false } };
//     const result = await Helpers.findAndCountAll(this.model, query);
//     return result;
//   }

//   async findOne(id?: string, filters?: any) {
//     let defaultQry = {
//       where: {
//         id: id,
//         is_deleted: false,
//       },
//     };
//     let query = filters ? filters : defaultQry;
//     const result = await Helpers.findOne(this.model, query);
//     return result;
//   }

//   async findOneByDescription(name: string) {
//     let filters = {
//       where: {
//         [Op.or]: {
//           description: {
//             [Op.iLike]: `%${name}%`,
//           },
//           screen: {
//             [Op.iLike]: `%${name}%`,
//           },
//         },
//       },
//     };
//     return this.findOne(null, filters);
//   }

//   async update(id: string, data: any): Promise<T> {
//     const result = await Helpers.update(
//       this.model,
//       {
//         where: {
//           id: id,
//         },
//       },
//       data,
//     );
//     return result;
//   }

//   async remove(id: string): Promise<T> {
//     const result = await Helpers.update(
//       this.model,
//       {
//         where: {
//           id: id,
//         },
//       },
//       { is_deleted: true },
//     );
//     return result;
//   }

//   async destroy(id: string, qry?: SequelizeFilter<T>): Promise<any> {
//     id && (await this.remove(id));
//     let where_qry = {
//       where: {
//         id: id,
//       },
//     };
//     qry = id ? where_qry : qry;
//     const result = await this.model.destroy(qry);
//     return result;
//   }
//   async count(query): Promise<number> {
//     const count = await this.model.count(query);
//     return count.length > 0 ? count[0].count : 0;
//   }
//   async bulkUpdateRecords(updatedRecords: any[], schema?: any): Promise<number> {
//     let model = schema ? schema : this.model;
//     const transaction = await this.model.sequelize.transaction();
//     // Loop through the updatedRecords and perform individual updates in a transaction
//     for (const updatedRecord of updatedRecords) {
//       await model.update(updatedRecord, {
//         where: { id: updatedRecord.id }, // Use a unique identifier for the update condition
//         transaction,
//       });
//     }

//     // Commit the transaction if all updates are successful
//     await transaction.commit();

//     // Return the number of updated records
//     return updatedRecords.length;
//   }
// }

import { Injectable } from '@nestjs/common';
import {
  Repository,
  FindManyOptions,
  FindOneOptions,
  UpdateResult,
  EntityManager,
  In,
  Like,
  DeepPartial,
} from 'typeorm';
import { EntityTarget } from 'typeorm/common/EntityTarget';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export abstract class BaseService<T> {
  protected abstract repository: Repository<T>;

  constructor(protected readonly entityManager: EntityManager) { }

  /**
   * Create a new record.
   */
  async create(data: any): Promise<T> {
    const entity = this.repository.create(data as DeepPartial<T>);
    return this.repository.save(entity);
  }

  /**
   * Bulk create multiple records.
   */
  async bulkCreate(data: Partial<T>[]): Promise<T[]> {
    const entities = this.repository.create(data as DeepPartial<T>[]);
    return this.repository.save(entities);
  }

  /**
   * Find all records based on query options.
   */
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }
  async findAllWithPagination(
    page: number,
    limit: number,
    options?: FindManyOptions<T>,
  ): Promise<{ data: T[]; total: number }> {
    let [data, total] = await this.repository.findAndCount({ ...options, skip: (page - 1) * limit, take: limit });
    return { data, total };
  }

  /**
   * Find and count all records based on query options.
   */
  async findAndCountAll(options?: FindManyOptions<T>): Promise<[T[], number]> {
    return this.repository.findAndCount(options);
  }

  /**
   * Find one record by ID or other filters.
   */
  async findOne(id?: string | number, options?: FindOneOptions<T>): Promise<T | null> {
    if (id) {
      return this.repository.findOne({ where: { id, is_deleted: false } as any, ...options });
    }
    return this.repository.findOne(options);
  }

  /**
   * Find a record by name (example for custom filtering).
   */
  // async findOneByDescription(name: string): Promise<T | null> {
  //   const options: FindOneOptions<T> = {
  //     where: [
  //       { description: Like(`%${name}%`) as any },
  //       { screen: Like(`%${name}%`) as any },
  //     ],
  //   };
  //   return this.repository.findOne(options);
  // }

  /**
   * Update a record by ID.
   */
  async update(id: string | number, data: any): Promise<UpdateResult> {
    return this.repository.update(id, data as QueryDeepPartialEntity<T>);
  }

  /**
   * Soft delete a record by setting `is_deleted` to `true`.
   */
  async remove(id: number): Promise<UpdateResult> {
    return this.update(id, { is_deleted: true } as any);
  }

  /**
   * Permanently delete a record.
   */
  async destroy(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * Count records based on filters.
   */
  async count(options?: FindManyOptions<T>): Promise<number> {
    return this.repository.count(options);
  }

  /**
   * Bulk update multiple records.
   */
  // async bulkUpdateRecords(updatedRecords: Partial<T>[], schema?: EntityTarget<T>): Promise<number> {
  //   const transaction = this.entityManager.transaction(async (manager) => {
  //     for (const updatedRecord of updatedRecords) {
  //       await manager.update(schema || this.repository.target, updatedRecord.id, updatedRecord);
  //     }
  //   });
  //   await transaction;
  //   return updatedRecords.length;
  // }
}
