// Builds data.json for the IPG dashboard from GSC (Q, LP), GA4 and keyword research files.
// usage: node build-data.js <out.json>   (needs exceljs on NODE_PATH)
const fs = require('fs'), ExcelJS = require('exceljs');
const D = 'C:/Users/ShubhamWalwadkar/Downloads/';
const K = 'C:/Users/ShubhamWalwadkar/OneDrive - WorldEmp India Private Limited/SEO-GEO/Triggerize Marketeam - IPG/03. SEO - GEO/Keyword Research/2026/4 Apr/';
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const NM = 10;
const mi = s => MON.indexOf(s.slice(0, 3));
function csv(path) {
  const t = fs.readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
  const rows = []; let r = [], f = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c == '"') { if (t[i + 1] == '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c == '"') q = true;
    else if (c == ',') { r.push(f); f = ''; }
    else if (c == '\n' || c == '\r') { if (c == '\r' && t[i + 1] == '\n') i++; r.push(f); f = ''; if (r.length > 1 || r[0] !== '') rows.push(r); r = []; }
    else f += c;
  }
  if (f || r.length) { r.push(f); rows.push(r); }
  return rows;
}
const norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
const BR = [['Lowara', /lowara/], ['Grundfos', /grundfos/], ['Wilo', /\bwilo/], ['Flygt', /flygt/], ['Ebara', /ebara/], ['SAER', /\bsaer\b/], ['Homa', /\bhoma\b/], ['Vogel', /vogel/], ['Metso', /metso/], ['Seepex', /seepex/], ['Grindex', /grindex/], ['Sulzer', /sulzer/], ['Netzsch', /netzsch/], ['Xylem', /xylem/], ['Goulds', /goulds/]];
const PT = [['Dompelpomp', /dompel|vuilwater|submersible/], ['Bronpomp', /bronpomp|bron pomp|bronwater|bron water|bronnering/], ['Centrifugaalpomp', /centrifug/], ['Membraanpomp', /membraan|diaphragm/], ['Wormpomp', /wormpomp|worm pomp|excentrisch/], ['Lobbenpomp', /lobben|lobe pump/], ['Meertrapspomp', /meertraps|multistage/], ['Hydrofoor', /hydrofoor|drukverhog/], ['Beregeningspomp', /beregening/], ['Slurrypomp', /slurry/], ['Blok-/Inline-/Insteekpomp', /blokpomp|inline|insteek/], ['Waterpomp', /waterpomp|water pomp/], ['Overige pompen', /pomp|pump/]];
function topic(q, brandFlag) {
  q = norm(q);
  for (const [n, r] of BR) if (r.test(q)) return { t: n, k: 'Brand' };
  if (brandFlag === 'IPG Brand' || /\bipg\b|industrial ?pump/.test(q)) return { t: 'IPG (own brand)', k: 'IPG' };
  for (const [n, r] of PT) if (r.test(q)) return { t: n, k: 'Pump type' };
  return { t: 'Other / unclassified', k: 'Other' };
}
const TOP = [...BR.map(x => [x[0], 'Brand']), ['IPG (own brand)', 'IPG'], ...PT.map(x => [x[0], 'Pump type']), ['Other / unclassified', 'Other']];
const UPT = [['Dompelpomp', /dompel|submersible/], ['Bronpomp', /bron/], ['Centrifugaalpomp', /centrifug/], ['Membraanpomp', /membraan|diaphragm/], ['Wormpomp', /wormpomp|worm/], ['Lobbenpomp', /lobben/], ['Meertrapspomp', /meertraps|multistage/], ['Hydrofoor', /hydrofoor|drukverhog/], ['Beregeningspomp', /beregening|sprinkler/]];
function utopic(u) {
  u = u.toLowerCase();
  const m = u.match(/merken\/([a-z0-9-]+)/);
  if (m) { for (const [n, r] of BR) if (r.test(m[1])) return { t: n, k: 'Brand' }; }
  if (u === '/' || u === '/en/home' || u === '/en') return { t: 'Homepage', k: 'Other' };
  for (const [n, r] of BR) if (r.test(u)) return { t: n, k: 'Brand' };
  for (const [n, r] of UPT) if (r.test(u)) return { t: n, k: 'Pump type' };
  if (/revisie|onderhoud|overhaul|service/.test(u)) return { t: 'Revisie & service', k: 'Service' };
  if (/kenniscentrum|knowledge|nieuws|news|pompschool|blog/.test(u)) return { t: 'Knowledge & news', k: 'Content' };
  if (/webshop/.test(u)) return { t: 'Webshop (other)', k: 'Shop' };
  return { t: 'Other pages', k: 'Other' };
}
const zero = () => Array(NM).fill(0);
(async () => {
  const qr = csv(D + 'IPG GSC_GSC Performance_Table Jan-OCt 2026 - Q.csv'); qr.shift();
  const qm = new Map(); const totC = zero(), totI = zero();
  for (const r of qr) {
    const m = mi(r[0]); if (m < 0) continue;
    const q = norm(r[1]); let o = qm.get(q);
    if (!o) { o = { cl: zero(), im: zero(), ps: zero(), b: r[2] }; qm.set(q, o); }
    const c = +r[3], i = +r[4], p = +r[5];
    o.cl[m] += c; o.im[m] += i; o.ps[m] += p * i; totC[m] += c; totI[m] += i;
  }
  const lr = csv(D + 'IPG GSC_GSC Performance_Table Jan-OCt 2026 - LP.csv'); lr.shift();
  const lp = new Map(); const lpC = zero(), lpI = zero();
  for (const r of lr) {
    const m = mi(r[0]); if (m < 0) continue;
    const u = r[1].replace('https://industrialpumps.nl', '') || '/';
    let o = lp.get(u); if (!o) { o = { cl: zero(), im: zero(), ps: zero() }; lp.set(u, o); }
    o.cl[m] += +r[2]; o.im[m] += +r[3]; o.ps[m] += (+r[4]) * (+r[3]); lpC[m] += +r[2]; lpI[m] += +r[3];
  }
  console.log('Q clicks/mo', totC.join(','), '\nLP clicks/mo', lpC.join(','), '\nQ impr', totI.join(','), '\nLP impr', lpI.join(','));
  console.log('queries', qm.size, 'pages', lp.size);
  const val = v => v && v.result !== undefined ? v.result : (v && v.text ? v.text : v);
  let wb = new ExcelJS.Workbook(); await wb.xlsx.readFile(K + 'Dutch-English Keywords.xlsx');
  const selMap = new Map(); let selRaw = 0;
  wb.getWorksheet(1).eachRow((row, n) => { if (n > 1) { const nl = norm(val(row.getCell(1).value)); if (nl) { selRaw++; if (!selMap.has(nl)) selMap.set(nl, String(val(row.getCell(2).value) || '')); } } });
  wb = new ExcelJS.Workbook(); await wb.xlsx.readFile(K + 'IPG Keyword Research.xlsx');
  const full = new Map();
  wb.getWorksheet('MasterSheet').eachRow((row, n) => { if (n > 1) { const k = norm(val(row.getCell(3).value)); if (!k) return; if (!full.has(k)) full.set(k, { sv: +val(row.getCell(5).value) || 0 }); } });
  console.log('selected unique', selMap.size, 'of', selRaw, '| full', full.size);
  const pos = (q, m) => { const o = qm.get(q); return o && o.im[m] > 0 ? o.ps[m] / o.im[m] : null; };
  const ZB = [3, 10, 20, 50, 100];
  function zones(set) { const out = []; for (let m = 0; m < NM; m++) { const z = [0, 0, 0, 0, 0]; let vis = 0; for (const k of set) { const p = pos(k, m); if (p != null) { vis++; ZB.forEach((b, i) => { if (p <= b + 1e-4) z[i]++; }); } } out.push({ z, vis }); } return out; }
  const selKeys = [...selMap.keys()], fullKeys = [...full.keys()];
  const zSel = zones(selKeys), zFull = zones(fullKeys);
  console.log('sel zones', JSON.stringify(zSel.map(x => x.z)), '\nfull zones last', JSON.stringify(zFull[9]));
  const selRows = selKeys.map(k => {
    const o = qm.get(k); const t = topic(k);
    return { k, en: selMap.get(k), t: t.t, sv: (full.get(k) || {}).sv ?? null, p: Array.from({ length: NM }, (_, m) => { const p = pos(k, m); return p == null ? null : Math.round(p * 10) / 10; }), c: o ? o.cl : zero(), i: o ? o.im : zero() };
  });
  const T = {};
  TOP.forEach(([n, k]) => T[n] = { n, kind: k, kw: 0, sv: 0, sel: 0, cl: zero(), im: zero(), ps: zero(), z: Array.from({ length: NM }, () => [0, 0, 0, 0, 0]), vis: zero(), qn: 0 });
  for (const [q, o] of qm) { const t = topic(q, o.b); const x = T[t.t]; x.qn++; for (let m = 0; m < NM; m++) { x.cl[m] += o.cl[m]; x.im[m] += o.im[m]; x.ps[m] += o.ps[m]; } }
  for (const [k, v] of full) { const x = T[topic(k).t]; x.kw++; x.sv += v.sv; for (let m = 0; m < NM; m++) { const p = pos(k, m); if (p != null) { x.vis[m]++; ZB.forEach((b, i) => { if (p <= b + 1e-4) x.z[m][i]++; }); } } }
  for (const k of selKeys) T[topic(k).t].sel++;
  const topics = Object.values(T).filter(x => x.kw || x.qn).map(x => ({ ...x, pos: x.ps.map((s, m) => x.im[m] ? Math.round(s / x.im[m] * 10) / 10 : null), ps: undefined }));
  const LT = {}; const pages = [];
  for (const [u, o] of lp) {
    const t = utopic(u);
    const x = LT[t.t] || (LT[t.t] = { n: t.t, kind: t.k, pages: 0, cl: zero(), im: zero(), ps: zero() });
    x.pages++; for (let m = 0; m < NM; m++) { x.cl[m] += o.cl[m]; x.im[m] += o.im[m]; x.ps[m] += o.ps[m]; }
    pages.push({ u, t: t.t, f: o.im.findIndex(v => v > 0), cl: o.cl, im: o.im, p: o.im.map((v, m) => v ? Math.round(o.ps[m] / v * 10) / 10 : null) });
  }
  const ltopics = Object.values(LT).map(x => ({ ...x, pos: x.ps.map((s, m) => x.im[m] ? Math.round(s / x.im[m] * 10) / 10 : null), ps: undefined }));
  const gr = csv(D + 'download (15).csv');
  const mrow = gr.find(r => r[0] === 'Month'); const lrow = gr.findIndex(r => r[0] === 'Landing page');
  const gtot = zero(); const ga = {};
  for (let i = lrow + 1; i < gr.length; i++) {
    const r = gr[i]; if (r.length < 5) continue; const u = r[0];
    const row = zero(); for (let c = 1; c < mrow.length - 2; c += 2) { const m = +mrow[c] - 1; if (m >= 0 && m < NM) row[m] = +r[c + 1] || 0; }
    if (u === '') { row.forEach((v, m) => gtot[m] = v); continue; }
    const t = utopic(u); const x = ga[t.t] || (ga[t.t] = { n: t.t, kind: t.k, s: zero(), pages: [] });
    row.forEach((v, m) => x.s[m] += v); x.pages.push({ u, s: row });
  }
  console.log('GA4 monthly', gtot.join(','));
  const out = { months: MON, totals: { cl: totC, im: totI, lpcl: lpC, lpim: lpI }, zSel, zFull, selN: selKeys.length, selRaw, fullN: fullKeys.length, selRows, topics, ltopics, pages, ga: Object.values(ga), gtot };
  fs.writeFileSync(process.argv[2], JSON.stringify(out));
  console.log('topics', topics.map(t => t.n + ':' + t.kw + '/' + t.qn + '/' + t.cl.reduce((a, b) => a + b)).join(' | '));
  console.log('ltopics', ltopics.map(t => t.n + ':' + t.pages + '/' + t.cl.reduce((a, b) => a + b)).join(' | '));
  const nw = zero(); pages.forEach(p => { if (p.f >= 0) nw[p.f]++; }); console.log('pages first seen by month', nw.join(','));
  console.log('bytes', fs.statSync(process.argv[2]).size);
})();
