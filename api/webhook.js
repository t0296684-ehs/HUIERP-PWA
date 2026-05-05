// 柏輝木品 中繼 API v2 - 轉發請求到 Apps Script

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzTIPZZU09CC0qlVMIqTC5D-MZu6xvjDayYgIvSojnLpWUWuUY/exec';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    // 讀取原始 body（不依賴自動 parse，確保內容完整）
    const rawBody = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });

    // 轉發到 Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: rawBody,
      redirect: 'follow'
    });

    const text = await response.text();

    try {
      return res.status(200).json(JSON.parse(text));
    } catch {
      return res.status(200).json({ success: true, raw: text.substring(0, 200) });
    }

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
