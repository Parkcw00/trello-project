import { PickType } from "@nestjs/mapped-types";
import { File } from "../entities/file.entity";
import { IsString } from "class-validator";

export class DeleteFileDto extends PickType(File, ['fileName']) {
    @IsString()
    fileName: string;
}
