import { Entity } from '../../../../core/domain/base/entity.base';
import { Result } from '../../../../core/domain/base/result';

interface OrganizationProps {
  name: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Organization extends Entity<OrganizationProps> {
  private constructor(props: OrganizationProps, id?: string) {
    super(props, id);
  }

  get name(): string { return this.props.name; }
  get slug(): string { return this.props.slug; }
  get createdAt(): Date | undefined { return this.props.createdAt; }

  public static create(props: OrganizationProps, id?: string): Result<Organization> {
    if (!props.name) return Result.fail<Organization>("Organization name is required");
    if (!props.slug) return Result.fail<Organization>("Organization slug is required");

    return Result.ok<Organization>(new Organization({
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    }, id));
  }

  /**
   * Generates a URL-friendly slug from a name.
   */
  public static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
