import { Controller, Post, Body } from '@nestjs/common'; // POST 요청을 처리하기 위해 @Post, @Body 추가
import { ScraperService } from './scraper.service'; // ScraperService 가져오기 (서비스 계층)

@Controller('scraper') // 'scraper' 엔드포인트 설정 (예: http://localhost:3000/scraper)
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) { } // ScraperService를 의존성 주입하여 사용

  // @POST 요청을 처리하는 엔드포인트
  // 요청의 body에서 'url' 값을 받아 웹사이트 데이터를 스크래핑한다.
  // @param body 요청 바디 (JSON 데이터)
  // @returns 크롤링된 데이터를 JSON 형식으로 반환

  @Post()
  async scrape(@Body() body: { url: string }) {
    // 요청 바디에서 URL 값이 없는 경우 오류 반환
    if (!body.url) {
      return { error: 'URL을 입력하세요.' };
    }

    try {
      // ScraperService의 scrapeWebsite() 메서드를 호출하여 크롤링 수행
      const data = await this.scraperService.scrapeWebsite(body.url);

      // 크롤링 결과를 JSON 형태로 반환
      return { url: body.url, data };
    } catch (error) {
      // 오류 발생 시 사용자에게 오류 메시지를 반환
      return { error: `스크래핑 실패: ${error.message}` };
    }
  }
}
