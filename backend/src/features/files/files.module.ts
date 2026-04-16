import { Module } from '@nestjs/common';
import { UploadFileUseCase } from './application/use-cases/upload-file.use-case';
import { PrismaFileMetadataRepository } from './infrastructure/repositories/prisma-file-metadata.repository';
import { LocalStorageProvider } from './infrastructure/storage/local-storage.provider';
import { FilesController } from './presentation/controllers/files.controller';

@Module({
  imports: [],
  controllers: [FilesController],
  providers: [
    UploadFileUseCase,
    {
      provide: 'IStorageProvider',
      useClass: LocalStorageProvider, // Easy to swap for S3StorageProvider later
    },
    {
      provide: 'IFileMetadataRepository',
      useClass: PrismaFileMetadataRepository,
    },
  ],
  exports: [UploadFileUseCase, 'IStorageProvider', 'IFileMetadataRepository'],
})
export class FilesModule {}
