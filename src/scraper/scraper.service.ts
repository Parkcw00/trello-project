import { Injectable } from '@nestjs/common'; // NestJS의 Injectable 데코레이터 (의존성 주입을 위해 사용)
import * as puppeteer from 'puppeteer'; // Puppeteer 라이브러리 가져오기 (헤드리스 브라우저 실행)

@Injectable() // NestJS의 서비스 클래스임을 나타내는 데코레이터
export class ScraperService {

  // Puppeteer를 사용하여 동적으로 웹사이트를 스크래핑하는 메서드
  // @param url - 크롤링할 웹사이트 주소
  // @returns 페이지 제목(title), h1~h3 태그 내용, 모든 링크 목록을 포함한 객체

  async scrapeWebsite(
    url: string
  ): Promise<{ title: string; headings: string[]; links: string[] }> {
    let browser: puppeteer.Browser | null = null; // Puppeteer 브라우저 객체 (초기값 null)

    try {
      // Puppeteer 브라우저 실행 (백그라운드에서 동작하는 headless 모드)
      browser = await puppeteer.launch({ headless: true });
      const page: puppeteer.Page = await browser.newPage(); // 새로운 페이지(탭) 생성

      // 지정된 URL로 이동 (네트워크 요청이 거의 완료될 때까지 대기)
      await page.goto(url, { waitUntil: 'networkidle2' });

      // 현재 페이지의 제목(title) 가져오기
      const title: string = await page.title();

      // 1, h2, h3 태그 내의 텍스트를 가져오기
      const headings: string[] = await page.$$eval('h1, h2, h3', (elements: Element[]) =>
        elements.map((el: Element) => el.textContent?.trim() || '') // textContent가 null이면 빈 문자열 반환
      );

      // 모든 a 태그에서 링크(href 속성) 가져오기
      const links: string[] = await page.$$eval('a', (elements: Element[]) =>
        elements
          .map((el: Element) => el.getAttribute('href')) // 각 링크의 href 속성 가져오기
          .filter((href): href is string => !!href && href.startsWith('http')) // 빈 값, null 제외 & http로 시작하는 URL만 필터링
      );

      // Puppeteer 브라우저 종료 후 크롤링 결과 반환
      await browser.close();
      return { title, headings, links };
    } catch (error) {
      if (browser) await browser.close(); // 오류 발생 시 브라우저 종료
      throw new Error(`Puppeteer 스크래핑 실패: ${error.message}`); // 에러 메시지 반환
    }
  }
}
