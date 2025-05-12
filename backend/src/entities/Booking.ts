import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsNumber, IsString, IsDate } from 'class-validator';
import { Property } from './Property';
import { Agent } from './Agent';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  propertyId: number;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column()
  @IsNotEmpty()
  guestId: number;

  @ManyToOne(() => Agent)
  @JoinColumn({ name: 'guestId' })
  guest: Agent;

  @Column()
  @IsNotEmpty()
  @IsDate()
  checkInDate: Date;

  @Column()
  @IsNotEmpty()
  @IsDate()
  checkOutDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  status: 'pending' | 'confirmed' | 'cancelled';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 