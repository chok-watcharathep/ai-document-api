import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BlobSASPermissions,
  BlobSASSignatureValues,
  BlobServiceClient,
  BlockBlobClient,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';

@Injectable()
export class StorageService {
  private readonly blobServiceClient: BlobServiceClient;
  private readonly containerName: string;
  private readonly accountName: string;
  private readonly accountKey: string;
  private readonly sharedKeyCredential: StorageSharedKeyCredential;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!;
    this.accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
    this.accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
    this.sharedKeyCredential = new StorageSharedKeyCredential(
      this.accountName,
      this.accountKey,
    );
    if (!connectionString) {
      throw new Error('Azure Storage Connection string not found');
    }
    this.blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
  }

  private getContainerClient() {
    return this.blobServiceClient.getContainerClient(this.containerName);
  }

  private getBlockBlobClient(blobName: string): BlockBlobClient {
    const containerClient = this.getContainerClient();
    return containerClient.getBlockBlobClient(blobName);
  }

  async uploadFile(
    file: Express.Multer.File,
    blobName: string,
  ): Promise<string> {
    const blockBlobClient = this.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(file.buffer);
    return blockBlobClient.url;
  }

  async getFile(blobName: string): Promise<string> {
    const blockBlobClient = this.getBlockBlobClient(blobName);
    return (await blockBlobClient.exists()) ? blockBlobClient.url : '';
  }

  async deleteFile(blobName: string): Promise<void> {
    const blockBlobClient = this.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
  }

  // New method to count files in a folder
  async countFilesInFolder(folderPath: string): Promise<number> {
    let count = 0;
    const containerClient = this.getContainerClient();
    const prefix = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
    const blobList = containerClient.listBlobsByHierarchy('/', {
      prefix,
    });

    for await (const blob of blobList) {
      if (blob.kind === 'blob') {
        count++;
      }
    }
    return count;
  }

  // New method to get a list of files with their information
  async getFilesInFolder(
    folderPath: string,
  ): Promise<
    {
      name: string;
      fullName: string;
      url: string;
      mimeType?: string;
      creationTime?: Date;
    }[]
  > {
    const files: {
      name: string;
      fullName: string;
      url: string;
      mimeType?: string;
      creationTime?: Date;
    }[] = [];
    const containerClient = this.getContainerClient();
    const prefix = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
    const blobList = containerClient.listBlobsByHierarchy('/', {
      prefix,
    });
    for await (const blob of blobList) {
      if (blob.kind === 'blob') {
        const sasToken = this.generateSasToken(blob.name);
        const blockBlobClient = this.getBlockBlobClient(blob.name);
        files.push({
          name: blob.name.split(prefix)[1],
          fullName: blob.name,
          url: `${blockBlobClient.url}?${sasToken}`,
          mimeType: blob.properties.contentType,
          creationTime: blob.properties.createdOn,
        });
      }
    }
    return files;
  }

  async downloadFileStream(blobName: string) {
    const blockBlobClient = this.getBlockBlobClient(`poc-folder/${blobName}`);
    const blobExists = await blockBlobClient.exists();
    if (!blobExists) {
      throw new NotFoundException(`File ${blobName} not found.`);
    }

    const downloadBlockBlobResponse = await blockBlobClient.download();

    if (!downloadBlockBlobResponse.readableStreamBody) {
      throw new NotFoundException(`File ${blobName} not found.`);
    }

    return downloadBlockBlobResponse.readableStreamBody;
  }

  private generateSasToken(blobName: string) {
    const TEN_MINUTES = 10 * 60 * 1000;
    const sasOptions: BlobSASSignatureValues = {
      blobName: blobName,
      containerName: this.containerName,
      permissions: BlobSASPermissions.parse('r'),
      expiresOn: new Date(new Date().valueOf() + TEN_MINUTES),
    };
    const sasToken = generateBlobSASQueryParameters(
      sasOptions,
      this.sharedKeyCredential,
    ).toString();

    return sasToken;
  }
}
