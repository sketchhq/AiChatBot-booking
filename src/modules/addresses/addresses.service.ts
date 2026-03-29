import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  async create(dto: CreateAddressDto, userId: string) {
    if (dto.is_default) {
      await this.addressRepo.update(
        { user_id: userId, is_deleted: false },
        { is_default: false },
      );
    }

    const address = this.addressRepo.create({
      ...dto,
      user_id: userId,
    });

    return this.addressRepo.save(address);
  }

  async findAll(userId: string) {
    return this.addressRepo.find({
      where: { user_id: userId, is_deleted: false },
      relations: ['user'], 
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const address = await this.addressRepo.findOne({
      where: { id, user_id: userId, is_deleted: false },
      relations: ['user'], 
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async update(id: string, dto: UpdateAddressDto, userId: string) {
    await this.findOne(id, userId);

    if (dto.is_default) {
      await this.addressRepo.update(
        { user_id: userId, is_deleted: false },
        { is_default: false },
      );
    }

    await this.addressRepo.update({ id, user_id: userId }, dto);
    return this.findOne(id, userId);
  }

 async setDefaultAddress(addressId: string, userId: string) {
  return await this.addressRepo.manager.transaction(
    async (manager) => {
      // 1️⃣ Verify address belongs to user
      const address = await manager.findOne(Address, {
        where: {
          id: addressId,
          user_id: userId,
          is_deleted: false,
        },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      // 2️⃣ If already default → no-op
      if (address.is_default) {
        return address;
      }

      // 3️⃣ Remove previous default
      await manager.update(
        Address,
        {
          user_id: userId,
          is_default: true,
          is_deleted: false,
        },
        { is_default: false },
      );

      // 4️⃣ Set new default
      address.is_default = true;
      await manager.save(address);

      // 5️⃣ Return updated address
      return address;
    },
  );
}

  async softDelete(id: string, userId: string) {
    await this.findOne(id, userId);

    await this.addressRepo.update(
      { id, user_id: userId },
      { is_deleted: true },
    );

    return { message: 'Address deleted successfully' };
  }

  async getPetServiceAddresses(userId: string) {
    const addresses = await this.addressRepo.find({
      where: {
        user_id: userId,
        is_deleted: false,
      },
    });

    return addresses.map((a) => ({
      id: a.id,
      label: a.label,
      address: `${a.line1}, ${a.city}, ${a.state}`,
       phone_number: a.phone_number,
      is_default: a.is_default,
    //  use_for_pet_services: a.metadata?.use_for_pet_services ?? false,
    }));
  }

 // async setPetServiceUsage(
   // id: string,
   // userId: string,
    //value: boolean,
  //) {
    //const address = await this.findOne(id, userId);

    //await this.addressRepo.update(
      //{ id, user_id: userId },
      //{
        //metadata: {
          //...(address.metadata || {}),
          //use_for_pet_services: value,
        //},
      //},
    //);

    //return this.findOne(id, userId);
  //}
}
