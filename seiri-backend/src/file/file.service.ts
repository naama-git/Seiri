import { Injectable } from '@nestjs/common';

@Injectable()
export class FileService {
  async createFileMetadata() {}

  async readFileMetadataById(id: string) {}

  async readFilesMetadata(userId: string) {}
}
