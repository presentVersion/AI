import React, { useEffect, useRef, useState, useCallback } from 'react';

const PAGES = Array.from({ length: 8 }, (_, i) => `/assets/page-${i + 1}.jpg`);
const THUMBS = Array.from({ length: 8 }, (_, i) => `/assets/thumb-${i + 1}.jpg`);
const ASPECT_R = 595.92 / 841.92;
const N = PAGES.length;
const lastIndex = N - 1;

export default function Flipbook() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const shiftRef = useRef(null);
  const zoomRef = useRef(null);
  const pfRef = useRef(null);

  const [cur, setCur] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [layout, setLayout] = useState({ two: true, pw: 300, ph: 420 });
  const [busy, setBusy] = useState(false);
  const [thumbsOpen, setThumbsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [isHoveredOrFocused, setIsHoveredOrFocused] = useState(false);

  const stateRef = useRef({
    cur: 0,
    zoom: 1,
    tx: 0,
    ty: 0,
    layout: { two: true, pw: 300, ph: 420 },
    busy: false
  });

  stateRef.current.cur = cur;
  stateRef.current.zoom = zoom;
  stateRef.current.layout = layout;
  stateRef.current.busy = busy;

  const norm = useCallback((i) => {
    return (stateRef.current.layout.two && i > 0 && i < lastIndex && i % 2 === 0) ? i - 1 : i;
  }, []);

  const shiftFor = useCallback((i, l = stateRef.current.layout) => {
    return l.two ? (i === 0 ? -l.pw / 2 : i === lastIndex ? l.pw / 2 : 0) : 0;
  }, []);

  const setShift = useCallback((i, instant = false) => {
    const el = shiftRef.current;
    if (!el) return;
    if (instant) el.style.transition = 'none';
    el.style.transform = `translateX(${shiftFor(i)}px)`;
    if (instant) {
      void el.offsetWidth;
      el.style.transition = '';
    }
  }, [shiftFor]);

  const applyZoom = useCallback((sm = false) => {
    const stage = stageRef.current;
    const Z = zoomRef.current;
    if (!stage || !Z) return;
    const { tx, ty, zoom: z, layout: L } = stateRef.current;
    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    const bw = (L.two ? 2 : 1) * (L.pw || 0);
    const bh = L.ph || 0;
    const mx = Math.max(0, (bw * z - sw) / 2) + 40;
    const my = Math.max(0, (bh * z - sh) / 2) + 40;
    const clampedTx = Math.max(-mx, Math.min(mx, tx));
    const clampedTy = Math.max(-my, Math.min(my, ty));
    stateRef.current.tx = clampedTx;
    stateRef.current.ty = clampedTy;

    Z.style.transition = sm ? 'transform .28s ease' : 'none';
    Z.style.transform = `translate(${clampedTx}px,${clampedTy}px) scale(${z})`;
    setZoomed(z > 1.01);
  }, []);

  const zoomTo = useCallback((nz, cx = 0, cy = 0, sm = true) => {
    nz = Math.max(1, Math.min(5, nz));
    if (nz < 1.03) {
      stateRef.current.zoom = 1;
      stateRef.current.tx = 0;
      stateRef.current.ty = 0;
      setZoom(1);
    } else {
      const k = nz / stateRef.current.zoom;
      stateRef.current.tx = cx - (cx - stateRef.current.tx) * k;
      stateRef.current.ty = cy - (cy - stateRef.current.ty) * k;
      stateRef.current.zoom = nz;
      setZoom(nz);
    }
    applyZoom(sm);
  }, [applyZoom]);

  const resetZoom = useCallback(() => {
    if (stateRef.current.zoom > 1) {
      zoomTo(1, 0, 0, false);
    }
  }, [zoomTo]);

  const computeSize = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { two: true, pw: 300, ph: 420 };
    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    const px = sw > 720 ? 76 : 12;
    const py = sw > 720 ? 18 : 12;
    const two = true; // Two-page spread
    const pw = Math.max(80, Math.floor(Math.min((sw - px * 2) / (two ? 2 : 1), (sh - py * 2) * ASPECT_R)));
    const ph = Math.round(pw / ASPECT_R);
    return { two, pw, ph };
  }, []);

  // Initialize PageFlip instance
  const initPageFlip = useCallback(async () => {
    const stage = stageRef.current;
    const shift = shiftRef.current;
    if (!stage || !shift) return;

    // Dynamically load page-flip
    let St = window.St;
    if (!St) {
      try {
        const mod = await import('page-flip');
        St = mod.PageFlip ? mod : mod.default;
        if (!St?.PageFlip && window.St) St = window.St;
      } catch (err) {
        // Fallback to CDN if import fails
        if (!window.St) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        St = window.St;
      }
    }

    if (!St?.PageFlip && !window.St?.PageFlip) return;
    const PageFlipClass = St.PageFlip || window.St.PageFlip;

    const L = computeSize();
    setLayout(L);
    stateRef.current.layout = L;

    if (pfRef.current) {
      try { pfRef.current.destroy(); } catch (_) {}
      pfRef.current = null;
    }

    shift.innerHTML = '';
    const book = document.createElement('div');
    book.id = 'book';
    book.style.width = `${L.two ? L.pw * 2 : L.pw}px`;
    book.style.height = `${L.ph}px`;

    PAGES.forEach((src, idx) => {
      const pageEl = document.createElement('div');
      pageEl.className = 'page';
      if (idx === 0 || idx === lastIndex) pageEl.dataset.density = 'hard';
      const img = new Image();
      img.src = src;
      img.alt = `Brochure page ${idx + 1}`;
      img.draggable = false;
      pageEl.appendChild(img);
      book.appendChild(pageEl);
    });

    shift.appendChild(book);

    const targetCur = norm(stateRef.current.cur);

    const pf = new PageFlipClass(book, {
      width: L.pw,
      height: L.ph,
      size: 'stretch',
      minWidth: L.pw * 0.75,
      maxWidth: L.pw * 2,
      minHeight: L.ph * 0.5,
      maxHeight: L.ph * 2,
      showCover: true,
      usePortrait: false,
      startPage: targetCur,
      flippingTime: 850,
      maxShadowOpacity: 0.55,
      mobileScrollSupport: true,
      swipeDistance: 30,
      disableFlipByClick: true,
      showPageCorners: true
    });

    pf.loadFromHTML(book.querySelectorAll('.page'));

    pf.on('changeState', (e) => {
      const isFlipping = e.data === 'flipping';
      setBusy(isFlipping);
      stateRef.current.busy = isFlipping;
    });

    pf.on('flip', (e) => {
      const newCur = norm(e.data);
      setCur(newCur);
      stateRef.current.cur = newCur;
      setShift(newCur);
    });

    pfRef.current = pf;
    setShift(targetCur, true);
  }, [computeSize, norm, setShift]);

  useEffect(() => {
    initPageFlip();

    const handleResize = () => {
      const n = computeSize();
      const prevL = stateRef.current.layout;
      if (n.two !== prevL.two || Math.abs(n.pw - prevL.pw) > 3) {
        initPageFlip();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (pfRef.current) {
        try { pfRef.current.destroy(); } catch (_) {}
      }
    };
  }, [initPageFlip, computeSize]);

  // Rotate phone hint on mobile portrait
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isCoarse = window.matchMedia('(pointer:coarse)').matches || window.innerWidth < 600;
    if (window.innerWidth < window.innerHeight && isCoarse) {
      setShowHint(true);
      const timer = setTimeout(() => setShowHint(false), 5500);
      return () => clearTimeout(timer);
    }
  }, []);

  const target = (d) => {
    const { cur: c, layout: L } = stateRef.current;
    if (L.two) {
      if (d > 0) return c === 0 ? 1 : Math.min(c + 2, lastIndex);
      return c === lastIndex ? lastIndex - 2 : c === 1 ? 0 : Math.max(c - 2, 0);
    }
    return Math.max(0, Math.min(lastIndex, c + d));
  };

  const go = useCallback((d) => {
    const pf = pfRef.current;
    if (!pf || stateRef.current.busy) return;
    resetZoom();
    const t = target(d);
    if (t === stateRef.current.cur) return;
    setShift(t);
    if (d > 0) pf.flipNext('bottom');
    else pf.flipPrev('bottom');
  }, [resetZoom, setShift]);

  const jump = useCallback((i) => {
    const pf = pfRef.current;
    if (!pf || stateRef.current.busy) return;
    i = norm(i);
    setThumbsOpen(false);
    if (i === stateRef.current.cur) return;
    resetZoom();
    setShift(i);
    pf.flip(i, 'bottom');
  }, [norm, resetZoom, setShift]);

  // Pan and pinch gesture handling
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const ptr = new Map();
    let pinch = null;
    let down = null;
    let tap = { t: 0, x: 0, y: 0 };
    let lastTog = 0;

    const rel = (x, y) => {
      const r = stage.getBoundingClientRect();
      return [x - r.left - r.width / 2, y - r.top - r.height / 2];
    };

    const skip = (e) => e.target.closest && e.target.closest('.nav,#thumbs,#hint,#barwrap');

    const toggleZoom = (x, y) => {
      if (Date.now() - lastTog < 400) return;
      lastTog = Date.now();
      const [c, d] = rel(x, y);
      if (stateRef.current.zoom > 1.05) {
        zoomTo(1, 0, 0, true);
      } else {
        zoomTo(2.6, c, d, true);
      }
    };

    const onTouchStart = (e) => {
      if (e.touches.length > 1) e.stopPropagation();
    };

    const onTouchMove = (e) => {
      if (e.touches.length > 1) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    const onPointerDown = (e) => {
      if (skip(e)) return;
      ptr.set(e.pointerId, { x: e.clientX, y: e.clientY });
      down = { x: e.clientX, y: e.clientY };

      if (ptr.size === 2) {
        const [a, b] = [...ptr.values()];
        pinch = {
          d: Math.hypot(a.x - b.x, a.y - b.y) || 1,
          z0: stateRef.current.zoom,
          mx: (a.x + b.x) / 2,
          my: (a.y + b.y) / 2
        };
      } else if (stateRef.current.zoom > 1 && e.pointerType === 'mouse') {
        try { stage.setPointerCapture(e.pointerId); } catch (_) {}
      }
    };

    const onPointerMove = (e) => {
      const p = ptr.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      p.x = e.clientX;
      p.y = e.clientY;

      if (ptr.size === 2 && pinch) {
        const [a, b] = [...ptr.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        stateRef.current.tx += mx - pinch.mx;
        stateRef.current.ty += my - pinch.my;
        pinch.mx = mx;
        pinch.my = my;
        const [c, k] = rel(mx, my);
        zoomTo((pinch.z0 * d) / pinch.d, c, k, false);
      } else if (ptr.size === 1 && stateRef.current.zoom > 1) {
        stateRef.current.tx += dx;
        stateRef.current.ty += dy;
        applyZoom(false);
      }
    };

    const onPointerUp = (e) => {
      if (!ptr.has(e.pointerId)) return;
      ptr.delete(e.pointerId);
      if (ptr.size < 2) pinch = null;
      if (e.type === 'pointerup' && e.pointerType !== 'mouse' && down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 12) {
        const n = Date.now();
        if (n - tap.t < 320 && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 40) {
          toggleZoom(e.clientX, e.clientY);
          tap.t = 0;
        } else {
          tap = { t: n, x: e.clientX, y: e.clientY };
        }
      }
    };

    const onDblClick = (e) => {
      if (!skip(e)) toggleZoom(e.clientX, e.clientY);
    };

    const onWheel = (e) => {
      if (skip(e) || !e.ctrlKey) return;
      e.preventDefault();
      const [c, d] = rel(e.clientX, e.clientY);
      zoomTo(stateRef.current.zoom * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.002)), c, d, false);
    };

    stage.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
    stage.addEventListener('touchmove', onTouchMove, { capture: true, passive: false });
    stage.addEventListener('pointerdown', onPointerDown, true);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', onPointerUp);
    stage.addEventListener('pointercancel', onPointerUp);
    stage.addEventListener('dblclick', onDblClick);
    stage.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      stage.removeEventListener('touchstart', onTouchStart, { capture: true });
      stage.removeEventListener('touchmove', onTouchMove, { capture: true });
      stage.removeEventListener('pointerdown', onPointerDown, true);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', onPointerUp);
      stage.removeEventListener('pointercancel', onPointerUp);
      stage.removeEventListener('dblclick', onDblClick);
      stage.removeEventListener('wheel', onWheel);
    };
  }, [applyZoom, zoomTo]);

  // Keyboard controls: ONLY active when hovered or focused within #flip!
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isHoveredOrFocused) return;
      const k = e.key;
      if (k === 'ArrowRight' || k === 'PageDown') {
        e.preventDefault();
        go(1);
      } else if (k === 'ArrowLeft' || k === 'PageUp') {
        e.preventDefault();
        go(-1);
      } else if (k === '+' || k === '=') {
        e.preventDefault();
        zoomTo(stateRef.current.zoom * 1.5, 0, 0, true);
      } else if (k === '-') {
        e.preventDefault();
        zoomTo(stateRef.current.zoom / 1.5, 0, 0, true);
      } else if (k === '0') {
        e.preventDefault();
        zoomTo(1, 0, 0, true);
      } else if (k === 'f' || k === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (k === 'Escape') {
        setThumbsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHoveredOrFocused, go, zoomTo]);

  const toggleFullscreen = () => {
    const d = document;
    const el = containerRef.current;
    if (d.fullscreenElement || d.webkitFullscreenElement) {
      (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    } else if (el) {
      (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
    }
  };

  const isSpread = layout.two && cur > 0 && cur < lastIndex;
  const pageLabel = (isSpread ? `${cur + 1}–${cur + 2}` : cur + 1) + ' / ' + N;

  return (
    <div
      ref={containerRef}
      id="flip"
      tabIndex={0}
      onMouseEnter={() => setIsHoveredOrFocused(true)}
      onMouseLeave={() => setIsHoveredOrFocused(false)}
      onFocus={() => setIsHoveredOrFocused(true)}
      onBlur={() => setIsHoveredOrFocused(false)}
    >
      <main id="stage" ref={stageRef} className={zoomed ? 'zoomed' : ''}>
        <div id="zoom" ref={zoomRef}>
          <div id="shift" ref={shiftRef} />
        </div>
        <div id="pan" />

        <button
          className="nav"
          id="prev"
          aria-label="Previous page"
          disabled={cur <= 0}
          onClick={() => go(-1)}
        >
          <svg className="i" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
        </button>

        <button
          className="nav"
          id="next"
          aria-label="Next page"
          disabled={cur >= lastIndex}
          onClick={() => go(1)}
        >
          <svg className="i" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
        </button>

        <div id="hint" className={showHint ? '' : 'out'} onClick={() => setShowHint(false)}>
          <svg className="i" viewBox="0 0 24 24">
            <rect x="7" y="2" width="10" height="20" rx="2" />
            <path d="M11 18h2" />
          </svg>
          <span>Rotate your phone sideways for bigger pages</span>
        </div>

        <div id="thumbs" className={thumbsOpen ? 'open' : ''}>
          {THUMBS.map((src, i) => {
            const active = i === cur || (isSpread && i === cur + 1);
            return (
              <button
                key={i}
                className={`th ${active ? 'on' : ''}`}
                aria-label={`Go to page ${i + 1}`}
                onClick={() => jump(i)}
              >
                <img alt="" src={src} />
                <span>{i + 1}</span>
              </button>
            );
          })}
        </div>
      </main>

      <div id="barwrap">
        <nav id="bar" aria-label="Flipbook Controls">
          <button
            className="b"
            id="bprev"
            aria-label="Previous page"
            disabled={cur <= 0}
            onClick={() => go(-1)}
          >
            <svg className="i" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
          </button>

          <span id="label">{pageLabel}</span>

          <button
            className="b"
            id="bnext"
            aria-label="Next page"
            disabled={cur >= lastIndex}
            onClick={() => go(1)}
          >
            <svg className="i" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
          </button>

          <span className="sep" />

          <button
            className={`b ${thumbsOpen ? 'on' : ''}`}
            id="bthumbs"
            aria-label="All pages"
            onClick={() => setThumbsOpen(!thumbsOpen)}
          >
            <svg className="i" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>

          <button
            className="b"
            id="zout"
            aria-label="Zoom out"
            disabled={zoom <= 1.01}
            onClick={() => zoomTo(zoom / 1.5, 0, 0, true)}
          >
            <svg className="i" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3M8 11h6" />
            </svg>
          </button>

          <button
            className="b"
            id="zin"
            aria-label="Zoom in"
            disabled={zoom >= 4.99}
            onClick={() => zoomTo(zoom * 1.5, 0, 0, true)}
          >
            <svg className="i" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3M11 8v6M8 11h6" />
            </svg>
          </button>

          <button
            className="b"
            id="fs"
            aria-label="Fullscreen"
            onClick={toggleFullscreen}
          >
            <svg className="i" viewBox="0 0 24 24">
              <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
}
