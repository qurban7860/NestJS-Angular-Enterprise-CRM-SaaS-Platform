import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import { FileMetadata } from '../../domain/entities/file-metadata.entity';
import type { IFileMetadataRepository } from '../../domain/repositories/file-metadata.repository.interface';
import type { IStorageProvider } from '../../infrastructure/storage/storage-provider.interface';
import { UploadFileResponseDto } from '../dtos/file.dto';
import { Injectable, Inject } from '@nestjs/common';

export interface UploadFileRequest {
  file: {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
    size: number;
  };
  userId: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

@Injectable()
export class UploadFileUseCase implements UseCase<UploadFileRequest, UploadFileResponseDto> {
  constructor(
    @Inject('IStorageProvider') private readonly storageProvider: IStorageProvider,
    @Inject('IFileMetadataRepository') private readonly fileRepo: IFileMetadataRepository,
  ) {}

  async execute(request: UploadFileRequest): Promise<Result<UploadFileResponseDto>> {
    try {
      // 1. Save physical file
      const storagePath = await this.storageProvider.saveFile(
        request.file, 
        request.relatedEntityType?.toLowerCase() || 'general'
      );

      // 2. Prepare metadata props
      const metadataProps: any = {
        originalName: request.file.originalname,
        storagePath: storagePath,
        mimeType: request.file.mimetype,
        sizeBytes: request.file.size,
        uploadedById: request.userId,
        relatedEntityType: request.relatedEntityType,
        isDeleted: false,
      };

      // Handle optional relationships
      if (request.relatedEntityType === 'CONTACT') metadataProps.relatedContactId = request.relatedEntityId;
      if (request.relatedEntityType === 'DEAL') metadataProps.relatedDealId = request.relatedEntityId;
      if (request.relatedEntityType === 'TASK') metadataProps.relatedTaskId = request.relatedEntityId;

      // 3. Create and save entity
      const fileMetadataOrError = FileMetadata.create(metadataProps);
      if (fileMetadataOrError.isFailure) {
        return Result.fail<UploadFileResponseDto>(fileMetadataOrError.error!);
      }

      const fileMetadata = fileMetadataOrError.getValue();
      await this.fileRepo.save(fileMetadata);

      // 4. Return response
      const url = await this.storageProvider.getFileUrl(storagePath);
      
      return Result.ok<UploadFileResponseDto>({
        id: fileMetadata.id,
        originalName: fileMetadata.originalName,
        mimeType: fileMetadata.mimeType,
        sizeBytes: fileMetadata.sizeBytes,
        url: url,
      });
    } catch (error) {
      return Result.fail<UploadFileResponseDto>(`Upload failed: ${error.message}`);
    }
  }
}
