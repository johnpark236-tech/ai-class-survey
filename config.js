// Google Apps Script 중앙 저장 API
window.AI_SURVEY_API_URL = 'https://script.google.com/macros/s/AKfycbzc15F1HbyhUah03vg8BVX9SKyVateTfxN7lkMRMYDbwcWfg72mupp1OKOnNhWLUSsv3g/exec';

// 메인 화면 UI 보정: 브랜드명, 안내 문구, AI 로고 행
(() => {
  const BRAND_TEXT = 'AI 학습 동아리';
  const HERO_TITLE_TEXT = '나에게 딱 맞게 시작해요.';
  const SUMMARY_TEXT = '10문항 · 약 3분';

  const injectStyle = () => {
    if (document.getElementById('ai-hero-logo-style')) return;
    const style = document.createElement('style');
    style.id = 'ai-hero-logo-style';
    style.textContent = `
      .hero-badge{font-size:calc(26px * var(--font-scale))!important;}
      .ai-logo-row{display:flex;gap:10px;align-items:center;margin:18px 0 10px;}
      .ai-logo-tile{width:calc(64px * var(--font-scale));height:calc(64px * var(--font-scale));max-width:86px;max-height:86px;min-width:54px;min-height:54px;display:grid;place-items:center;background:#fff;border:1px solid var(--line);border-radius:18px;box-shadow:0 8px 22px rgba(38,48,42,.08);}
      .ai-logo-tile img{width:68%;height:68%;object-fit:contain;display:block;}
      @media(max-width:430px){.ai-logo-row{gap:8px}.ai-logo-tile{width:58px;height:58px;border-radius:16px}}
    `;
    document.head.appendChild(style);
  };

  const createLogoRow = () => {
    const row = document.createElement('div');
    row.className = 'ai-logo-row';
    row.setAttribute('aria-label', 'AI 도구 로고');
    row.innerHTML = `
      <span class="ai-logo-tile"><img src="https://cdn.simpleicons.org/openai/111827" alt="ChatGPT 로고" loading="lazy" referrerpolicy="no-referrer"></span>
      <span class="ai-logo-tile"><img src="https://cdn.simpleicons.org/claude/D97757" alt="Claude 로고" loading="lazy" referrerpolicy="no-referrer"></span>
      <span class="ai-logo-tile"><img src="https://cdn.simpleicons.org/googlegemini/8E75B2" alt="Gemini 로고" loading="lazy" referrerpolicy="no-referrer"></span>
    `;
    return row;
  };

  const applyHeroPatch = () => {
    injectStyle();

    const brand = document.querySelector('.brand');
    if (brand && brand.textContent.trim() !== BRAND_TEXT) {
      brand.textContent = BRAND_TEXT;
    }

    const hero = document.querySelector('#screen .hero');
    if (!hero) return;

    const title = hero.querySelector('h1');
    if (title && title.textContent.includes('AI 수업') && title.textContent.trim() !== HERO_TITLE_TEXT) {
      title.textContent = HERO_TITLE_TEXT;
    }

    const summary = hero.querySelector('.result-card b');
    if (summary && summary.textContent.trim() !== SUMMARY_TEXT) {
      summary.textContent = SUMMARY_TEXT;
    }

    const hand = hero.querySelector('.big-emoji');
    if (hand) hand.remove();

    if (!hero.querySelector('.ai-logo-row')) {
      const badge = hero.querySelector('.hero-badge');
      const row = createLogoRow();
      if (badge) badge.insertAdjacentElement('afterend', row);
      else hero.insertBefore(row, hero.firstChild);
    }
  };

  let scheduled = false;
  const schedulePatch = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      applyHeroPatch();
    });
  };

  const start = () => {
    applyHeroPatch();
    const observer = new MutationObserver(schedulePatch);
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
