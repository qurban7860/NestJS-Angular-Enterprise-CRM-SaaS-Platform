import { Injectable } from '@nestjs/common';
import { IFileMetadataRepository } from '../../domain/repositories/file-metadata.repository.interface';
import { FileMetadata } from '../../domain/entities/file-metadata.entity';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaFileMetadataRepository implements IFileMetadataRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<FileMetadata | null> {
    const raw = await this.prisma.fileMetadata.findUnique({ where: { id } });
    if (!raw) return null;
    return this.mapToEntity(raw);
  }

  async findByRelatedEntity(entityType: string, entityId: string): Promise<FileMetadata[]> {
    const where: any = { isDeleted: false };
    if (entityType === 'CONTACT') where.relatedContactId = entityId;
    if (entityType === 'DEAL') where.relatedDealId = entityId;
    if (entityType === 'TASK') where.relatedTaskId = entityId;

    const raws = await this.prisma.fileMetadata.findMany({ where });
    return raws.map(raw => this.mapToEntity(raw));
  }

  async save(entity: FileMetadata): Promise<void> {
    const data = {
      originalName: entity.originalName,
      storagePath: entity.storagePath,
      mimeType: entity.mimeType,
      sizeBytes: entity.sizeBytes,
      uploadedById: entity.uploadedById,
      relatedEntityType: (entity as any).props.relatedEntityType,
      relatedContactId: (entity as any).props.relatedContactId,
      relatedDealId: (entity as any).props.relatedDealId,
      relatedTaskId: (entity as any).props.relatedTaskId,
      isDeleted: entity.isDeleted,
    };

    await this.prisma.fileMetadata.upsert({
      where: { id: entity.id },
      update: data,
      create: { ...data, id: entity.id },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.fileMetadata.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  private mapToEntity(raw: any): FileMetadata {
    return FileMetadata.create({
      originalName: raw.originalName,
      storagePath: raw.storagePath,
      mimeType: raw.mimeType,
      sizeBytes: raw.sizeBytes,
      uploadedById: raw.uploadedById,
      relatedEntityType: raw.relatedEntityType || undefined,
      relatedContactId: raw.relatedContactId || undefined,
      relatedDealId: raw.relatedDealId || undefined,
      relatedTaskId: raw.relatedTaskId || undefined,
      isDeleted: raw.isDeleted,
      createdAt: raw.createdAt,
    }, raw.id).getValue();
  }
}
