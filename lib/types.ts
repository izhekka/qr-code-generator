export type QrType = 'link' | 'text' | 'email' | 'call';

export type ContentField = 'link' | 'text' | 'phone' | 'emailTo' | 'emailSubject' | 'emailBody';

export interface Content {
  type: QrType;
  link: string;
  text: string;
  email: { to: string; subject: string; body: string };
  phone: string;
}

export type DotType =
  | 'square' | 'dots' | 'rounded'
  | 'classy' | 'classy-rounded' | 'extra-rounded';

export type CornerSquareType = 'square' | 'dot' | 'extra-rounded';
export type CornerDotType = 'square' | 'dot';

export interface PatternSettings {
  dotType: DotType;
  color: string;
  gradient: boolean;
  colorFrom: string;
  colorTo: string;
  bgColor: string;
  transparentBg: boolean;
  bgGradient: boolean;
  bgFrom: string;
  bgTo: string;
}

export interface CornersSettings {
  squareType: CornerSquareType;
  squareColor: string;
  dotType: CornerDotType;
  dotColor: string;
}

export interface LogoSettings {
  dataUrl: string | null;
  /** 0.1–0.5 in 10% steps — percent of the QR's dot area the logo covers (see compose.logoGeometry; ≤30% scans reliably). */
  size: number;
}

export type DownloadFormat = 'png' | 'jpeg' | 'svg' | 'webp';

export interface DownloadSettings {
  format: DownloadFormat;
  size: 512 | 1024 | 2048;
}

export interface StickerSettings {
  /** Frame and sticker art color. */
  color: string;
  /** Sticker label text color. */
  textColor: string;
}

export interface Settings {
  content: Content;
  stickerId: string | null;
  sticker: StickerSettings;
  pattern: PatternSettings;
  corners: CornersSettings;
  logo: LogoSettings;
  download: DownloadSettings;
}