import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Default themes for each day of the week
const DEFAULT_THEMES = [
  { title: 'Pazar Sırları', description: 'Hafta sonu itirafları', category: 'sir' },
  { title: 'Pazartesi Pişmanlıkları', description: 'Hafta başı iç dökmeler', category: 'pismanlik' },
  { title: 'Salı Aşkları', description: 'Kalp konuşuyor', category: 'ask' },
  { title: 'Çarşamba Korkuları', description: 'En derin korkular', category: 'korku' },
  { title: 'Perşembe İtirafları', description: 'Söylenmemiş gerçekler', category: 'itiraf' },
  { title: 'Cuma Umutları', description: 'Yarına dair umutlar', category: 'umut' },
  { title: 'Cumartesi Sırları', description: 'Gizli kalmış hikayeler', category: 'sir' },
];

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Try to get today's theme from database
    const result = await pool.query(
      `SELECT title, description, category FROM daily_themes WHERE theme_date = $1`,
      [today]
    );

    if (result.rows.length > 0) {
      return NextResponse.json(result.rows[0]);
    }

    // Return default theme based on day of week
    const dayOfWeek = new Date().getDay();
    return NextResponse.json(DEFAULT_THEMES[dayOfWeek]);
  } catch (error) {
    console.error('Failed to fetch theme:', error);
    // Return default on error
    const dayOfWeek = new Date().getDay();
    return NextResponse.json(DEFAULT_THEMES[dayOfWeek]);
  }
}
