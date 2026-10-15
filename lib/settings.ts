import type { Action } from './actions';
import type { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  content: { type: 'link', link: '', text: '', email: { to: '', subject: '', body: '' }, phone: '' },
  stickerId: null,
  sticker: { color: '#111827', textColor: '#111827' },
  pattern: {
    dotType: 'square', color: '#23234f',
    gradient: false, colorFrom: '#23234f', colorTo: '#7b5cd6',
    bgColor: '#ffffff', transparentBg: false,
    bgGradient: false, bgFrom: '#dbeafe', bgTo: '#ede9fe',
  },
  corners: { squareType: 'square', squareColor: '#23234f', dotType: 'square', dotColor: '#23234f' },
  logo: { dataUrl: null, size: 0.3, hideBackgroundDots: true },
  download: { format: 'png', size: 1024 },
};

export function settingsReducer(state: Settings, action: Action): Settings {
  switch (action.type) {
    case 'setQrType':
      return { ...state, content: { ...state.content, type: action.qrType } };
    case 'setField':
      switch (action.field) {
        case 'link': return { ...state, content: { ...state.content, link: action.value } };
        case 'text': return { ...state, content: { ...state.content, text: action.value } };
        case 'phone': return { ...state, content: { ...state.content, phone: action.value } };
        case 'emailTo': return { ...state, content: { ...state.content, email: { ...state.content.email, to: action.value } } };
        case 'emailSubject': return { ...state, content: { ...state.content, email: { ...state.content.email, subject: action.value } } };
        case 'emailBody': return { ...state, content: { ...state.content, email: { ...state.content.email, body: action.value } } };
      }
    case 'setSticker': return { ...state, stickerId: action.stickerId };
    case 'setStickerStyle': return { ...state, sticker: { ...state.sticker, ...action.patch } };
    case 'setPattern': return { ...state, pattern: { ...state.pattern, ...action.patch } };
    case 'setCorners': return { ...state, corners: { ...state.corners, ...action.patch } };
    case 'setLogo': return { ...state, logo: { ...state.logo, ...action.patch } };
    case 'setDownload': return { ...state, download: { ...state.download, ...action.patch } };
  }
}