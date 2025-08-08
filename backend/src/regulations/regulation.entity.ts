import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Agency } from '../agencies/agency.entity';

@Entity()
export class Regulation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  text: string;

  @Column()
  checksum: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;

  @ManyToOne(() => Agency, (agency) => agency.regulations)
  agency: Agency;
}
