import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const CATEGORIES: Record<string, { icon: string; color: string }> = {
  itiraf: { icon: '🤫', color: 'rgba(147, 51, 234, 0.3)' },
  ask: { icon: '💔', color: 'rgba(236, 72, 153, 0.3)' },
  korku: { icon: '😰', color: 'rgba(107, 114, 128, 0.3)' },
  pismanlik: { icon: '😔', color: 'rgba(59, 130, 246, 0.3)' },
  umut: { icon: '🌅', color: 'rgba(245, 158, 11, 0.3)' },
  sir: { icon: '🔒', color: 'rgba(16, 185, 129, 0.3)' },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const content = searchParams.get('content') || 'Bir itiraf paylaşıldı...';
  const category = searchParams.get('category') || 'itiraf';
  const meTooCount = searchParams.get('metoo') || '0';
  const hugCount = searchParams.get('hug') || '0';

  const catInfo = CATEGORIES[category] || CATEGORIES.itiraf;

  // Truncate content if too long
  const truncatedContent = content.length > 200
    ? content.slice(0, 197) + '...'
    : content;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#08080a',
          backgroundImage: `radial-gradient(circle at 25% 25%, ${catInfo.color} 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)`,
          padding: 60,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span style={{ fontSize: 40 }}>{catInfo.icon}</span>
            <span
              style={{
                fontSize: 32,
                fontWeight: 300,
                color: 'white',
                letterSpacing: '-0.02em',
              }}
            >
              haydi hep beraber
            </span>
          </div>
          <div
            style={{
              fontSize: 20,
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            haydihepberaber.com
          </div>
        </div>

        {/* Content card */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 48,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 24,
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              fontSize: 36,
              color: 'white',
              lineHeight: 1.5,
              fontWeight: 400,
            }}
          >
            "{truncatedContent}"
          </div>
        </div>

        {/* Footer stats */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 48,
            marginTop: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 24,
            }}
          >
            <span>✋</span>
            <span>{meTooCount} ben de</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 24,
            }}
          >
            <span>🤗</span>
            <span>{hugCount} sarıldı</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
