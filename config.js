// Google Apps Script 중앙 저장 API
window.AI_SURVEY_API_URL = 'https://script.google.com/macros/s/AKfycbzc15F1HbyhUah03vg8BVX9SKyVateTfxN7lkMRMYDbwcWfg72mupp1OKOnNhWLUSsv3g/exec';

// UI 테스트: 메인 화면 'AI 수업 사전 체크' 배지 글씨만 2배 크게 표시
(() => {
  const style = document.createElement('style');
  style.textContent = `.hero-badge{font-size:calc(26px * var(--font-scale))!important;}`;
  document.head.appendChild(style);
})();

// 메인 화면 제목에서 중복되는 'AI 수업,' 문구 제거
(() => {
  const updateHeroTitle = () => {
    const title = document.querySelector('#screen .hero h1');
    if (!title) return;
    if (title.textContent.includes('AI 수업')) {
      title.innerHTML = '나에게 딱 맞게 시작해요.';
    }
  };
  const observer = new MutationObserver(updateHeroTitle);
  const start = () => {
    updateHeroTitle();
    const screen = document.querySelector('#screen');
    if (screen) observer.observe(screen, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

// 메인 화면 안내 문구에서 '이름 입력 +' 제거
(() => {
  const updateHeroSummary = () => {
    const summary = document.querySelector('#screen .hero .result-card b');
    if (!summary) return;
    if (summary.textContent.includes('이름 입력')) {
      summary.textContent = summary.textContent.replace('이름 입력 + ', '').trim();
    }
  };
  const observer = new MutationObserver(updateHeroSummary);
  const start = () => {
    updateHeroSummary();
    const screen = document.querySelector('#screen');
    if (screen) observer.observe(screen, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
