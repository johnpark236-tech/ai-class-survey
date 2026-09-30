// Google Apps Script 중앙 저장 API
window.AI_SURVEY_API_URL = 'https://script.google.com/macros/s/AKfycbzc15F1HbyhUah03vg8BVX9SKyVateTfxN7lkMRMYDbwcWfg72mupp1OKOnNhWLUSsv3g/exec';

// 메인 화면 UI 보정: 브랜드명, 안내 문구, 재설문 흐름
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
      .ai-logo-spacer{display:block;width:100%;height:calc(92px * var(--font-scale));max-height:116px;min-height:74px;margin:18px 0 12px;}
      @media(max-width:430px){.top{grid-template-columns:minmax(70px,1fr) auto!important;gap:8px!important}.brand{font-size:calc(16px * var(--font-scale))!important}.font-controls .font-btn[data-font-size="small"],.font-controls .font-btn[data-font-size="large"]{min-width:38px!important;height:34px!important}.ai-logo-spacer{height:82px;min-height:70px;margin:16px 0 10px;}}
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

  const createLogoSpacer = () => {
    const spacer = document.createElement('div');
    spacer.className = 'ai-logo-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    return spacer;
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

    hero.querySelectorAll('.ai-logo-row').forEach(row => row.remove());

    if (!hero.querySelector('.ai-logo-spacer')) {
      const badge = hero.querySelector('.hero-badge');
      const spacer = createLogoSpacer();
      if (badge) badge.insertAdjacentElement('afterend', spacer);
      else hero.insertBefore(spacer, hero.firstChild);
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
