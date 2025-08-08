import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Regulation } from './regulation.entity';

@Entity()
export class RegulationHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Regulation, { onDelete: 'CASCADE' })
  regulation: Regulation;

  @Column('text')
  oldChecksum: string;

  @CreateDateColumn()
  changedAt: Date;
}
