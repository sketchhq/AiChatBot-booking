// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { DataSource, Repository } from 'typeorm';
// import { createFakeStore } from './factories/store.factory';
// import { createFakeProduct } from './factories/product.factory';
// import { createFakeStoreProduct } from './factories/store-product.factory';
// import { Store } from '../modules/store/entities/store.entity';
// import { Product } from 'src/modules/products/entities/product.entity';
// import { StoreProduct } from 'src/modules/store-products/entities/store-product.entity';

// @Injectable()
// export class DatabaseSeeder {
//   constructor() {}

//   async seed(dataSource:DataSource): Promise<void> {

//     const storeRepo = dataSource.getRepository(Store);
//     const productRepo = dataSource.getRepository(Product);
//     const storeProductRepo = dataSource.getRepository(StoreProduct);

//     console.log('🌱 Seeding database...');

//     // Generate 15 stores
//     const stores = await storeRepo.save(
//       Array.from({ length: 10 }, createFakeStore),
//     );

//     // Generate 15 products
//     const products = await productRepo.save(
//       Array.from({ length: 10 }, createFakeProduct),
//     );

//     // Generate store-product relations
//     const storeProducts = stores.flatMap((store) =>
//       products.map((product) => createFakeStoreProduct(store, product)),
//     );

//     await storeProductRepo.save(storeProducts);

//     console.log('✅ Seeding complete!');
//   }
// }
