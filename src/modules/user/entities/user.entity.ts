import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Status } from '../enums/status.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ default: Status.ACTIVE })
  status: Status;
}
