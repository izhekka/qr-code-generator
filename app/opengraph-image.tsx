import { ImageResponse } from 'next/og';

export const alt = 'Free QR code generator — QR';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          background: 'linear-gradient(135deg, #23234f 0%, #4b3d99 60%, #7b5cd6 100%)',
          color: '#ffffff',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700 }}>QR</div>
        <div style={{ fontSize: 40 }}>Free QR code generator</div>
      </div>
    ),
    size,
  );
}