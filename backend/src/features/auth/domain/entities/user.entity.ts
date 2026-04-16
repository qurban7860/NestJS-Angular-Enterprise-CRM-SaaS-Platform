import { Entity } from '../../../../core/domain/base/entity.base';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';
import { Result } from '../../../../core/domain/base/result';

export type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER';

interface UserProps {
  email: Email;
  passwordHash: Password;
  firstName: string;
  lastName: string;
  role: UserRole;
  orgId: string;
  isActive: boolean;
  avatarUrl?: string;
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  get email(): Email { return this.props.email; }
  get firstName(): string { return this.props.firstName; }
  get lastName(): string { return this.props.lastName; }
  get role(): UserRole { return this.props.role; }
  get orgId(): string { return this.props.orgId; }
  get isActive(): boolean { return this.props.isActive; }
  get passwordHash(): Password { return this.props.passwordHash; }

  public static create(props: UserProps, id?: string): Result<User> {
    // Domain validation logic here
    if (!props.orgId) {
      return Result.fail<User>("User must belong to an organization");
    }

    const user = new User({
      ...props,
      isActive: props.isActive ?? true,
      role: props.role ?? 'MEMBER',
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    }, id);

    return Result.ok<User>(user);
  }

  public deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  public activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  public changeRole(newRole: UserRole): Result<void> {
    this.props.role = newRole;
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  public updateProfile(firstName: string, lastName: string, avatarUrl?: string): void {
    this.props.firstName = firstName;
    this.props.lastName = lastName;
    this.props.avatarUrl = avatarUrl;
    this.props.updatedAt = new Date();
  }
}
