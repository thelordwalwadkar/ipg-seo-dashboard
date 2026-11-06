// node assemble.js <data.json> <out.html>  — injects data + activity list into template.html
const fs = require('fs'), path = require('path'), ExcelJS = require('exceljs');
const B = 'C:/Users/ShubhamWalwadkar/OneDrive - WorldEmp India Private Limited/SEO-GEO/Triggerize Marketeam - IPG/03. SEO - GEO/';
// [month, file date, type, activity, source file]
const ACT = [
  ['Mar 2026', '24 Mar', 'Technical', 'Full site crawl (Dutch + English) with Screaming Frog', 'Crawl-IPG-nl-en 24-03-26'],
  ['Apr 2026', '8 Apr', 'Content', 'Boiler Feed Pump “working of” article drafted', 'Working of Boiler Feed Pump.docx'],
  ['Apr 2026', '13 Apr', 'Keyword research', 'Tracked keyword list set up in Dutch and English (147 keywords) and pump-type research started', 'Dutch-English Keywords.xlsx · PumpType KWR.xlsx'],
  ['Apr 2026', '13 Apr', 'Reporting', 'Keyword zones report (top 10 / 20 / 50 / 100, Mar 2024 – Mar 2026)', 'IPG Keyword Zones.xlsx'],
  ['Apr 2026', '13 Apr', 'Technical', 'Website errors list and first findings', 'Website Errors / Errors List.docx'],
  ['Apr 2026', '13 Apr', 'On-page', 'On-page suggestions for the new Boiler Feed Pump working-principle page', 'Boiler Feed Pump Working Principle - OnPage…docx'],
  ['Apr 2026', '23 Apr', 'Technical', 'Extra crawls of the Ebara and SAER brand sections', 'Eubara.xlsx · saer crawl.xlsx'],
  ['Apr 2026', '26 Apr', 'Competitor', 'Crawl of the Xylem website for comparison', 'https-www-xylem-com-.dbseospider'],
  ['May 2026', '7 May', 'Technical', 'robots.txt snapshot and review (again 27 May)', 'robots.txt (05 May)'],
  ['May 2026', '12 May', 'Germany', 'Crawl of the German site (industrialpumpgroup.de)', 'IPG DE crawl 12-05-2026'],
  ['May 2026', '27 May', 'Technical', 'Initial findings write-up for IPG', 'Initial Findings - IPG.docx'],
  ['May 2026', '28 May', 'On-page', 'On-page recommendations for the cooling-water pump page (Koel Water Pomp)', 'SEO Onpage Recommendation - Koel Water Pomp.xlsx'],
  ['Jun 2026', '3 Jun', 'Technical', 'Schema (structured data) examples prepared', 'Schema Examples.docx'],
  ['Jun 2026', '3–8 Jun', 'Technical', 'XML sitemap, image sitemap and sitemap index regenerated; robots.txt updated', 'Sitemap 3-6-2026 / 8-6-26 · robots.txt 8-6-26'],
  ['Jun 2026', '8 Jun', 'Flygt / Xylem', 'Flygt new-products catalogue translated from French', 'CATALOGUE LOCATION 2026… translated.pdf'],
  ['Jun 2026', '10 Jun', 'Keyword research', 'Keyword research for the new Flygt pumps', 'Flygt New Pumps.xlsx'],
  ['Jul 2026', '1 Jul', 'Germany', 'German keywords clustered by topic', 'Clustered Keywords - Claude.xlsx'],
  ['Jul 2026', '13 Jul', 'Content', 'Product ID list: pages already on the web vs new products', 'MFG & Product IDs.xlsx'],
  ['Jul 2026', '15 Jul', 'Technical', 'Page speed audit (PageSpeed Insights)', 'PSI - IPG - July 26.xlsx'],
  ['Jul 2026', '16 Jul', 'Keyword research', 'Boiler Feed Pump keyword set; German keyword research (KWR - IPG German)', 'Boiler Feed Pump.xlsx · KWR - IPG German.xlsx'],
  ['Jul 2026', '21–22 Jul', 'Technical', 'Product technical details turned into schema markup', 'Original Tech details all MFGs - Schemas.xlsx · Schemas Eng.xlsx'],
  ['Jul 2026', '24 Jul', 'Analysis', 'Lowara analysis: VEG and Xylem', 'Lowara - VEG & Xylem.docx'],
  ['Aug 2026', '20 Aug', 'Technical', 'Check of wrong / broken URLs from the crawl', 'IPG Custom wrong URL.xlsx'],
  ['Aug 2026', '26 Aug', 'Keyword research', 'Master keyword research list updated (about 4,340 keywords with topics)', 'IPG Keyword Research.xlsx'],
  ['Sep 2026', '22 Sep', 'Technical', 'robots.txt snapshot and review', 'robots.txt (22-9-26)'],
  ['Sep 2026', '24–29 Sep', 'Technical', 'Custom crawl search across all pages; working file', 'custom_search_all.xlsx · Working file.xlsx'],
  ['Oct 2026', '5 Oct', 'Flygt / Xylem', 'Xylem inputs collected: 2000 series USPs, DAF rental flyer, fast-runner list', 'IPG x Xylem folder'],
  ['Oct 2026', 'by mid-Oct', 'Flygt / Xylem', 'Flygt product series and underlying product pages live (marked completed in the plan)', 'Sep - Dec 26 IPG Plan.xlsx'],
  ['Oct 2026', '21 Oct', 'Internal linking', 'Internal-linking opportunity lists: Lowara; Ebara, SAER, Flygt, centrifugal, hydro, bore, bron, API', 'Internal Linkings folder'],
  ['Oct 2026', '21 Oct', 'Content', 'Master list of all IPG URLs', 'IPG URLs.xlsx'],
  ['Oct 2026', '23–28 Oct', 'Germany', 'German competition review and German keyword research for NRW', 'Competition.xlsx · IPG_Pumps_Keyword_Research_Germany_NRW.xlsx'],
  ['Nov 2026', '3 Nov', 'Flygt / Xylem', 'IPG × Xylem × Flygt SEO content plan', 'IPG-Xylem-Flygt-SEO Content Plan.xlsx'],
  ['Nov 2026', '3 Nov', 'Planning', 'Sep – Mar plan updated', 'Sep - Dec 26 IPG Plan.xlsx'],
  ['Nov 2026', '6 Nov', 'Keyword research', 'Long-tail queries pulled from Search Console', 'Long-tail queries - IPG & WE from GSC.xlsx']
];
(async () => {
  const wb = new ExcelJS.Workbook(); await wb.xlsx.readFile(B + 'Plannig/Sep - Dec 26 IPG Plan.xlsx');
  const ws = wb.getWorksheet('Plan Final'); const v = c => { const x = c.value; return x && x.result !== undefined ? x.result : (x && x.text ? x.text : (x == null ? '' : String(x))); };
  const PLAN = [];
  ws.eachRow((row, n) => { if (n < 2) return; const g = i => String(v(row.getCell(i))).trim(); const item = g(4) || g(3); if (!g(1) || !item) return; PLAN.push([g(1), g(2), item, g(10) || g(5), g(8), g(9)]); });
  const here = __dirname; let t = fs.readFileSync(path.join(here, 'template.html'), 'utf8');
  const data = fs.readFileSync(process.argv[2], 'utf8');
  t = t.replace('__DATA__', () => data).replace('__ACT__', () => JSON.stringify(ACT)).replace('__PLAN__', () => JSON.stringify(PLAN));
  fs.writeFileSync(process.argv[3], t); console.log('plan rows', PLAN.length, 'bytes', t.length);
})();
