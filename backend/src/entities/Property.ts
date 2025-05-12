import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsNumber, IsArray, IsString, Min } from 'class-validator';
import { Agent } from './Agent';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title: string;

  @Column('text')
  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @IsNotEmpty({ message: 'Price is required' })
  @IsNumber()
  @Min(0, { message: 'Price must be greater than 0' })
  price: number;

  @Column('simple-array')
  @IsArray()
  availability: string[]; // Array of dates in ISO format

  @Column('simple-array', { nullable: true })
  images: string[]; // Array of image URLs

  @Column()
  ownerId: number;

  @ManyToOne(() => Agent, agent => agent.properties)
  @JoinColumn({ name: 'ownerId' })
  owner: Agent;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 