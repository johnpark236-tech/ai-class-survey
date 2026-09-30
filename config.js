// Google Apps Script 중앙 저장 API
window.AI_SURVEY_API_URL = 'https://script.google.com/macros/s/AKfycbzc15F1HbyhUah03vg8BVX9SKyVateTfxN7lkMRMYDbwcWfg72mupp1OKOnNhWLUSsv3g/exec';

// 메인 화면 UI 보정: 배지, 로고 이미지, 안내 문구
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .hero-badge{font-size:calc(26px * var(--font-scale))!important;}
    .ai-logo-row{display:flex;gap:10px;align-items:center;margin:18px 0 10px;}
    .ai-logo-tile{width:calc(64px * var(--font-scale));height:calc(64px * var(--font-scale));max-width:86px;max-height:86px;min-width:54px;min-height:54px;display:grid;place-items:center;background:#fff;border:1px solid var(--line);border-radius:18px;box-shadow:0 8px 22px rgba(38,48,42,.08);}
    .ai-logo-tile img{width:68%;height:68%;object-fit:contain;display:block;}
    @media(max-width:430px){.ai-logo-row{gap:8px}.ai-logo-tile{width:58px;height:58px;border-radius:16px}}
  `;
  document.head.appendChild(style);
})();

// 상단 브랜드명을 'AI 학습 동아리'로 변경
(() => {
  const updateBrand = () => {
    const brand = document.querySelector('.brand');
    if (brand) brand.textContent = 'AI 학습 동아리';
  };
  const observer = new MutationObserver(updateBrand);
  const start = () => {
    updateBrand();
    observer.observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
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

// 메인 화면 안내 문구에서 '이름 입력 +'와 '핵심' 제거
(() => {
  const updateHeroSummary = () => {
    const summary = document.querySelector('#screen .hero .result-card b');
    if (!summary) return;
    summary.textContent = '10문항 · 약 3분';
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

// 손바닥 이미지를 제거하고 ChatGPT·Claude·Gemini 로고 이미지를 한 줄로 표시
(() => {
  const updateHeroLogos = () => {
    const hero = document.querySelector('#screen .hero');
    if (!hero) return;

    const hand = hero.querySelector('.big-emoji');
    if (hand) hand.remove();

    if (hero.querySelector('.ai-logo-row')) return;

    const row = document.createElement('div');
    row.className = 'ai-logo-row';
    row.setAttribute('aria-label', 'AI 도구 로고');
    row.innerHTML = `
      <span class="ai-logo-tile"><img src="https://cdn.simpleicons.org/openai/111827" alt="ChatGPT 로고"></span>
      <span class="ai-logo-tile"><img src="https://cdn.simpleicons.org/claude/D97757" alt="Claude 로고"></span>
      <span class="ai-logo-tile"><img src="https://cdn.simpleicons.org/googlegemini/8E75B2" alt="Gemini 로고"></span>
    `;

    const badge = hero.querySelector('.hero-badge');
    if (badge) badge.insertAdjacentElement('afterend', row);
    else hero.insertBefore(row, hero.firstChild);
  };

  const observer = new MutationObserver(updateHeroLogos);
  const start = () => {
    updateHeroLogos();
    const screen = document.querySelector('#screen');
    if (screen) observer.observe(screen, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
