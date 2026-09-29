# Google Sheet 중앙 저장 연결

대상 스프레드시트: ai-class-survey  
Spreadsheet ID: `1ZKMdeEOcNBdhdQtfUKAykair8e653QTuTJd5l03ngr8`  
응답 탭: `응답`

## 1. Apps Script 코드 넣기
Google Sheet에서 **확장 프로그램 → Apps Script**를 열고,
이 저장소의 `apps-script/Code.gs` 내용을 기본 `Code.gs`에 전체 붙여넣고 저장합니다.

## 2. 웹앱 배포
**배포 → 새 배포 → 유형: 웹 앱**
- 실행 사용자: 나
- 액세스 권한: 모든 사용자

배포 후 생성되는 `https://script.google.com/macros/s/.../exec` URL을 복사합니다.

## 3. GitHub에 URL 반영
`config.js`의 아래 값을 웹앱 URL로 변경합니다.

```js
window.AI_SURVEY_API_URL = 'https://script.google.com/macros/s/배포ID/exec';
```

이후 GitHub Pages에서
- 설문 제출 → Google Sheet `응답` 탭에 중앙 저장
- 강사 접속 → 비밀번호 검증 후 전체 응답 조회
- CSV 내보내기 / 새로고침 / 전체 삭제
가 동작합니다.

기본 강사 비밀번호는 `1234`입니다.
