import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Sebastian Kolbusz - Senior Frontend Engineer'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// eslint-disable-next-line no-restricted-syntax -- Next.js requires default export for dynamic OG images
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#161616',
        padding: '80px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            marginBottom: '24px',
          }}
        >
          <span
            style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#161616',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            SK
          </span>
        </div>
        <span
          style={{
            fontSize: '72px',
            fontWeight: 700,
            color: '#faf9f5',
            fontFamily: 'Georgia, serif',
            letterSpacing: '-0.02em',
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          Sebastian Kolbusz
        </span>
        <span
          style={{
            fontSize: '32px',
            fontWeight: 400,
            color: '#10B981',
            fontFamily: 'monospace',
            letterSpacing: '0.05em',
            textAlign: 'center',
          }}
        >
          Senior Frontend Engineer
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '60px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <div
          style={{ width: '48px', height: '4px', backgroundColor: '#10B981', borderRadius: '2px' }}
        />
        <span
          style={{
            fontSize: '20px',
            color: '#a3a3a3',
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
          }}
        >
          kolbusz.xyz
        </span>
      </div>
    </div>,
    {
      ...size,
    }
  )
}
