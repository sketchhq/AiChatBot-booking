// import { faker } from '@faker-js/faker';
// import { Product } from 'src/modules/products/entities/product.entity';
// import { StoreProduct } from 'src/modules/store-products/entities/store-product.entity';
// import { Store } from 'src/modules/store/entities/store.entity';

// export const createFakeStoreProduct = (store: Store, product: Product): Partial<StoreProduct> => {
//   const pickupTimes = ["07:00", "09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "20:00"];

//   // Select a random pickup start time
//   const pickup_start_time = faker.helpers.arrayElement(pickupTimes);

//   // Get valid pickup end times (must be later than start time)
//   const startIndex = pickupTimes.indexOf(pickup_start_time);
//   const validEndTimes = pickupTimes.slice(startIndex + 1);

//   // Select a random pickup end time (or default to "23:00" if none available)
//   const pickup_end_time = validEndTimes.length > 0 
//     ? faker.helpers.arrayElement(validEndTimes) 
//     : "23:00";

//   return {
//     store,
//     product,
//     original_price: +faker.finance.amount({ min: 1, max: 100, dec: 2 }),
//     discounted_price: +faker.finance.amount({ min: 1, max: 50, dec: 2 }),
//     currency: 'INR',
//     diet_preference: faker.helpers.arrayElement(['vegan', 'vegetarian']),
//     food_type: faker.helpers.arrayElement(['meals', 'groceries', 'bakers']),
//     quantity: faker.number.int({ min: 1, max: 100 }),
//     pickup_start_time,
//     pickup_end_time, // Ensured to be later than start time
//     is_surprise: faker.datatype.boolean(),
//   };
// };
