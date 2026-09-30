// Google Apps Script 중앙 저장 API
window.AI_SURVEY_API_URL = 'https://script.google.com/macros/s/AKfycbzc15F1HbyhUah03vg8BVX9SKyVateTfxN7lkMRMYDbwcWfg72mupp1OKOnNhWLUSsv3g/exec';

// 메인 화면 UI 보정: 브랜드명, 안내 문구, AI 로고 행, 재설문 흐름
(() => {
  const BRAND_HTML = 'AI 학습<br>동아리';
  const BRAND_TEXT = 'AI 학습 동아리';
  const HERO_TITLE_TEXT = '나에게 딱 맞게 시작해요.';
  const SUMMARY_TEXT = '10문항 · 약 3분';

  const injectStyle = () => {
    if (document.getElementById('ai-hero-logo-style')) return;
    const style = document.createElement('style');
    style.id = 'ai-hero-logo-style';
    style.textContent = `
      .brand{white-space:normal!important;word-break:keep-all;overflow-wrap:normal;line-height:1.18!important;font-size:calc(18px * var(--font-scale))!important;letter-spacing:-.035em;text-align:left;}
      .top{grid-template-columns:minmax(84px,1fr) auto!important;align-items:center!important;}
      .font-controls{gap:6px!important;padding:5px!important;}
      .font-controls .font-btn{display:none!important;}
      .font-controls .font-btn[data-font-size="small"],
      .font-controls .font-btn[data-font-size="large"]{display:inline-flex!important;align-items:center;justify-content:center;min-width:42px!important;height:36px!important;}
      .hero-badge{font-size:calc(26px * var(--font-scale))!important;}
      .ai-logo-row{display:flex;width:100%;gap:10px;align-items:stretch;justify-content:space-between;margin:18px 0 12px;}
      .ai-logo-tile{flex:1 1 0;aspect-ratio:1/1;height:auto;min-width:0;display:grid;place-items:center;background:#fff;border:1px solid var(--line);border-radius:20px;box-shadow:0 10px 26px rgba(38,48,42,.10);overflow:hidden;}
      .ai-logo-svg{width:86%;height:86%;display:block;background:transparent;}
      .ai-logo-svg.chatgpt{width:82%;height:82%;}
      .ai-logo-svg.claude{width:88%;height:88%;}
      .ai-logo-svg.gemini{width:90%;height:90%;}
      @media(max-width:430px){.top{grid-template-columns:minmax(70px,1fr) auto!important;gap:8px!important}.brand{font-size:calc(16px * var(--font-scale))!important}.ai-logo-row{gap:8px}.ai-logo-tile{border-radius:18px}.font-controls .font-btn[data-font-size="small"],.font-controls .font-btn[data-font-size="large"]{min-width:38px!important;height:34px!important}}
      body[data-font='xlarge'] .top,
      body[data-font='xxlarge'] .top{grid-template-columns:minmax(82px,1fr) auto!important;}
    `;
    document.head.appendChild(style);
  };

  const simplifyFontControls = () => {
    document.querySelectorAll('.font-controls').forEach(group => {
      const small = group.querySelector('[data-font-size="small"]');
      const large = group.querySelector('[data-font-size="large"]');
      if (small) {
        small.textContent = 'A−';
        small.setAttribute('aria-label', '글씨 작게');
      }
      if (large) {
        large.textContent = 'A+';
        large.setAttribute('aria-label', '글씨 크게');
      }
    });
  };

  const chatGptSvg = () => `
    <svg class="ai-logo-svg chatgpt" viewBox="0 0 100 100" role="img" aria-label="ChatGPT 로고" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#111827" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M50 16c10 0 17 7 17 16 0 5-2 9-5 12"/>
        <path d="M72 27c8 5 10 15 5 23-3 5-7 7-12 8"/>
        <path d="M77 55c0 10-7 17-16 17-5 0-9-2-12-5"/>
        <path d="M50 84c-10 0-17-7-17-16 0-5 2-9 5-12"/>
        <path d="M28 73c-8-5-10-15-5-23 3-5 7-7 12-8"/>
        <path d="M23 45c0-10 7-17 16-17 5 0 9 2 12 5"/>
        <path d="M37 43l13-8 13 8v14l-13 8-13-8z" stroke-width="6"/>
      </g>
    </svg>`;

  const claudeSvg = () => `
    <svg class="ai-logo-svg claude" viewBox="0 0 100 100" role="img" aria-label="Claude 로고" xmlns="http://www.w3.org/2000/svg">
      <g fill="#D97757">
        <path d="M50 10l8.4 26.4L86 27.5 66.8 50 86 72.5l-27.6-8.9L50 90l-8.4-26.4L14 72.5 33.2 50 14 27.5l27.6 8.9L50 10z"/>
        <circle cx="50" cy="50" r="12" fill="#B85C38" opacity=".28"/>
      </g>
    </svg>`;

  const geminiSvg = () => `
    <svg class="ai-logo-svg gemini" viewBox="0 0 100 100" role="img" aria-label="Gemini 로고" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="geminiGradientClean" x1="16" y1="84" x2="86" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#4285F4"/>
          <stop offset=".28" stop-color="#34A853"/>
          <stop offset=".52" stop-color="#FBBC05"/>
          <stop offset=".75" stop-color="#EA4335"/>
          <stop offset="1" stop-color="#8E75B2"/>
        </linearGradient>
        <filter id="geminiGlowClean" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="2.2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path filter="url(#geminiGlowClean)" fill="url(#geminiGradientClean)" d="M50 6c5.6 26.8 16.8 38 44 44-27.2 6-38.4 17.2-44 44C44.4 67.2 33.2 56 6 50c27.2-6 38.4-17.2 44-44z"/>
      <path fill="rgba(255,255,255,.82)" d="M50 28c3 12.2 9.8 19 22 22-12.2 3-19 9.8-22 22-3-12.2-9.8-19-22-22 12.2-3 19-9.8 22-22z"/>
    </svg>`;

  const createLogoRow = () => {
    const row = document.createElement('div');
    row.className = 'ai-logo-row';
    row.setAttribute('aria-label', 'AI 도구 로고');
    row.innerHTML = `
      <span class="ai-logo-tile">${chatGptSvg()}</span>
      <span class="ai-logo-tile">${claudeSvg()}</span>
      <span class="ai-logo-tile">${geminiSvg()}</span>
    `;
    return row;
  };

  const applyHeroPatch = () => {
    injectStyle();
    simplifyFontControls();

    const brand = document.querySelector('.brand');
    if (brand && brand.innerHTML.trim() !== BRAND_HTML) {
      brand.innerHTML = BRAND_HTML;
      brand.setAttribute('aria-label', BRAND_TEXT);
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

    const oldRow = hero.querySelector('.ai-logo-row');
    if (oldRow && !oldRow.querySelector('svg')) oldRow.remove();

    if (!hero.querySelector('.ai-logo-row')) {
      const badge = hero.querySelector('.hero-badge');
      const row = createLogoRow();
      if (badge) badge.insertAdjacentElement('afterend', row);
      else hero.insertBefore(row, hero.firstChild);
    }
  };

  const renderRepeatableHome = () => {
    const screen = document.querySelector('#screen');
    if (!screen) return;

    const progressWrap = document.querySelector('#progressWrap');
    const stepText = document.querySelector('#stepText');
    const progressBar = document.querySelector('#progressBar');
    if (progressWrap) progressWrap.classList.remove('hidden');
    if (stepText) stepText.textContent = '시작';
    if (progressBar) progressBar.style.width = '0%';

    screen.innerHTML =
      '<div class="hero">'+
        '<span class="hero-badge">🌿 AI 수업 사전 체크</span>'+
        '<div class="big-emoji">👋</div>'+
        '<h1>AI 수업,<br>나에게 딱 맞게 시작해요.</h1>'+
        '<p class="desc">시험이 아닙니다. 평소 AI 경험과 이번 수업에서 필요한 내용을 편하게 알려주세요.</p>'+
        '<div class="result-card"><b>10문항 · 약 3분</b>'+
        '<div class="note">📱 스마트폰은 수업에 꼭 필요합니다. 이미 제출한 경우에도 다시 시작할 수 있습니다.</div></div>'+
      '</div>'+
      '<div class="nav"><button class="primary" id="startBtn">설문 시작하기 →</button></div>';

    const startBtn = document.querySelector('#startBtn');
    if (startBtn) {
      startBtn.onclick = () => {
        let completed = null;
        try {
          if (typeof getCompletedSubmission === 'function') completed = getCompletedSubmission();
        } catch (e) {}

        if (completed && !confirm('이미 설문을 제출한 기록이 있습니다.\n그래도 다시 설문을 진행할까요?')) {
          return;
        }

        try { isSubmitting = false; } catch (e) {}
        try { answers = { customTools: [] }; } catch (e) {}
        try { step = 0; renderQuestion(); } catch (e) { console.error(e); }
      };
    }
    applyHeroPatch();
  };

  const replaceCompletedScreenWithHome = () => {
    const screen = document.querySelector('#screen');
    if (!screen) return;
    const text = screen.textContent || '';
    const isCompletedScreen = text.includes('이미 설문 제출이 완료되었습니다') || text.includes('이미 설문 제출');
    if (isCompletedScreen && !screen.querySelector('#startBtn')) {
      renderRepeatableHome();
    }
  };

  let scheduled = false;
  const schedulePatch = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      applyHeroPatch();
      replaceCompletedScreenWithHome();
    });
  };

  const start = () => {
    applyHeroPatch();
    replaceCompletedScreenWithHome();
    const observer = new MutationObserver(schedulePatch);
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(schedulePatch, 100);
    window.setTimeout(schedulePatch, 500);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
