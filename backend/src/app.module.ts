import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AgenciesModule } from './agencies/agencies.module';
import { RegulationsModule } from './regulations/regulations.module';
import { Agency } from './agencies/agency.entity';
import { Regulation } from './regulations/regulation.entity';
import { RegulationHistory } from './regulations/regulationhistory.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'ecfr.sqlite',
      entities: [Agency, Regulation, RegulationHistory],
      synchronize: true // Auto-create tables in dev
    }),
    AgenciesModule,
    RegulationsModule,
  ],
})
export class AppModule {}
