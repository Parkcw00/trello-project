import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ScraperService {
  async scrapeWebsite(url: string): Promise<string[]> {
    try {
      // 1. HTTP 요청으로 웹사이트 데이터 가져오기
      const { data } = await axios.get(url);

      // 2. Cheerio로 HTML 파싱
      const $ = cheerio.load(data);

      // 3. 특정 요소 가져오기 (예: 모든 <h2> 태그 텍스트 가져오기)
      const results: string[] = [];
      $('h2').each((_, element) => {
        results.push($(element).text().trim());
      });

      return results;
    } catch (error) {
      throw new Error(`스크래핑 실패: ${error.message}`);
    }
  }
}
