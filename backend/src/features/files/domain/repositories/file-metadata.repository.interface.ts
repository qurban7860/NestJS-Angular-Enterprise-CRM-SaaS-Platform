import { FileMetadata } from '../entities/file-metadata.entity';

export interface IFileMetadataRepository {
  findById(id: string): Promise<FileMetadata | null>;
  save(fileMetadata: FileMetadata): Promise<void>;
  findByRelatedEntity(entityType: string, entityId: string): Promise<FileMetadata[]>;
  delete(id: string): Promise<void>;
}
