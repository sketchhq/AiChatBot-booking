import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VetAvailabilityRule } from './entities/vet-availability-rule.entity';
import { VetAvailabilityRuleService } from './vet-availability-rule.service';
import { VetAvailabilityRuleController } from './vet-availability-rule.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VetAvailabilityRule])],
  controllers: [VetAvailabilityRuleController],
  providers: [VetAvailabilityRuleService],
  exports: [VetAvailabilityRuleService],
})
export class VetAvailabilityRuleModule {}