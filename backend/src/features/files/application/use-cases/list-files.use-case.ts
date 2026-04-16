import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { IFileMetadataRepository } from '../../domain/repositories/file-metadata.repository.interface';
import { UploadFileResponseDto } from '../dtos/file.dto';
import { Injectable, Inject } from '@nestjs/common';

export interface ListFilesRequest {
  relatedEntityType: string;
  relatedEntityId: string;
}

@Injectable()
export class ListFilesUseCase implements UseCase<ListFilesRequest, UploadFileResponseDto[]> {
  constructor(
    @Inject('IFileMetadataRepository') private readonly fileRepo: IFileMetadataRepository,
  ) {}

  async execute(request: ListFilesRequest): Promise<Result<UploadFileResponseDto[]>> {
    const files = await this.fileRepo.findByRelatedEntity(request.relatedEntityType, request.relatedEntityId);

    const dtos: UploadFileResponseDto[] = files.map(file => ({
      id: file.id,
      originalName: file.originalName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      url: `/api/v1/files/${file.id}`
    }));

    return Result.ok(dtos);
  }
}
