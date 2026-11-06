// node encrypt.js "<plain dashboard.html>" "<out index.html>"   (env: DASH_ID, DASH_PW)
// Encrypts the dashboard with AES-256-GCM (key = PBKDF2 of id+password) and wraps it in a login page.
// The ID and password are never written to any file; only the encrypted data ships.
const fs = require('fs'), { webcrypto: c } = require('crypto');
const ITER = 250000;
(async () => {
  const id = process.env.DASH_ID, pw = process.env.DASH_PW;
  if (!id || !pw) throw new Error('Set DASH_ID and DASH_PW');
  const plain = fs.readFileSync(process.argv[2]);
  const salt = c.getRandomValues(new Uint8Array(16)), iv = c.getRandomValues(new Uint8Array(12));
  const base = await c.subtle.importKey('raw', Buffer.from(id + ':' + pw), 'PBKDF2', false, ['deriveKey']);
  const key = await c.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const ct = Buffer.from(await c.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
  const payload = JSON.stringify({ s: Buffer.from(salt).toString('base64'), i: Buffer.from(iv).toString('base64'), n: ITER, d: ct.toString('base64') });
  const tpl = fs.readFileSync(__dirname + '/login-template.html', 'utf8');
  fs.writeFileSync(process.argv[3], tpl.replace('__PAYLOAD__', () => payload));
  console.log('encrypted', plain.length, '->', ct.length, 'bytes');
})();
