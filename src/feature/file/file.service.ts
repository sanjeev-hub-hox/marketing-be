import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';

@Injectable()
export class FileService {
  async createFileFromBuffer(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<Express.Multer.File> {
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);

    const multerFile: Express.Multer.File = {
      fieldname: 'file', // Field name from the form data
      originalname: fileName, // Original file name
      encoding: '7bit', // Default encoding type for Multer
      mimetype: mimeType, // Mime type of the file
      size: buffer.length, // Size of the file
      buffer, // The actual file data as a Buffer
      destination: '', // Not required, left empty if not storing locally
      filename: fileName, // File name in case it's uploaded or saved
      path: '', // Path where the file would be saved, if applicable
      stream: bufferStream,
    };

    return multerFile;
  }
}
