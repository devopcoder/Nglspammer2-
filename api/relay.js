export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') return res.status(200).json({ ok: true, relay: 'vercel', ts: Date.now() });
  if (req.method !== 'POST') return res.status(405).json({ ok: false, msg: 'POST only' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = Object.fromEntries(new URLSearchParams(body)); }
  }
  if (!body || typeof body !== 'object') body = {};

  const username = String(body.username || '').trim();
  const message  = String(body.message  || 'Hi');
  if (!username || username.includes('/') || username.includes(' ')) {
    return res.status(400).json({ ok: false, msg: 'bad username' });
  }

  const UAS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  ];
  const ua = UAS[Math.floor(Math.random() * UAS.length)];

  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });

  const payload = new URLSearchParams({
    username, question: message, deviceId: uuid, gameSlug: '', referrer: '',
  }).toString();

  let status = 0, text = '', err = '';
  try {
    const r = await fetch('https://ngl.link/api/submit?_=' + Date.now(), {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://ngl.link',
        'Referer': 'https://ngl.link/' + username,
        'User-Agent': ua,
      },
      body: payload,
    });
    status = r.status;
    text = (await r.text()).slice(0, 300);
  } catch (e) {
    err = String(e);
  }

  return res.status(200).json({ ok: status === 200, status, body: text, error: err });
}
