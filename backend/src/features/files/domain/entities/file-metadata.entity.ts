import { Entity } from '../../../../core/domain/base/entity.base';
import { Result } from '../../../../core/domain/base/result';

interface FileMetadataProps {
  originalName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  uploadedById: string;
  relatedEntityType?: string;
  relatedContactId?: string;
  relatedDealId?: string;
  relatedTaskId?: string;
  isDeleted: boolean;
  createdAt?: Date;
}

export class FileMetadata extends Entity<FileMetadataProps> {
  private constructor(props: FileMetadataProps, id?: string) {
    super(props, id);
  }

  get originalName(): string { return this.props.originalName; }
  get storagePath(): string { return this.props.storagePath; }
  get mimeType(): string { return this.props.mimeType; }
  get sizeBytes(): number { return this.props.sizeBytes; }
  get uploadedById(): string { return this.props.uploadedById; }
  get isDeleted(): boolean { return this.props.isDeleted; }
  get createdAt(): Date | undefined { return this.props.createdAt; }

  public static create(props: FileMetadataProps, id?: string): Result<FileMetadata> {
    if (!props.originalName || props.originalName.length === 0) {
      return Result.fail<FileMetadata>('Original name is required');
    }
    if (!props.storagePath || props.storagePath.length === 0) {
      return Result.fail<FileMetadata>('Storage path is required');
    }

    return Result.ok<FileMetadata>(new FileMetadata({
      ...props,
      isDeleted: props.isDeleted ?? false,
    }, id));
  }

  public delete(): void {
    this.props.isDeleted = true;
  }
}
