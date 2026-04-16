import { Readable } from 'stream';

export interface IStorageProvider {
  /**
   * Saves a file to the storage and returns the storage path/key.
   */
  saveFile(file: { originalname: string; buffer: Buffer; mimetype: string }, folder?: string): Promise<string>;

  /**
   * Retrieves a file stream from the storage.
   */
  getFileStream(storagePath: string): Promise<Readable>;

  /**
   * Deletes a file from the storage.
   */
  deleteFile(storagePath: string): Promise<void>;

  /**
   * Returns a publicly accessible URL if supported, or a local identifier.
   */
  getFileUrl(storagePath: string): Promise<string>;
}
