// Google Apps Script 중앙 저장 API
window.AI_SURVEY_API_URL = 'https://script.google.com/macros/s/AKfycbzc15F1HbyhUah03vg8BVX9SKyVateTfxN7lkMRMYDbwcWfg72mupp1OKOnNhWLUSsv3g/exec';

// UI 테스트: 메인 화면 'AI 수업 사전 체크' 배지 글씨만 5배 크게 표시
(() => {
  const style = document.createElement('style');
  style.textContent = `.hero-badge{font-size:calc(65px * var(--font-scale))!important;}`;
  document.head.appendChild(style);
})();
