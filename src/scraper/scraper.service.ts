import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ScraperService {

  //  Puppeteer를 사용하여 동적으로 웹사이트를 스크래핑하는 메서드
  //  @param url - 크롤링할 웹사이트 주소
  //  @returns 페이지 제목과 h1, h2, h3 태그의 텍스트 배열 및 링크 목록

  async scrapeWebsite(
    url: string
  ): Promise<{ title: string; headings: string[]; links: string[] }> {
    let browser: puppeteer.Browser | null = null; // puppeteer 브라우저 객체 ( 초기값은 null이다. )
    try {
      // Puppeteer 브라우저 실행
      browser = await puppeteer.launch({ headless: true });
      const page: puppeteer.Page = await browser.newPage();

      // 지정된 URL로 이동
      await page.goto(url, { waitUntil: 'networkidle2' });

      // 페이지에서 제목(title) 가져오기
      const title: string = await page.title();

      // h1, h2, h3 태그 내용 가져오기
      const headings: string[] = await page.$$eval('h1, h2, h3', (elements: Element[]) =>
        elements.map((el: Element) => el.textContent?.trim() || '')
      );

      // 모든 a 태그에서 링크 가져오기( href 속성 )
      const links: string[] = await page.$$eval('a', (elements: Element[]) =>
        elements
          .map((el: Element) => el.getAttribute('href')) // (href 속성) 가져오기
          .filter((href): href is string => !!href && href.startsWith('http')) // 타입 가드 적용
      );

      // Puppeteer 브라우저 종료 후 결과 반환
      await browser.close();
      return { title, headings, links };
    } catch (error) {
      if (browser) await browser.close();
      throw new Error(`Puppeteer 스크래핑 실패: ${error.message}`);
    }
  }
}
