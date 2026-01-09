import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#08080a',
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
        }}
      >
        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Emoji */}
          <div style={{ fontSize: 80, marginBottom: 20 }}>🤫</div>

          {/* Title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 200,
              color: 'white',
              letterSpacing: '-0.02em',
              marginBottom: 16,
            }}
          >
            haydi hep beraber
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 28,
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: 40,
            }}
          >
            Anonim İtiraf Platformu
          </div>

          {/* Tagline */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 32px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ fontSize: 24, color: 'rgba(255, 255, 255, 0.8)' }}>
              Kimseye söyleyemediğin şeyi buraya bırak
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: 40,
              marginTop: 40,
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>✍️</span>
              <span>Binlerce itiraf</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>✋</span>
              <span>Yalnız değilsin</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🔒</span>
              <span>%100 Anonim</span>
            </div>
          </div>
        </div>

        {/* URL at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 20,
            color: 'rgba(139, 92, 246, 0.8)',
          }}
        >
          haydihepberaber.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
