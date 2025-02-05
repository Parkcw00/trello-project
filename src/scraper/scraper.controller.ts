import { Controller, Get, Query } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) { }

  @Get()
  async scrape(@Query('url') url: string) {
    if (!url) {
      return { error: 'URL을 입력하세요.' };
    }
    const data = await this.scraperService.scrapeWebsite(url);
    return { url, data };
  }
}
