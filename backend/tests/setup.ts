import { AppDataSource } from '../src/db';

beforeAll(async () => {
  // Initialize test database connection
  await AppDataSource.initialize();
});

afterAll(async () => {
  // Close database connection
  await AppDataSource.destroy();
});

afterEach(async () => {
  // Clean up database after each test
  const entities = AppDataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = AppDataSource.getRepository(entity.name);
    await repository.clear();
  }
}); 