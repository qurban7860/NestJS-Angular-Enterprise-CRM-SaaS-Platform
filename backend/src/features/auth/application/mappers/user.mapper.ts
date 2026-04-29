/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { User } from '../../domain/entities/user.entity';
import { Mapper } from '../../../../core/application/base/mapper.base';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';

export class UserMapper extends Mapper<User, any, any> {
  public toDomain(raw: any): User {
    const userOrError = User.create(
      {
        email: Email.create(raw.email).getValue(),
        passwordHash: Password.createHashed(raw.passwordHash).getValue(),
        firstName: raw.firstName,
        lastName: raw.lastName,
        role: raw.role,
        orgId: raw.orgId,
        isActive: raw.isActive,
        isDeleted: raw.isDeleted,
        avatarUrl: raw.avatarUrl,
        refreshToken: raw.refreshToken,
        customRole: raw.customRole,
        plan: raw.org?.plan || raw.plan,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );

    return userOrError.getValue();
  }

  public toDto(user: User): any {
    return {
      id: user.id,
      email: user.email.value,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      orgId: user.orgId,
      plan: user.plan,
      isActive: user.isActive,
      customRole: user.customRole,
      customRoleId: user.customRole?.id || null,
    };
  }

  public toPersistence(user: User): any {
    return {
      id: user.id,
      email: user.email.value,
      passwordHash: user.passwordHash.value,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      orgId: user.orgId,
      isActive: user.isActive,
      isDeleted: user.isDeleted,
    };
  }
}
