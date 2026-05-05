// 柏輝木品 中繼 API - 轉發請求到 Apps Script
// 部署到 Vercel，解決 Apps Script CORS 問題

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzTIPZZU09CC0qlVMIqTC5D-MZu6xvjDayYgIvSojnLpWUWuUY/exec';

export default async function handler(req, res) {
  // 設定 CORS header，允許任何來源
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 處理 preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // 轉發到 Apps Script（用 POST + text/plain 避免 preflight）
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(req.body),
      redirect: 'follow'
    });

    const text = await response.text();

    try {
      const json = JSON.parse(text);
      return res.status(200).json(json);
    } catch {
      // Apps Script 回傳非 JSON，視為成功
      return res.status(200).json({ success: true, raw: text.substring(0, 200) });
    }

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
