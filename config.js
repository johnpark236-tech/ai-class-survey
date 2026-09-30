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
      .brand{white-space:nowrap;word-break:keep-all;overflow-wrap:normal;}
      .hero-badge{font-size:calc(26px * var(--font-scale))!important;}
      .ai-logo-row{display:flex;gap:10px;align-items:center;margin:18px 0 10px;}
      .ai-logo-tile{width:calc(64px * var(--font-scale));height:calc(64px * var(--font-scale));max-width:86px;max-height:86px;min-width:54px;min-height:54px;display:grid;place-items:center;background:#fff;border:1px solid var(--line);border-radius:18px;box-shadow:0 8px 22px rgba(38,48,42,.08);overflow:hidden;}
      .ai-logo-tile img{width:68%;height:68%;object-fit:contain;display:block;}
      .ai-logo-fallback{font-size:calc(18px * var(--font-scale));font-weight:900;line-height:1;color:#111827;}
      @media(max-width:430px){.ai-logo-row{gap:8px}.ai-logo-tile{width:58px;height:58px;border-radius:16px}.brand{font-size:calc(13px * var(--font-scale))!important;}}
    `;
    document.head.appendChild(style);
  };

  const logoImg = (src, alt, fallback) => {
    return `<span class="ai-logo-tile"><img src="${src}" alt="${alt}" loading="lazy" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'ai-logo-fallback',textContent:'${fallback}'}))"></span>`;
  };

  const createLogoRow = () => {
    const row = document.createElement('div');
    row.className = 'ai-logo-row';
    row.setAttribute('aria-label', 'AI 도구 로고');
    row.innerHTML = `
      ${logoImg('https://cdn.simpleicons.org/openai/111827', 'ChatGPT 로고', 'GPT')}
      ${logoImg('https://cdn.simpleicons.org/claude/D97757', 'Claude 로고', 'C')}
      ${logoImg('https://cdn.simpleicons.org/googlegemini/8E75B2', 'Gemini 로고', 'G')}
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
