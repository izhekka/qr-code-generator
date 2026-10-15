import { describe, expect, it } from 'vitest';
import { getSticker, listStickers } from './stickers';

describe('sticker registry', () => {
  it('exposes 7 stickers and resolves by id', () => {
    expect(listStickers()).toHaveLength(7);
    expect(getSticker('phone')?.id).toBe('phone');
    expect(getSticker('nope')).toBeNull();
    expect(getSticker(null)).toBeNull();
  });

  it.each(listStickers().map((s) => [s.id, s] as const))(
    '%s: frame() returns svg markup with a label when given one',
    (_id, s) => {
      const svg = s.frame('SCAN ME');
      expect(svg).toContain('SCAN ME');
      // every frame stays inside the 1000×1000 canvas
      expect(svg).toContain('viewBox="0 0 1000 1000"');
      if (s.label) expect(s.frame('SCAN ME')).toContain(s.label ?? '');
    },
  );

  it('background: defines an interior fill region for every sticker', () => {
    for (const s of listStickers()) {
      expect(s.interior, `${s.id} interior`).toMatch(/^M[-\d.hvlLZaA ]+Z$/); // a fillable closed path
    }
  });

  it('thumbs embed a fake QR area at the requested pixel size', () => {
    expect(getSticker('square')!.thumb(64, 'SCAN ME')).toContain('width="64"');
  });

  it('thumbs draw the mini QR with the real QR quiet zone', () => {
    const bag = getSticker('bag')!;
    const svg = bag.thumb(64, 'SCAN ME');
    const minX = Math.min(...[...svg.matchAll(/<rect x="([\d.]+)"/g)].map((m) => +m[1]));
    expect(minX).toBeGreaterThanOrEqual(bag.qrRect.x + 0.065 * bag.qrRect.w - 0.5);
  });

  it('thumbs keep every mini-QR dot strictly inside the circle interior', () => {
    // the circle is the tightest frame: the unchecked QR box corners poke past
    // its border, so every dot corner must sit inside the interior radius
    const circle = getSticker('circle')!;
    const svg = circle.thumb(64, 'SCAN ME');
    const cells = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)"/g)]
      .map((m) => ({ x: +m[1], y: +m[2], w: +m[3] }));
    expect(cells.length).toBeGreaterThan(0);
    for (const c of cells) {
      for (const [cx, cy] of [[c.x, c.y], [c.x + c.w, c.y], [c.x, c.y + c.w], [c.x + c.w, c.y + c.w]] as const) {
        expect(Math.hypot(cx - 500, cy - 500), `dot corner ${cx},${cy}`).toBeLessThan(458);
      }
    }
  });

  it('frame and thumb take custom colors, defaulting to the ink', () => {
    const bag = getSticker('bag')!;
    expect(bag.frame('SCAN ME')).toContain('stroke="#111827"');
    const colored = bag.frame('SCAN ME', { stroke: '#aa0000', text: '#00aa55' });
    expect(colored).toContain('stroke="#aa0000"');
    expect(colored).toContain('fill="#00aa55"');
    expect(bag.thumb(64, 'SCAN ME', { stroke: '#aa0000', text: '#00aa55' })).toContain('stroke="#aa0000"');
  });

  it("topbar keeps its white label on the chosen bar color", () => {
    const topbar = getSticker('topbar')!;
    const frame = topbar.frame('SCAN ME', { stroke: '#123456', text: '#abcdef' });
    expect(frame).toContain('fill="#123456"'); // the bar takes the sticker color
    expect(frame).toContain('fill="#ffffff"'); // its label stays readable
  });

  // The library draws QR content inset ~6.5% inside its box; the composition
  // plots that box at qrRect over frames drawn in a 0..1000 canvas. The content
  // must stay strictly inside each frame's art and clear of labels.
  const contentBox = (r: { x: number; y: number; w: number }) => {
    const m = 0.065 * r.w;
    return { left: r.x + m, right: r.x + r.w - m, top: r.y + m, bottom: r.y + r.w - m };
  };

  describe('layout fits inside each frame', () => {
    it('bag: QR content stays inside the walls, label sits above the bottom line', () => {
      const bag = getSticker('bag')!;
      const box = contentBox(bag.qrRect);
      expect(box.top).toBeGreaterThan(272); // bag line y=260 plus half its stroke
      expect(box.bottom).toBeLessThan(908); // inner edge of the bag bottom line
      expect(bag.frame('SCAN ME')).toMatch(/<text[^>]*y="87\d"/); // not on the 920 line
    });

    it('phone: label baseline clears the speaker bar below it', () => {
      const phone = getSticker('phone')!;
      const frame = phone.frame('SCAN ME');
      expect(frame).toMatch(/<rect x="360" y="930"/); // bar below the 920 baseline zone
      expect(frame).toMatch(/<text[^>]*y="920"/); // label keeps the standard band
    });

    it('square, rounded, circle, clipboard: QR content stays clear of the label band', () => {
      for (const id of ['square', 'rounded', 'circle', 'clipboard']) {
        const s = getSticker(id)!;
        const box = contentBox(s.qrRect);
        expect(box.bottom, `${id}: content bottom`).toBeLessThan(840); // label glyphs start ≈848
      }
    });
  });
});