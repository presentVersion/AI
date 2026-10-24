import React, { useEffect, useRef, useState } from 'react';

// Adjusted conductor coordinates measured on 660x660 artwork (0 to 1)
const K = 1 / 0.8955;
const P = (x, y) => [(130 + x * K - 135) / 660, (90 + y * K - 68) / 660];
const R = (a, b) => [a * K / 660, b * K / 660];

// Tuned points: localized arms and coat, leaving head (0.44-0.54, 0.22-0.38) undisturbed
const pt = {
  SR: P(322, 274),  // Right shoulder hinge
  CR: P(365, 235),  // Right arm / baton region
  RR: R(44, 52),    // Right arm radius
  SL: P(282, 268),  // Left shoulder hinge
  CL: P(260, 290),  // Left arm region
  RL: R(36, 54),    // Left arm radius
  CC: P(205, 395),  // Coat tail center
  RC: R(75, 42)     // Coat tail radius
};

const TIP = P(391, 190);
const BEAT = 5.6;
const beatA = (t) => Math.sin(t * BEAT) + 0.3 * Math.sin(2 * t * BEAT + 0.6);

const NOTE_GLYPHS = ['♪', '♫', '♩'];
const CODE_TOKENS = ['</>', '{ }', '=>', '0101', 'agent()', 'prompt', 'n8n'];
const PALETTE = ['#eef0ff', '#2fd6e8', '#b9a4ff'];

