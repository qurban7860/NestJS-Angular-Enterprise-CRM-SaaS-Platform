import { User } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByOrgId(orgId: string): Promise<User[]>;
  save(user: User): Promise<void>;
  exists(email: string): Promise<boolean>;
  delete(id: string): Promise<void>;
}
