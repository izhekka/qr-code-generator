import type { ContentField } from './types';
import type {
  CornersSettings, DownloadSettings, LogoSettings,
  PatternSettings, QrType, StickerSettings,
} from './types';

export type Action =
  | { type: 'setQrType'; qrType: QrType }
  | { type: 'setField'; field: ContentField; value: string }
  | { type: 'setSticker'; stickerId: string | null }
  | { type: 'setStickerStyle'; patch: Partial<StickerSettings> }
  | { type: 'setPattern'; patch: Partial<PatternSettings> }
  | { type: 'setCorners'; patch: Partial<CornersSettings> }
  | { type: 'setLogo'; patch: Partial<LogoSettings> }
  | { type: 'setDownload'; patch: Partial<DownloadSettings> };