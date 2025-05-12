import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Agent } from './entities/Agent';
import { Property } from './entities/Property';
import { Booking } from './entities/Booking';
import path from 'path';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: path.join(__dirname, '../data/shortlet.sqlite'),
  synchronize: true, // Set to false in production
  logging: process.env.NODE_ENV !== 'production',
  entities: [Agent, Property, Booking],
  migrations: [],
  subscribers: [],
});

export const pool = AppDataSource; 