/* eslint-disable prettier/prettier */
import { Entity } from '../../../../core/domain/base/entity.base';
import { Result } from '../../../../core/domain/base/result';

export type DealStage = 'PROSPECTING' | 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';

interface DealProps {
  title: string;
  valueAmount: number;
  valueCurrency: string;
  stage: DealStage;
  orgId: string;
  ownerId: string;
  contactId?: string;
  companyId?: string;
  expectedCloseDate?: Date;
  probability?: number;
  closedAt?: Date;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Deal extends Entity<DealProps> {
  private constructor(props: DealProps, id?: string) {
    super(props, id);
  }

  get title(): string { return this.props.title; }
  get valueAmount(): number { return this.props.valueAmount; }
  get valueCurrency(): string { return this.props.valueCurrency; }
  get stage(): DealStage { return this.props.stage; }
  get orgId(): string { return this.props.orgId; }
  get ownerId(): string { return this.props.ownerId; }
  get contactId(): string | undefined { return this.props.contactId; }
  get companyId(): string | undefined { return this.props.companyId; }
  get expectedCloseDate(): Date | undefined { return this.props.expectedCloseDate; }
  get probability(): number | undefined { return this.props.probability; }
  get closedAt(): Date | undefined { return this.props.closedAt; }
  get isDeleted(): boolean { return this.props.isDeleted; }
  get createdAt(): Date | undefined { return this.props.createdAt; }
  get updatedAt(): Date | undefined { return this.props.updatedAt; }

  public static create(props: DealProps, id?: string): Result<Deal> {
    if (props.valueAmount < 0) return Result.fail<Deal>("Deal value cannot be negative");

    return Result.ok<Deal>(new Deal({
      ...props,
      stage: props.stage ?? 'PROSPECTING',
      valueCurrency: props.valueCurrency ?? 'USD',
      isDeleted: props.isDeleted ?? false,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    }, id));
  }

  public advanceStage(nextStage: DealStage): void {
    this.props.stage = nextStage;
    if (nextStage === 'CLOSED_WON' || nextStage === 'CLOSED_LOST') {
      this.props.closedAt = new Date();
    }
    this.props.updatedAt = new Date();
  }

  public update(props: Partial<DealProps>): void {
    if (props.title !== undefined) this.props.title = props.title;
    if (props.valueAmount !== undefined) this.props.valueAmount = props.valueAmount;
    if (props.valueCurrency !== undefined) this.props.valueCurrency = props.valueCurrency;
    if (props.stage !== undefined) this.props.stage = props.stage;
    if (props.contactId !== undefined) this.props.contactId = props.contactId;
    if (props.companyId !== undefined) this.props.companyId = props.companyId;
    if (props.expectedCloseDate !== undefined) this.props.expectedCloseDate = props.expectedCloseDate;
    if (props.probability !== undefined) this.props.probability = props.probability;

    this.props.updatedAt = new Date();
  }

  public delete(): void {
    this.props.isDeleted = true;
    this.props.updatedAt = new Date();
  }
}
