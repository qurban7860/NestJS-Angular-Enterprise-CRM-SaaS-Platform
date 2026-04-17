/* eslint-disable prettier/prettier */
import { Entity } from '../../../../core/domain/base/entity.base';
import { Result } from '../../../../core/domain/base/result';

export type ContactStatus = 'LEAD' | 'QUALIFIED' | 'CUSTOMER' | 'CHURNED';

interface ContactProps {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: ContactStatus;
  orgId: string;
  ownerId: string;
  companyId?: string;
  tags: string[];
  notes?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Contact extends Entity<ContactProps> {
  private constructor(props: ContactProps, id?: string) {
    super(props, id);
  }

  get firstName(): string { return this.props.firstName; }
  get lastName(): string { return this.props.lastName; }
  get fullName(): string { return `${this.props.firstName} ${this.props.lastName}`; }
  get email(): string { return this.props.email; }
  get phone(): string | undefined { return this.props.phone; }
  get status(): ContactStatus { return this.props.status; }
  get orgId(): string { return this.props.orgId; }
  get ownerId(): string { return this.props.ownerId; }
  get companyId(): string | undefined { return this.props.companyId; }
  get tags(): string[] { return this.props.tags; }
  get notes(): string | undefined { return this.props.notes; }
  get isDeleted(): boolean { return this.props.isDeleted; }
  get createdAt(): Date | undefined { return this.props.createdAt; }

  public static create(props: ContactProps, id?: string): Result<Contact> {
    if (!props.firstName) return Result.fail<Contact>("First name is required");
    if (!props.lastName) return Result.fail<Contact>("Last name is required");
    if (!props.email) return Result.fail<Contact>("Email is required");
    if (!props.orgId)
      return Result.fail<Contact>('Organization ID is required');

    return Result.ok<Contact>(
      new Contact(
        {
          ...props,
          status: props.status ?? 'LEAD',
          tags: props.tags ?? [],
          isDeleted: props.isDeleted ?? false,
          createdAt: props.createdAt ?? new Date(),
          updatedAt: props.updatedAt ?? new Date(),
        },
        id,
      ),
    );
  }

  public updateStatus(newStatus: ContactStatus): void {
    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  public update(props: Partial<ContactProps>): void {
    if (props.firstName !== undefined) this.props.firstName = props.firstName;
    if (props.lastName !== undefined) this.props.lastName = props.lastName;
    if (props.email !== undefined) this.props.email = props.email;
    if (props.phone !== undefined) this.props.phone = props.phone;
    if (props.status !== undefined) this.props.status = props.status;
    if (props.companyId !== undefined) this.props.companyId = props.companyId;
    if (props.tags !== undefined) this.props.tags = props.tags;
    if (props.notes !== undefined) this.props.notes = props.notes;
    
    this.props.updatedAt = new Date();
  }

  public delete(): void {
    this.props.isDeleted = true;
    this.props.updatedAt = new Date();
  }
}
