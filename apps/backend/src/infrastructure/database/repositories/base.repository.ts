import { Repository, FindOptionsWhere, FindManyOptions, ObjectLiteral } from 'typeorm';

/**
 * Base repository interface with common CRUD operations
 */
export interface IBaseRepository<T extends ObjectLiteral> {
  findAll(options?: FindManyOptions<T>): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  findOne(where: FindOptionsWhere<T>): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(where?: FindOptionsWhere<T>): Promise<number>;
}

/**
 * Base repository implementation
 */
export abstract class BaseRepository<T extends ObjectLiteral> implements IBaseRepository<T> {
  constructor(protected repository: Repository<T>) {}

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async findById(id: string): Promise<T | null> {
    return this.repository.findOne({ where: { id } as any });
  }

  async findOne(where: FindOptionsWhere<T>): Promise<T | null> {
    return this.repository.findOne({ where });
  }

  async create(data: Partial<T>): Promise<T> {
    const entity = this.repository.create(data as any);
    const saved = await this.repository.save(entity);
    // TypeORM save can return T | T[], but we know it's T since we passed a single entity
    return saved as unknown as T;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    await this.repository.update(id, data as any);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({ where });
  }
}
