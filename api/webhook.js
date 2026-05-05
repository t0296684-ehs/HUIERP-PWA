// 柏輝木品 中繼 API - 轉發請求到 Apps Script

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzTIPZZU09CC0qlVMIqTC5D-MZu6xvjDayYgIvSojnLpWUWuUY/exec';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    // Vercel 自動 parse JSON body，直接用 req.body
    const bodyStr = JSON.stringify(req.body);
    console.log('收到 body:', bodyStr.substring(0, 200));

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: bodyStr,
      redirect: 'follow'
    });

    const text = await response.text();
    console.log('Apps Script 回應:', text.substring(0, 300));

    try {
      return res.status(200).json(JSON.parse(text));
    } catch {
      return res.status(200).json({ success: true, raw: text.substring(0, 200) });
    }

  } catch (err) {
    console.error('轉發錯誤:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
