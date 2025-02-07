# 최신 Node.js 이미지를 기반으로 사용
FROM node:16-alpine

# 컨테이너 내 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json을 작업 디렉토리로 복사
COPY package.json package-lock.json ./

# 의존성 설치
RUN npm install

# 나머지 애플리케이션 코드를 작업 디렉토리로 복사
COPY . .

# 애플리케이션 빌드
RUN npm run build

# 애플리케이션이 실행되는 포트 노출
EXPOSE 3030

# 애플리케이션 시작
CMD ["node", "dist/src/main.js"]