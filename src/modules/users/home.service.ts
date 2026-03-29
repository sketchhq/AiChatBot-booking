import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class HomeService {
  constructor(

  ) {}

  // async getHomePageData(dto: TimeSensitiveProductsDto): Promise<any> {
  //   const selectedProductIds: number[] = []; // Track selected product IDs

  //   const sections = ['just_for_you', 'last_chance_deals', 'available_now', 'dinnertime_deals', 'sold_out'];

  //   const results = await Promise.all(
  //     sections.map(
  //       async (section) =>
  //         await this.storeProductsService.getTimeSensitiveProducts({
  //           ...dto,
  //           sectionType: section,
  //           selectedProductIds,
  //         }),
  //     ),
  //   );

  //   const [just_for_you, lastChanceDeals, availableNow, dinnertimeDeals, soldOut] = results;
  //   const supermarkets = await this.storeRepository.findBy({ category: 'supermarket' });
  //   return {
  //     just_for_you: just_for_you,
  //     last_chance_deals: lastChanceDeals,
  //     available_now: availableNow,
  //     dinnertime_deals: dinnertimeDeals,
  //     sold_out: soldOut,
  //     supermarkets: supermarkets,
  //   };
  // }
}
