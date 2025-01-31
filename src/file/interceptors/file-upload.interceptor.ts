import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerOptions: MulterOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const date = new Date();
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      
      const formattedDate = `${year}${month}${day}-${hour}${minute}`;
      const originalname = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
      callback(null, `${formattedDate}-${randomCode()}-${originalname}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    callback(null, true);
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
};

function randomCode(length: number = 4): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}

export const FileUploadInterceptor = FileInterceptor('file', multerOptions); 