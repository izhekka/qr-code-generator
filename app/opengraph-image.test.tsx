import { describe, expect, it } from 'vitest';
import ImageModule, { alt, size, contentType } from './opengraph-image';
import twitterImage from './twitter-image';

describe('OG cover image', () => {
  it('exports a static-image spec Next can prerender', () => {
    expect(alt).toBe('Free QR code generator — QR');
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe('image/png');
    expect(typeof ImageModule).toBe('function');
  });

  it('twitter-image re-exports the same image for the same card', () => {
    expect(twitterImage).toBe(ImageModule);
  });
});