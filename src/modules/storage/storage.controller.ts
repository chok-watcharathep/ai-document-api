import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Get,
  Param,
  StreamableFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { extname } from 'path';
import { Response } from 'express';
import { Readable } from 'stream';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('File not provided', HttpStatus.BAD_REQUEST);
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtName = extname(file.originalname);
    const blobName = `myfolder/${uniqueSuffix}${fileExtName}`; // Example folder name
    try {
      const publicUrl = await this.storageService.uploadFile(file, blobName);
      return { url: publicUrl };
    } catch (error) {
      throw new HttpException(
        'File upload failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('count/:folderName')
  async countFiles(@Param('folderName') folderName: string) {
    try {
      const count = await this.storageService.countFilesInFolder(folderName);
      return { folder: folderName, count };
    } catch (error) {
      throw new HttpException(
        'Failed to count files',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('files/:folderName')
  async getFiles(@Param('folderName') folderName: string) {
    try {
      const files = await this.storageService.getFilesInFolder(folderName);
      return { folder: folderName, files };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve file list',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('download/:fileName')
  async downloadFile(
    @Param('fileName') fileName: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const stream = await this.storageService.downloadFileStream(fileName);

    // Set headers to prompt the browser to download the file
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    const nodeReadableStream = Readable.from(stream);

    return new StreamableFile(nodeReadableStream);
  }
}
