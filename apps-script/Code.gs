const SPREADSHEET_ID = '1ZKMdeEOcNBdhdQtfUKAykair8e653QTuTJd5l03ngr8';
const SHEET_NAME = '응답';
const ADMIN_PASSWORD_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'; // 1234

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function hash_(value) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(value || ''),
    Utilities.Charset.UTF_8
  );
  return bytes.map(function(b) {
    const v = b < 0 ? b + 256 : b;
    return ('0' + v.toString(16)).slice(-2);
  }).join('');
}

function sheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) throw new Error('응답 시트를 찾을 수 없습니다.');
  return sh;
}

function doGet() {
  return json_({ ok: true, service: 'ai-class-survey', status: 'ready' });
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = body.action || 'submit';

    if (action === 'submit') return submit_(body.record || {});
    if (action === 'list') return list_(body.password || '');
    if (action === 'clear') return clear_(body.password || '');

    return json_({ ok: false, error: 'unknown_action' });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function submit_(r) {
  if (!r.id || !r.name) return json_({ ok: false, error: 'missing_required_fields' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();
    const last = sh.getLastRow();
    if (last > 1) {
      const ids = sh.getRange(2, 2, last - 1, 1).getDisplayValues().flat();
      if (ids.indexOf(String(r.id)) !== -1) {
        return json_({ ok: true, duplicate: true, id: r.id });
      }
    }

    sh.appendRow([
      new Date(),
      r.id || '',
      r.name || '',
      r.level || '',
      r.digital || '',
      r.aiExp || '',
      Array.isArray(r.tools) ? r.tools.join(' | ') : (r.tools || ''),
      r.prompt || '',
      Array.isArray(r.purpose) ? r.purpose.join(' | ') : (r.purpose || ''),
      Array.isArray(r.done) ? r.done.join(' | ') : (r.done || ''),
      r.retry || '',
      r.verify || '',
      Array.isArray(r.learn) ? r.learn.join(' | ') : (r.learn || ''),
      r.practice || '', // Q10 노트북 지참 여부
      r.expect || '',
      r.goal || ''
    ]);
    return json_({ ok: true, id: r.id });
  } finally {
    lock.releaseLock();
  }
}

function requireAdmin_(password) {
  if (hash_(password) !== ADMIN_PASSWORD_HASH) {
    throw new Error('unauthorized');
  }
}

function list_(password) {
  requireAdmin_(password);
  const sh = sheet_();
  const last = sh.getLastRow();
  if (last < 2) return json_({ ok: true, records: [] });

  const values = sh.getRange(2, 1, last - 1, 16).getDisplayValues();
  const records = values.map(function(v) {
    return {
      createdAt: v[0], id: v[1], name: v[2], level: v[3],
      digital: v[4], aiExp: v[5],
      tools: v[6] ? v[6].split(' | ') : [],
      prompt: v[7],
      purpose: v[8] ? v[8].split(' | ') : [],
      done: v[9] ? v[9].split(' | ') : [],
      retry: v[10], verify: v[11], learn: v[12],
      practice: v[13], expect: v[14], goal: v[15]
    };
  });
  return json_({ ok: true, records: records });
}

function clear_(password) {
  requireAdmin_(password);
  const sh = sheet_();
  const last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, 16).clearContent();
  return json_({ ok: true });
}
