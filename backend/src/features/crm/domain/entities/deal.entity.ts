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
  contactId: string;
  companyId: string;
  expectedCloseDate?: Date;
  closedAt?: Date;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Deal extends Entity<DealProps> {
  createdAt: any;
  status: string;
  private constructor(props: DealProps, id?: string) {
    super(props, id);
  }

  get title(): string { return this.props.title; }
  get valueAmount(): number { return this.props.valueAmount; }
  get valueCurrency(): string { return this.props.valueCurrency; }
  get stage(): DealStage { return this.props.stage; }
  get orgId(): string { return this.props.orgId; }
  get ownerId(): string { return this.props.ownerId; }
  get contactId(): string { return this.props.contactId; }
  get companyId(): string { return this.props.companyId; }
  get expectedCloseDate(): Date | undefined { return this.props.expectedCloseDate; }
  get closedAt(): Date | undefined { return this.props.closedAt; }
  get isDeleted(): boolean { return this.props.isDeleted; }

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
}
