import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  return res.status(200).json({
    status: 'online',
    appName: 'РАБОТА ТҶ',
    version: '2.2.0',
    supportedRegions: 'Все страны СНГ (10 государств)',
    serverSideAdminAuth: true,
    supabaseStatus: process.env.VITE_SUPABASE_ANON_KEY ? 'cloud_connected' : 'ready_for_credentials',
    supabaseUrl: 'https://ygnbitwwflzyfhjktlje.supabase.co',
    googleOAuthStatus: 'ready',
    adSenseReady: true,
    timestamp: new Date().toISOString(),
  });
}
