import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileUploadInterceptor } from './interceptors/file-upload.interceptor';
import { DeleteFileDto } from './dto/delete-file.dto';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('cards/:id/file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileUploadInterceptor)
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.fileService.uploadFile(id, file);
  }

  @Get('')
  async findFiles(@Param('id') id: string) {
    return this.fileService.findFiles(id);
  }

  @Delete('')
  async deleteFile(
    @Param('id') id: string,
    @Body() deleteFileDto: DeleteFileDto,
  ) {
    return this.fileService.deleteFile(id, deleteFileDto);
  }

  @Get('download/:fileName')
  async downloadFile(
    @Param('id') id: string,
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    return this.fileService.downloadFile(id, fileName, res);
  }
}
