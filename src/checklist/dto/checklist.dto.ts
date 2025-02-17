import { PickType } from "@nestjs/mapped-types";
import { Checklist } from "../entities/checklist.entity";
import { IsString } from "class-validator";


export class ChecklistDto extends PickType(Checklist, ['content']) {
    @IsString()
    content: string;
}