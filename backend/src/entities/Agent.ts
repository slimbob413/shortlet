import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IsEmail, IsNotEmpty, IsPhoneNumber, Length, IsEnum } from 'class-validator';
import { Property } from './Property';

export enum UserRole {
  USER = 'user',
  AGENT = 'agent',
  ADMIN = 'admin',
}

@Entity('users')
export class Agent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty({ message: 'Name is required' })
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name: string;

  @Column({ unique: true })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Column()
  @IsPhoneNumber('NG', { message: 'Invalid phone number format' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @Column()
  @IsNotEmpty({ message: 'Password is required' })
  @Length(6, 100, { message: 'Password must be at least 6 characters' })
  password: string;

  @Column('varchar', { default: UserRole.USER })
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Property, property => property.owner)
  properties: Property[];

  @Column({ nullable: true })
  idDocumentUrl: string;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 