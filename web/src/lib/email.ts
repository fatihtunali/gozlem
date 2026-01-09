import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = 'bildirim@haydihepberaber.com';
const SITE_URL = 'https://haydihepberaber.com';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  if (!resend) {
    console.warn('RESEND_API_KEY not configured, skipping email');
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Email send error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
}

export async function sendCommentNotification(
  email: string,
  truthContent: string,
  commentContent: string,
  secretCode: string
): Promise<boolean> {
  const truncatedTruth = truthContent.length > 100
    ? truthContent.slice(0, 100) + '...'
    : truthContent;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #08080a; color: #fff; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; }
    .logo { text-align: center; font-size: 24px; font-weight: 200; margin-bottom: 30px; color: #e0e0e0; }
    .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin-bottom: 20px; }
    .label { font-size: 12px; color: #888; margin-bottom: 8px; }
    .content { font-size: 16px; line-height: 1.6; color: #e0e0e0; }
    .comment { background: rgba(147, 51, 234, 0.1); border-left: 3px solid #9333ea; padding: 12px 16px; border-radius: 0 8px 8px 0; }
    .button { display: inline-block; background: linear-gradient(to right, #9333ea, #3b82f6); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin-top: 20px; }
    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
    .footer a { color: #9333ea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">haydi hep beraber</div>

    <div class="card">
      <div class="label">Itirafin:</div>
      <div class="content">"${truncatedTruth}"</div>
    </div>

    <div class="card">
      <div class="label">Yeni yorum:</div>
      <div class="comment">
        <div class="content">${commentContent}</div>
      </div>
    </div>

    <div style="text-align: center;">
      <a href="${SITE_URL}/yonet?kod=${secretCode}" class="button">Itirafini Yonet</a>
    </div>

    <div class="footer">
      <p>Bu e-postayi aliyorsun cunku itirafina yorum bildirimi actin.</p>
      <p><a href="${SITE_URL}/yonet?kod=${secretCode}">Bildirimleri kapat</a></p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
haydi hep beraber

Itirafina yeni bir yorum geldi!

Itirafin: "${truncatedTruth}"

Yeni yorum: ${commentContent}

Itirafini yonetmek icin: ${SITE_URL}/yonet?kod=${secretCode}
  `;

  return sendEmail({
    to: email,
    subject: 'Itirafina yeni yorum geldi!',
    html,
    text,
  });
}

export async function sendWeeklyDigest(
  email: string,
  truths: Array<{
    content: string;
    me_too_count: number;
    hug_count: number;
    category: string;
  }>
): Promise<boolean> {
  const categoryEmojis: Record<string, string> = {
    itiraf: '🤫',
    ask: '💔',
    korku: '😰',
    pismanlik: '😔',
    umut: '🌅',
    sir: '🔒',
  };

  const truthsHtml = truths.map((t, i) => `
    <div class="card">
      <div class="rank">#${i + 1}</div>
      <div class="category">${categoryEmojis[t.category] || '✨'} ${t.category}</div>
      <div class="content">"${t.content.slice(0, 150)}${t.content.length > 150 ? '...' : ''}"</div>
      <div class="stats">✋ ${t.me_too_count} ben de • 🤗 ${t.hug_count} sarildi</div>
    </div>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #08080a; color: #fff; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; }
    .logo { text-align: center; font-size: 24px; font-weight: 200; margin-bottom: 10px; color: #e0e0e0; }
    .subtitle { text-align: center; font-size: 14px; color: #888; margin-bottom: 30px; }
    .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; margin-bottom: 16px; }
    .rank { font-size: 24px; font-weight: bold; color: #9333ea; margin-bottom: 8px; }
    .category { font-size: 12px; color: #888; margin-bottom: 8px; }
    .content { font-size: 16px; line-height: 1.6; color: #e0e0e0; margin-bottom: 12px; }
    .stats { font-size: 14px; color: #888; }
    .button { display: block; text-align: center; background: linear-gradient(to right, #9333ea, #3b82f6); color: white; padding: 16px 24px; border-radius: 12px; text-decoration: none; font-weight: 500; margin-top: 24px; }
    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
    .footer a { color: #9333ea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">haydi hep beraber</div>
    <div class="subtitle">Bu haftanin en cok etkilesim alan itiraflari</div>

    ${truthsHtml}

    <a href="${SITE_URL}" class="button">Tum Itiraflari Gor</a>

    <div class="footer">
      <p>Her hafta en populer itiraflari sana gonderiyoruz.</p>
      <p><a href="${SITE_URL}/abonelik-iptal">Aboneligi iptal et</a></p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: email,
    subject: 'Bu haftanin en populer itiraflari',
    html,
  });
}
