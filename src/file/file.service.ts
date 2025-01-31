import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import * as fs from 'fs';
import * as path from 'path';
import { DeleteFileDto } from './dto/delete-file.dto';
import { Response } from 'express';

@Injectable()
export class FileService {

  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) { }

  // 파일 업로드
  async uploadFile(id: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('파일이 업로드되지 않았습니다.');
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      await this.deleteUploadedFile(file.path);
      throw new BadRequestException('파일 크기가 너무 큽니다. (최대 50MB)');
    }

    try {
      await this.fileRepository.save({
        cardId: +id,
        fileName: file.filename
      });
      return `${file.filename} 파일이 업로드 되었습니다.`;
    } catch (error) {
      await this.deleteUploadedFile(file.path);
      throw new BadRequestException('파일 업로드 중 오류가 발생했습니다.');
    }
  }

  // 해당 카드 모든 파일 조회
  async findFiles(id: string) {
    try {
      return await this.fileRepository.find({
        where: {
          cardId: +id
        },
        select: ['fileName']
      })
    } catch (error) {
      throw new BadRequestException('파일 조회 중 오류가 발생했습니다.');
    }
  }

  // 파일 삭제
  async deleteFile(id: string, deleteFileDto: DeleteFileDto) {
    const { fileName } = deleteFileDto;
    const existFile = await this.fileRepository.findOne({
      where: {
        cardId: +id,
        fileName
      }
    })

    if (!existFile) {
      throw new BadRequestException('해당 파일이 존재하지 않습니다.')
    }

    try {
      await this.fileRepository.delete({
        cardId: +id,
        fileName
      })
      await this.deleteUploadedFile(`uploads/${fileName}`)
      return `${fileName} 파일이 삭제되었습니다.`
    } catch (error) {
      throw new BadRequestException('파일 삭제 중 오류가 발생했습니다.');
    }
  }

  // 파일 삭제 메서드
  private async deleteUploadedFile(filePath: string): Promise<void> {
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      console.error('파일 삭제 중 오류 발생:', error);
    }
  }

  // 파일 다운로드
  async downloadFile(id: string, fileName: string, res: Response) {
    const file = await this.fileRepository.findOne({
      where: {
        cardId: +id,
        fileName
      }
    });

    if (!file) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }

    const filePath = path.join(process.cwd(), 'uploads', fileName);

    try {
      await fs.promises.access(filePath);
    } catch {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }

    return res.download(filePath, fileName, (error) => {
      if (error) {
        throw new BadRequestException('파일 다운로드 중 오류가 발생했습니다.');
      }
    });
  }
}
