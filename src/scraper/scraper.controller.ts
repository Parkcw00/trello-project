import { Controller, Get, Query } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper') // 'scraper' 엔드포인트 설정 (예: http://localhost:3000/scraper)
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) { }


  // @GET 요청을 처리하는 엔드포인트
  // @Query 'url' 파라미터를 받아 해당 웹사이트를 스크래핑함

  @Get()
  async scrape(@Query('url') url: string) {
    if (!url) {
      return { error: 'URL을 입력하세요.' };
    }

    try {
      // ScraperService의 scrapeWebsite() 메서드 호출하여 크롤링 수행
      const data = await this.scraperService.scrapeWebsite(url);

      // 크롤링 결과를 json형태로 반환
      return { url, data };
    } catch (error) {
      return { error: `스크래핑 실패: ${error.message}` };
    }
  }
}
