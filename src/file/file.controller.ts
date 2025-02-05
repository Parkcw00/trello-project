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
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/user/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('cards/:id/file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileUploadInterceptor)
  async uploadFile(
    @UserInfo() user: User,
    @Param('id') cardId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.fileService.uploadFile(user.id, cardId, file);
  }

  @Get('')
  async findFiles(@UserInfo() user: User, @Param('id') cardId: string) {
    return this.fileService.findFiles(user.id, cardId);
  }

  @Delete('')
  async deleteFile(
    @UserInfo() user: User,
    @Param('id') cardId: string,
    @Body() deleteFileDto: DeleteFileDto,
  ) {
    return this.fileService.deleteFile(user.id, cardId, deleteFileDto);
  }

  @Get('download/:fileName')
  async downloadFile(
    @UserInfo() user: User,
    @Param('id') cardId: string,
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    return this.fileService.downloadFile(user.id, cardId, fileName, res);
  }
}
