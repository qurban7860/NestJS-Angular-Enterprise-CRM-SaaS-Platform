/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { 
  Controller, Post, Get, Param, UseInterceptors, UploadedFile, 
  Res, ParseUUIDPipe, Inject, InternalServerErrorException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UploadFileUseCase } from '../../application/use-cases/upload-file.use-case';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';
import type { Response } from 'express';
import type { IStorageProvider } from '../../infrastructure/storage/storage-provider.interface';
import type { IFileMetadataRepository } from '../../domain/repositories/file-metadata.repository.interface';
import { UploadFileResponseDto } from '../../application/dtos/file.dto';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(
    private readonly uploadUseCase: UploadFileUseCase,
    @Inject('IStorageProvider') private readonly storageProvider: IStorageProvider,
    @Inject('IFileMetadataRepository') private readonly fileRepo: IFileMetadataRepository,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        relatedEntityType: { type: 'string', enum: ['CONTACT', 'DEAL', 'TASK'], nullable: true },
        relatedEntityId: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 201, type: UploadFileResponseDto })
  async upload(
    @UploadedFile() file: any,
    @CurrentUser() user: any,
    @Param('relatedEntityType') relatedEntityType?: string,
    @Param('relatedEntityId') relatedEntityId?: string,
  ) {
    const result = await this.uploadUseCase.execute({
      file,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      userId: user.id,
      relatedEntityType,
      relatedEntityId,
    });

    if (result.isFailure) {
      throw new InternalServerErrorException(result.error);
    }

    return result.getValue();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Download/Stream a file' })
  async getFile(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const metadata = await this.fileRepo.findById(id);
    if (!metadata) {
      return res.status(404).json({ message: 'File not found' });
    }

    const stream = await this.storageProvider.getFileStream(metadata.storagePath);
    
    res.set({
      'Content-Type': metadata.mimeType,
      'Content-Disposition': `inline; filename="${metadata.originalName}"`,
      'Content-Length': metadata.sizeBytes,
    });

    stream.pipe(res);
  }
}
