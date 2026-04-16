import { Entity } from '../../../../core/domain/base/entity.base';
import { Result } from '../../../../core/domain/base/result';

export type CompanySize = 'STARTUP' | 'SMB' | 'MID' | 'ENTERPRISE';

interface CompanyProps {
  name: string;
  industry?: string;
  website?: string;
  size: CompanySize;
  orgId: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Company extends Entity<CompanyProps> {
  private constructor(props: CompanyProps, id?: string) {
    super(props, id);
  }

  get name(): string { return this.props.name; }
  get industry(): string | undefined { return this.props.industry; }
  get website(): string | undefined { return this.props.website; }
  get size(): CompanySize { return this.props.size; }
  get orgId(): string { return this.props.orgId; }
  get isDeleted(): boolean { return this.props.isDeleted; }

  public static create(props: CompanyProps, id?: string): Result<Company> {
    if (!props.name) return Result.fail<Company>("Company name is required");

    return Result.ok<Company>(new Company({
      ...props,
      size: props.size ?? 'SMB',
      isDeleted: props.isDeleted ?? false,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    }, id));
  }
}
