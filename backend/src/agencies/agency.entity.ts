import { Regulation } from 'src/regulations/regulation.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Agency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ default: 0 })
  wordCount: number;

  @OneToMany(() => Regulation, (regulation) => regulation.agency)
regulations: Regulation[];
}
