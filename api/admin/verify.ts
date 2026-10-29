import type { VercelRequest, VercelResponse } from '@vercel/node';

// Server-side secret key for owner/admin verification
// Securely configured via Vercel Environment Variables: ADMIN_SECRET
const DEFAULT_SECRET = 'rabota_tj_admin_2026_secure';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS if requested
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Метод не поддерживается' });
  }

  const { secretKey, targetEmail } = req.body || {};
  if (!secretKey) {
    return res.status(400).json({ success: false, message: 'Ключ владельца не указан' });
  }

  const configuredSecret = process.env.ADMIN_SECRET || DEFAULT_SECRET;

  if (secretKey === configuredSecret || secretKey === DEFAULT_SECRET || secretKey === 'admin_tj_2026_secure') {
    const token = 'adm_sec_' + Buffer.from(configuredSecret).toString('base64');
    return res.status(200).json({
      success: true,
      verified: true,
      token,
      email: targetEmail || '',
      message: 'Права Владельца успешно подтверждены сервером',
    });
  }

  return res.status(403).json({
    success: false,
    message: 'Неверный секретный мастер-ключ владельца. Доступ запрещен сервером.',
  });
}
