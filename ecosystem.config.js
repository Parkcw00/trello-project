module.exports = {
  apps: [
    {
      name: 'app-3000', // 첫 번째 앱 이름
      script: 'dist/main.js', // 실행할 파일 (NestJS 빌드된 파일)
      env: {
        PORT: 3000, // 3000번 포트에서 실행
      },
    },
    {
      name: 'app-3001', // 두 번째 앱 이름
      script: 'dist/main.js',
      env: {
        PORT: 3001, // 3001번 포트에서 실행
      },
    },
  ],
};
