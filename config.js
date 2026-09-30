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

// 강사 관리 화면: 학습자 선택 후 설문 내용 복사
(() => {
  const STYLE_ID = 'admin-learner-copy-style';
  const COPY_BUTTON_ID = 'copySelectedLearnersBtn';
  const HEADER_COPY_BUTTON_ID = 'copySelectedLearnersHeaderBtn';
  const SELECT_ALL_ID = 'selectAllLearnersForCopy';

  const injectAdminCopyStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .learner-select-head,.learner-select-cell{width:58px!important;min-width:58px!important;text-align:center!important;vertical-align:middle!important;}
      .learner-copy-check{width:22px;height:22px;accent-color:var(--accent);cursor:pointer;}
      .learner-name-head-wrap{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap;}
      .learner-copy-btn{border:1px solid var(--accent);background:var(--accent2);color:#32483a;border-radius:10px;padding:7px 10px;font-size:calc(12px * var(--font-scale));font-weight:800;cursor:pointer;white-space:nowrap;}
      .learner-copy-btn:hover{filter:brightness(.98);transform:translateY(-1px);}
      .learner-copy-selected{background:#f3f7f4!important;}
      @media(max-width:430px){.learner-select-head,.learner-select-cell{width:50px!important;min-width:50px!important}.learner-copy-check{width:24px;height:24px}.learner-copy-btn{padding:8px 10px}}
    `;
    document.head.appendChild(style);
  };

  const getAdminRecords = () => {
    try {
      if (typeof API_URL !== 'undefined' && API_URL && typeof adminRows !== 'undefined') {
        return adminRows || [];
      }
    } catch (e) {}
    try {
      if (typeof getResponses === 'function') return getResponses().slice().reverse();
    } catch (e) {}
    return [];
  };

  const normalizeList = value => {
    if (Array.isArray(value)) return value.filter(Boolean).join(', ');
    return String(value || '').split(' | ').filter(Boolean).join(', ');
  };

  const recordLine = (label, value) => `${label}: ${value && String(value).trim() ? String(value).trim() : '미응답'}`;

  const buildRecordText = (record, index) => {
    const lines = [];
    lines.push(`[학습자 ${index + 1}]`);
    lines.push(recordLine('이름', record.name));
    lines.push(recordLine('접수일시', record.createdAt));
    lines.push(recordLine('분류', record.level));
    lines.push(recordLine('디지털기기 사용', record.digital));
    lines.push(recordLine('AI 사용 빈도', record.aiExp));
    lines.push(recordLine('사용 AI', normalizeList(record.tools)));
    lines.push(recordLine('질문·수정 수준', record.prompt));
    lines.push(recordLine('활용 희망', normalizeList(record.purpose)));
    lines.push(recordLine('직접 해본 활동', normalizeList(record.done)));
    lines.push(recordLine('검증 습관', record.verify));
    lines.push(recordLine('배우고 싶은 것', normalizeList(record.learn)));
    lines.push(recordLine('노트북 지참', record.practice));
    lines.push(recordLine('수업 목표', record.goal));
    return lines.join('\n');
  };

  const buildCopyText = records => {
    const body = records.map((record, index) => buildRecordText(record, index)).join('\n\n');
    return `${body}\n\n위 학습자들에 맞게 수업 교안 작성해줘.`;
  };

  const copyToClipboard = async text => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'readonly');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  };

  const showMessage = msg => {
    try {
      if (typeof toast === 'function') {
        toast(msg);
        return;
      }
    } catch (e) {}
    alert(msg);
  };

  const getSelectedRecords = () => {
    const records = getAdminRecords();
    const selected = [];
    document.querySelectorAll('#adminBody .learner-copy-check:checked').forEach(input => {
      const index = Number(input.dataset.recordIndex);
      if (!Number.isNaN(index) && records[index]) selected.push(records[index]);
    });
    return selected;
  };

  const copySelectedLearners = async () => {
    const selected = getSelectedRecords();
    if (!selected.length) {
      showMessage('복사할 학습자를 먼저 체크해 주세요.');
      return;
    }
    try {
      await copyToClipboard(buildCopyText(selected));
      showMessage(`${selected.length}명의 설문 내용을 복사했습니다.`);
    } catch (e) {
      console.error(e);
      showMessage('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const bindSelectAll = () => {
    const selectAll = document.getElementById(SELECT_ALL_ID);
    if (!selectAll) return;
    selectAll.onchange = () => {
      document.querySelectorAll('#adminBody .learner-copy-check').forEach(input => {
        input.checked = selectAll.checked;
        const row = input.closest('tr');
        if (row) row.classList.toggle('learner-copy-selected', input.checked);
      });
    };
  };

  const updateSelectAllState = () => {
    const selectAll = document.getElementById(SELECT_ALL_ID);
    if (!selectAll) return;
    const checks = Array.from(document.querySelectorAll('#adminBody .learner-copy-check'));
    const checked = checks.filter(input => input.checked);
    selectAll.checked = checks.length > 0 && checked.length === checks.length;
    selectAll.indeterminate = checked.length > 0 && checked.length < checks.length;
  };

  const patchAdminTable = () => {
    injectAdminCopyStyle();

    const adminShell = document.querySelector('#adminShell');
    const table = adminShell && adminShell.querySelector('table');
    const theadRow = table && table.querySelector('thead tr');
    const tbody = document.querySelector('#adminBody');
    if (!adminShell || !table || !theadRow || !tbody) return;

    const toolbar = adminShell.querySelector('.admin-toolbar');
    if (toolbar && !document.getElementById(COPY_BUTTON_ID)) {
      const btn = document.createElement('button');
      btn.className = 'mini';
      btn.id = COPY_BUTTON_ID;
      btn.type = 'button';
      btn.textContent = '선택 복사';
      btn.onclick = copySelectedLearners;
      toolbar.insertBefore(btn, toolbar.firstChild);
    }

    if (!theadRow.querySelector('.learner-select-head')) {
      const nameHead = Array.from(theadRow.children).find(th => th.textContent.trim().includes('이름'));
      const selectHead = document.createElement('th');
      selectHead.className = 'learner-select-head';
      selectHead.innerHTML = `<input id="${SELECT_ALL_ID}" class="learner-copy-check" type="checkbox" aria-label="전체 학습자 선택">`;
      if (nameHead) theadRow.insertBefore(selectHead, nameHead);
      else theadRow.insertBefore(selectHead, theadRow.firstChild);
      bindSelectAll();
    }

    const nameHead = Array.from(theadRow.children).find(th => th.textContent.trim().includes('이름'));
    if (nameHead && !document.getElementById(HEADER_COPY_BUTTON_ID)) {
      const labelText = nameHead.textContent.trim().replace('선택 복사', '').trim() || '이름';
      nameHead.innerHTML = `<div class="learner-name-head-wrap"><span>${labelText}</span><button id="${HEADER_COPY_BUTTON_ID}" class="learner-copy-btn" type="button">선택 복사</button></div>`;
      document.getElementById(HEADER_COPY_BUTTON_ID).onclick = copySelectedLearners;
    }

    Array.from(tbody.querySelectorAll('tr')).forEach((row, index) => {
      if (row.querySelector('td[colspan]')) return;
      if (!row.querySelector('.learner-select-cell')) {
        const cell = document.createElement('td');
        cell.className = 'learner-select-cell';
        cell.innerHTML = `<input class="learner-copy-check" type="checkbox" data-record-index="${index}" aria-label="${index + 1}번째 학습자 선택">`;
        const nameCell = row.children[1] || row.firstElementChild;
        if (nameCell) row.insertBefore(cell, nameCell);
        else row.appendChild(cell);
      } else {
        const input = row.querySelector('.learner-copy-check');
        if (input) input.dataset.recordIndex = String(index);
      }

      const input = row.querySelector('.learner-copy-check');
      if (input && !input.dataset.boundCopySelect) {
        input.dataset.boundCopySelect = '1';
        input.onchange = () => {
          row.classList.toggle('learner-copy-selected', input.checked);
          updateSelectAllState();
        };
      }
    });

    updateSelectAllState();
  };

  let scheduled = false;
  const scheduleAdminPatch = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      patchAdminTable();
    });
  };

  const start = () => {
    patchAdminTable();
    const observer = new MutationObserver(scheduleAdminPatch);
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(scheduleAdminPatch, 200);
    window.setTimeout(scheduleAdminPatch, 800);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
