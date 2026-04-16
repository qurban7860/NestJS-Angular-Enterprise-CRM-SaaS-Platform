import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { IStorageProvider } from './storage-provider.interface';
import { Readable } from 'stream';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createReadStream, existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly uploadRoot = path.join(process.cwd(), 'uploads');

  constructor() {
    this.ensureDirectoryExists(this.uploadRoot);
  }

  async saveFile(file: { originalname: string; buffer: Buffer; mimetype: string }, folder: string = 'general'): Promise<string> {
    try {
      const folderPath = path.join(this.uploadRoot, folder);
      await this.ensureDirectoryExists(folderPath);

      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const storagePath = path.join(folder, fileName);
      const fullPath = path.join(this.uploadRoot, storagePath);

      await fs.writeFile(fullPath, file.buffer);

      return storagePath.replace(/\\/g, '/'); // Return normalized path
    } catch (error) {
      throw new InternalServerErrorException(`Failed to save file: ${error.message}`);
    }
  }

  async getFileStream(storagePath: string): Promise<Readable> {
    const fullPath = path.join(this.uploadRoot, storagePath);
    if (!existsSync(fullPath)) {
      throw new NotFoundException('File not found in storage');
    }
    return createReadStream(fullPath);
  }

  async deleteFile(storagePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadRoot, storagePath);
      if (existsSync(fullPath)) {
        await fs.unlink(fullPath);
      }
    } catch (error) {
      throw new InternalServerErrorException(`Failed to delete file: ${error.message}`);
    }
  }

  async getFileUrl(storagePath: string): Promise<string> {
    // In local storage, we point to our own download endpoint
    return `/api/files/${storagePath}`;
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    if (!existsSync(dirPath)) {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
}
