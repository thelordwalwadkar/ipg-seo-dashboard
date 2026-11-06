# IPG SEO dashboard

Password-protected dashboard for industrialpumps.nl (Search Console Jan-Oct 2026, GA4 Mar-Oct 2026, keyword research).
Live site (GitHub Pages): https://thelordwalwadkar.github.io/ipg-seo-dashboard/

`index.html` is a sign-in page that holds the dashboard in encrypted form (AES-256-GCM). It only opens with the correct ID and password.
The plain dashboard and its data stay on the local machine and are not in this repository.

Rebuild locally: `node build-data.js data.json`, `node assemble.js data.json "IPG SEO Dashboard.html"`,
then `DASH_ID=... DASH_PW=... node encrypt.js "IPG SEO Dashboard.html" index.html` (needs `exceljs` for the first two).
