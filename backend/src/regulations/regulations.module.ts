import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Regulation } from './regulation.entity';
import { Agency } from '../agencies/agency.entity';
import { RegulationsService } from './regulations.service';
import { RegulationsController } from './regulations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Regulation, Agency])],
  controllers: [RegulationsController],
  providers: [RegulationsService],
})
export class RegulationsModule {}