export default function Hero({ onRegisterClick, onBrochureClick }) {
  const heroRef = useRef(null);
  const flowRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const videoRef = useRef(null);

  const [hasVideo, setHasVideo] = useState(true);
  const [webGlReady, setWebGlReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduceMotion(rm);
  }, []);

  // Video playback management & intersection pause
  useEffect(() => {
    const video = videoRef.current;
    const hero = heroRef.current;
    if (!video || !hero) return;

    if (reduceMotion) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [reduceMotion, hasVideo]);

  // TASK 5b: Minimal Dreamy Music + Code Overlay ("Your Lie in April" mood)
  useEffect(() => {
    const hero = heroRef.current;
    const fl = flowRef.current;
    const cv = canvasRef.current;
    const img = imgRef.current;
    if (!hero || !fl) return;

    const f = fl.getContext('2d');
    let W = 0;
    let H = 0;
    let vis = true;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const io = new IntersectionObserver(([entry]) => {
      vis = entry.isIntersecting;
    });
    io.observe(hero);

    const fit = () => {
      const D = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth;
      H = hero.clientHeight;
      fl.width = W * D;
      fl.height = H * D;
      f.setTransform(D, 0, 0, D, 0, 0);
    };

    const ro = new ResizeObserver(fit);
    ro.observe(hero);
    fit();

    const isMobile = window.innerWidth <= 768;

    // 4 quiet, thinned dashed lanes (alpha 0.10 - 0.18, 1px width)
    const lanes = [
      { y: 0.22, a: 0.035, k: 1.15, s: 0.18, p: 0.4, dash: [18, 14], c: '#b9a4ff', alpha: 0.12 },
      { y: 0.42, a: 0.045, k: 0.95, s: 0.22, p: 1.8, dash: [24, 16], c: '#2fd6e8', alpha: 0.11 },
      { y: 0.62, a: 0.040, k: 1.25, s: 0.16, p: 3.2, dash: [14, 18], c: '#eef0ff', alpha: 0.14 },
      { y: 0.82, a: 0.030, k: 1.05, s: 0.20, p: 4.6, dash: [20, 20], c: '#8b5cf6', alpha: 0.10 }
    ];

    const laneY = (L, x, t) =>
      H * (L.y + L.a * Math.sin((x / (W || 1)) * 3.14 * L.k + t * L.s + L.p) + 0.025 * Math.sin((x / (W || 1)) * 4.2 + t * 0.12));

    // Staff ribbon: 5 parallel lines curving across lower hero like floating sheet music
    const staffY = (x, t) =>
      H * (0.76 + 0.045 * Math.sin((x / (W || 1)) * 2.8 + t * 0.18) + 0.02 * Math.sin((x / (W || 1)) * 5.1 - t * 0.09));

    // Musical notes floating like petals
    const noteCount = isMobile ? 6 : 12;
    const notes = Array.from({ length: noteCount }, (_, i) => ({
      glyph: NOTE_GLYPHS[i % NOTE_GLYPHS.length],
      x: Math.random() * (W || 1000),
      y: (0.15 + Math.random() * 0.75) * (H || 600),
      size: 14 + Math.random() * 12,
      vx: (isMobile ? 12 : 18) + Math.random() * 16,
      vy: -10 - Math.random() * 15,
      rot: (Math.random() - 0.5) * 0.21,
      rotSpeed: (Math.random() - 0.5) * 0.6,
      waveFreq: 0.008 + Math.random() * 0.006,
      waveAmp: 16 + Math.random() * 18,
      baseAlpha: 0.25 + Math.random() * 0.20,
      color: PALETTE[i % PALETTE.length],
      onStaff: i % 3 === 0,
      seed: Math.random() * 100
    }));

    // Code fragments (tiny monospace tokens, 11px, alpha 0.12 - 0.25)
    const codeCount = isMobile ? 4 : 8;
    const codes = Array.from({ length: codeCount }, (_, i) => ({
      token: CODE_TOKENS[i % CODE_TOKENS.length],
      x: Math.random() * (W || 1000),
      y: (0.2 + Math.random() * 0.7) * (H || 600),
      vx: 14 + Math.random() * 14,
      vy: -6 - Math.random() * 10,
      waveFreq: 0.006 + Math.random() * 0.005,
      waveAmp: 12 + Math.random() * 14,
      baseAlpha: 0.12 + Math.random() * 0.12,
      color: PALETTE[(i + 1) % PALETTE.length],
      seed: Math.random() * 100
    }));

    // 20 soft glowing motes that drift upward & twinkle
    const motes = Array.from({ length: 20 }, () => ({
      x: Math.random() * (W || 1000),
      y: Math.random() * (H || 600),
      size: 1 + Math.random() * 1.2,
      vx: 4 + Math.random() * 8,
      vy: -12 - Math.random() * 18,
      twinkleSpeed: 1.2 + Math.random() * 2,
      twinkleOffset: Math.random() * Math.PI * 2,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)]
    }));

    // Baton release queue
    const batonNotes = [];
    let lastBatonNote = 0;

    const tip = (t) => {
      const ang = 0.11 * beatA(t) * 0.8;
      const s = Math.sin(ang);
      const k = Math.cos(ang);
      const d = [TIP[0] - pt.SR[0], TIP[1] - pt.SR[1]];
      const u = pt.SR[0] + k * d[0] - s * d[1];
      const v = pt.SR[1] + s * d[0] + k * d[1];
      const artEl = hero.querySelector('.art');
      if (!artEl) return [W * 0.72, H * 0.38];
      const r = artEl.getBoundingClientRect();
      const h = hero.getBoundingClientRect();
      return [r.left - h.left + u * r.width, r.top - h.top + v * r.height];
    };

    // Keep-clear zone calculation
    const getClearMultiplier = (x, y) => {
      // 1. Text column / Title / Buttons protection: fade everything down to 25%
      if (x < W * 0.46) {
        if (y > H * 0.25 && y < H * 0.78) return 0.22;
        return 0.32;
      }

      // 2. Conductor artwork protection: keep central 60% of artwork fully clear
      const artEl = hero.querySelector('.art');
      if (artEl) {
        const r = artEl.getBoundingClientRect();
        const h = hero.getBoundingClientRect();
        const ax = r.left - h.left + r.width * 0.5;
        const ay = r.top - h.top + r.height * 0.5;
        const rad = r.width * 0.30; // 60% central circle
        const dist = Math.hypot(x - ax, y - ay);
        if (dist < rad) {
          return 0; // completely hidden over conductor
        }
        if (dist < rad * 1.35) {
          return (dist - rad) / (rad * 0.35); // soft falloff
        }
      }

      // 3. Mobile screen protection: keep notes in outer 15% edges
      if (isMobile && x > W * 0.15 && x < W * 0.85 && y > H * 0.18 && y < H * 0.82) {
        return 0.18;
      }

      return 1.0;
    };

    // Static frame for reduced motion
    const drawStatic = () => {
      f.clearRect(0, 0, W, H);
      f.lineCap = 'round';
      const t = 1.2;

      // Staff ribbon
      f.strokeStyle = '#b9a4ff';
      f.globalAlpha = 0.12;
      f.lineWidth = 1;
      for (let line = -2; line <= 2; line++) {
        f.beginPath();
        for (let x = 0; x <= W; x += 16) {
          const y = staffY(x, t) + line * 6.5;
          x === 0 ? f.moveTo(x, y) : f.lineTo(x, y);
        }
        f.stroke();
      }

      // A few peaceful, faint static notes
      f.font = '20px Lora, Georgia, serif';
      const staticNotes = [
        { g: '♪', x: W * 0.88, y: H * 0.32, a: 0.3 },
        { g: '♫', x: W * 0.78, y: H * 0.72, a: 0.35 },
        { g: '♩', x: W * 0.62, y: H * 0.84, a: 0.28 },
        { g: '♪', x: W * 0.92, y: H * 0.65, a: 0.26 }
      ];
      staticNotes.forEach((n) => {
        f.fillStyle = '#b9a4ff';
        f.globalAlpha = n.a;
        f.fillText(n.g, n.x, n.y);
      });
      f.globalAlpha = 1;
    };

    if (reduce) {
      drawStatic();
      return;
    }

    // Performance watchdog
    let slowFrames = 0;
    let disabledDueToPerf = false;

    // WebGL conductor warp fallback
    let gl = null;
    let ready = false;
    let ut = null;

    if (cv && img) {
      try {
        gl = cv.getContext('webgl', { alpha: true, antialias: false });
        if (gl) {
          const VS = 'attribute vec2 p;varying vec2 v;void main(){v=p;gl_Position=vec4(p.x*2.-1.,1.-p.y*2.,0.,1.);}';
          const FS = `
            #ifdef GL_FRAGMENT_PRECISION_HIGH
            precision highp float;
            #else
            precision mediump float;
            #endif
            varying vec2 v;
            uniform sampler2D T;
            uniform float t;
            uniform vec2 SR,CR,RR,SL,CL,RL,CC,RC;

            vec2 rot(vec2 p, vec2 c, float a) {
              vec2 d = p - c;
              float s = sin(a), k = cos(a);
              return c + vec2(k * d.x - s * d.y, s * d.x + k * d.y);
            }
            float g(vec2 p, vec2 c, vec2 r) {
              vec2 d = (p - c) / r;
              return exp(-dot(d, d));
            }

            void main() {
              vec2 p = v;
              float b = t * ${BEAT.toFixed(1)};
              float a = sin(b) + 0.3 * sin(2.0 * b + 0.6);

              vec2 headCenter = vec2(0.48, 0.28);
              vec2 headDist = abs(p - headCenter) / vec2(0.08, 0.10);
              float headProtect = smoothstep(0.7, 1.2, length(headDist));

              float wr = g(p, CR, RR) * smoothstep(SR.x - 0.01, SR.x + 0.05, p.x) * headProtect;
              p = rot(p, SR, -0.11 * a * wr);

              float wl = g(p, CL, RL) * smoothstep(SL.x + 0.01, SL.x - 0.04, p.x) * headProtect;
              p = rot(p, SL, 0.08 * sin(b + 1.2) * wl);

              float wcoat = g(p, CC, RC);
              p.y += 0.005 * sin(p.x * 22.0 - t * 3.0) * wcoat;

              gl_FragColor = texture2D(T, p);
            }
          `;

          const compile = (ty, src) => {
            const sh = gl.createShader(ty);
            gl.shaderSource(sh, src);
            gl.compileShader(sh);
            return sh;
          };

          const pr = gl.createProgram();
          gl.attachShader(pr, compile(gl.VERTEX_SHADER, VS));
          gl.attachShader(pr, compile(gl.FRAGMENT_SHADER, FS));
          gl.linkProgram(pr);

          if (gl.getProgramParameter(pr, gl.LINK_STATUS)) {
            gl.useProgram(pr);
            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
            const aPos = gl.getAttribLocation(pr, 'p');
            gl.enableVertexAttribArray(aPos);
            gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

            for (const n in pt) {
              const loc = gl.getUniformLocation(pr, n);
              if (loc) gl.uniform2f(loc, pt[n][0], pt[n][1]);
            }
            ut = gl.getUniformLocation(pr, 't');

            const tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            const uploadTex = () => {
              if (img.naturalWidth) {
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                ready = true;
                setWebGlReady(true);
              }
            };

            if (img.complete && img.naturalWidth) uploadTex();
            else img.addEventListener('load', uploadTex);
          }
        }
      } catch (_) {
        gl = null;
      }
    }

    let rafId = 0;
    let t0 = performance.now();
    let last = t0;

    const renderOverlay = (now) => {
      if (disabledDueToPerf) return;

      const frameStart = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = (now - t0) / 1000;

      if (!vis || document.hidden) {
        rafId = requestAnimationFrame(renderOverlay);
        return;
      }

      f.clearRect(0, 0, W, H);
      f.lineCap = 'round';

      // 1. Draw 4 thin, quiet dashed lanes (alpha 0.10 - 0.18, 1px)
      for (const L of lanes) {
        f.beginPath();
        for (let x = -10; x <= W + 10; x += 16) {
          const y = laneY(L, x, t);
          x < 0 ? f.moveTo(x, y) : f.lineTo(x, y);
        }
        f.setLineDash(L.dash);
        f.lineDashOffset = -t * 18;
        f.strokeStyle = L.c;
        f.globalAlpha = L.alpha;
        f.lineWidth = 1;
        f.stroke();
      }
      f.setLineDash([]);

      // 2. Staff Ribbon: 5 delicate parallel lines (alpha ~0.12)
      f.strokeStyle = '#b9a4ff';
      f.globalAlpha = 0.12;
      f.lineWidth = 1;
      for (let line = -2; line <= 2; line++) {
        f.beginPath();
        for (let x = -10; x <= W + 10; x += 16) {
          const y = staffY(x, t) + line * 6.5;
          x < 0 ? f.moveTo(x, y) : f.lineTo(x, y);
        }
        f.stroke();
      }

      // 3. Baton Tip Note Generation (every 3.6s, a note rises and joins the flow)
      if (t - lastBatonNote > 3.6) {
        lastBatonNote = t;
        const [bx, by] = tip(t);
        batonNotes.push({
          glyph: NOTE_GLYPHS[Math.floor(Math.random() * NOTE_GLYPHS.length)],
          x: bx,
          y: by,
          size: 16 + Math.random() * 8,
          vx: 18 + Math.random() * 14,
          vy: -24 - Math.random() * 12,
          rot: 0,
          rotSpeed: (Math.random() - 0.5) * 0.4,
          alpha: 0,
          peakAlpha: 0.42,
          age: 0,
          color: '#2fd6e8'
        });
      }

      // Draw and update baton notes
      f.font = '20px Lora, Georgia, serif';
      for (let i = batonNotes.length - 1; i >= 0; i--) {
        const bn = batonNotes[i];
        bn.age += dt;
        bn.x += bn.vx * dt;
        bn.y += bn.vy * dt;
        bn.rot += bn.rotSpeed * dt;
        const fade = bn.age < 0.8 ? bn.age / 0.8 : Math.max(0, 1 - (bn.age - 0.8) / 3.4);
        const clearMul = getClearMultiplier(bn.x, bn.y);
        const finalAlpha = bn.peakAlpha * fade * clearMul;

        if (finalAlpha > 0.01) {
          f.save();
          f.translate(bn.x, bn.y);
          f.rotate(bn.rot);
          f.fillStyle = bn.color;
          f.globalAlpha = finalAlpha;
          f.shadowColor = bn.color;
          f.shadowBlur = 8;
          f.fillText(bn.glyph, 0, 0);
          f.restore();
        }

        if (bn.age > 4.2 || bn.x > W + 40 || bn.y < -40) {
          batonNotes.splice(i, 1);
        }
      }

      // 4. Floating Notes (drifting like petals in slow sine curves)
      f.shadowBlur = 8;
      for (const n of notes) {
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        n.rot += n.rotSpeed * dt;

        const wave = Math.sin(n.x * n.waveFreq + t * 0.8 + n.seed) * n.waveAmp;
        const currentY = n.onStaff ? staffY(n.x, t) - 10 + Math.sin(t + n.seed) * 8 : n.y + wave;

        if (n.x > W + 40) {
          n.x = -30;
          n.y = (0.2 + Math.random() * 0.7) * H;
        }
        if (currentY < -40) {
          n.y = H + 20;
        }

        const clearMul = getClearMultiplier(n.x, currentY);
        const alpha = n.baseAlpha * clearMul;

        if (alpha > 0.015) {
          f.save();
          f.translate(n.x, currentY);
          f.rotate(n.rot);
          f.font = `${Math.round(n.size)}px Lora, Georgia, serif`;
          f.fillStyle = n.color;
          f.shadowColor = n.color;
          f.globalAlpha = alpha;
          f.fillText(n.glyph, 0, 0);
          f.restore();
        }
      }

      // 5. Code Fragments (tiny monospace tokens, 11px)
      f.font = '11px ui-monospace, Menlo, Consolas, monospace';
      for (const c of codes) {
        c.x += c.vx * dt;
        c.y += c.vy * dt;

        const wave = Math.sin(c.x * c.waveFreq + t * 0.7 + c.seed) * c.waveAmp;
        const currentY = c.y + wave;

        if (c.x > W + 50) {
          c.x = -40;
          c.y = (0.2 + Math.random() * 0.65) * H;
        }
        if (currentY < -40) {
          c.y = H + 20;
        }

        const clearMul = getClearMultiplier(c.x, currentY);
        const alpha = c.baseAlpha * clearMul;

        if (alpha > 0.012) {
          f.fillStyle = c.color;
          f.shadowColor = c.color;
          f.shadowBlur = 6;
          f.globalAlpha = alpha;
          f.fillText(c.token, c.x, currentY);
        }
      }

      // 6. Glowing Motes (20 soft particles drifting upward and twinkling)
      for (const m of motes) {
        m.x += m.vx * dt;
        m.y += m.vy * dt;

        if (m.y < -10) {
          m.y = H + 10;
          m.x = Math.random() * W;
        }
        if (m.x > W + 10) {
          m.x = -10;
        }

        const twinkle = 0.5 + 0.5 * Math.sin(t * m.twinkleSpeed + m.twinkleOffset);
        const clearMul = getClearMultiplier(m.x, m.y);
        const alpha = 0.28 * twinkle * clearMul;

        if (alpha > 0.01) {
          f.fillStyle = m.color;
          f.shadowColor = m.color;
          f.shadowBlur = 7;
          f.globalAlpha = alpha;
          f.fillRect(m.x, m.y, m.size, m.size);
        }
      }

      f.shadowBlur = 0;
      f.globalAlpha = 1;

      // WebGL conductor warp fallback rendering (if image active)
      if (gl && ready && cv) {
        const w = Math.min(Math.round(cv.clientWidth * Math.min(window.devicePixelRatio || 1, 2)), 1000);
        if (w && cv.width !== w) {
          cv.width = cv.height = w;
          gl.viewport(0, 0, w, w);
        }
        gl.uniform1f(ut, t);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      // Watchdog: Hide overlay if frame time consistently exceeds 20ms
      const frameDuration = performance.now() - frameStart;
      if (frameDuration > 20) {
        slowFrames += 1;
        if (slowFrames > 120) {
          disabledDueToPerf = true;
          f.clearRect(0, 0, W, H);
          return;
        }
      } else {
        slowFrames = Math.max(0, slowFrames - 1);
      }

      rafId = requestAnimationFrame(renderOverlay);
    };

    rafId = requestAnimationFrame(renderOverlay);

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <header className="hero" id="top" ref={heroRef}>
      <canvas id="flow" ref={flowRef} aria-hidden="true" />
      <div className="wrap hero-grid">
        <div>
          <p className="eyebrow rise">Coders Club presents</p>
          <h1 className="rise d1">AI Agent<br />Orchestra</h1>
          <p className="lede rise d2">A 3-day event to educate students and make them aware of agentic development.</p>
          <p className="body rise d3">
            Learn how AI tools, chatbots and agents differ, then build and conduct an AI agent of your own. Three days, three movements, from your first prompt to a live demo.
          </p>
          <div className="moves rise d4">
            <div className="mv"><i>Movement I</i><b>Day 1</b><span>Learn + Create</span></div>
            <div className="mv"><i>Movement II</i><b>Day 2</b><span>Understand + Connect</span></div>
            <div className="mv"><i>Movement III</i><b>Day 3</b><span>Build + Present</span></div>
          </div>
          <div className="cta-row rise d5">
            <a className="btn pri" href="#register" onClick={onRegisterClick}>Register</a>
            <a className="btn" href="#brochure" onClick={onBrochureClick}>Read the brochure</a>
          </div>
        </div>

        <div className="art rise d2">
          {hasVideo && !reduceMotion ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              poster="/assets/hero-poster.jpg"
              onError={() => setHasVideo(false)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%'
              }}
            >
              <source src="/assets/hero-loop.webm" type="video/webm" />
              <source src="/assets/hero-loop.mp4" type="video/mp4" />
              <img
                src="/assets/hero-art.jpg"
                alt="A conductor leading an orchestra while streams of code flow around the musicians"
              />
            </video>
          ) : (
            <>
              <img
                id="artimg"
                ref={imgRef}
                src="/assets/hero-art.jpg"
                alt="A conductor leading an orchestra while streams of code flow around the musicians"
              />
              {!reduceMotion && (
                <canvas id="art" ref={canvasRef} className={webGlReady ? 'on' : ''} />
              )}
            </>
          )}
        </div>
      </div>
      <div className="staff" aria-hidden="true" />
    </header>
  );
}
