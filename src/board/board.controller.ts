import { Controller } from '@nestjs/common';
import { BoardService } from './board.service';
import { update } from 'lodash';

@Controller('board')
export class BoardController {
    constructor(private readonly boardService: BoardService){}

    @Get(':boardId')

    @Get('')

    @Post('')

    @Patch('')

    @Delete('')

}
