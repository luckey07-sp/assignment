import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agency } from './agency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agency])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule]
})
export class AgenciesModule {}
