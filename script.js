/* ═══════════════════════════════════════════════════════════
   RESOnation — JavaScript: Animations, Canvas, Interactions
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAV scroll effect ──────────────────────────── */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('nav-burger');
  const mobileMenu = document.getElementById('nav-mobile');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });

  burger?.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  // Close mobile nav on link click
  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  /* ── HERO RESONANCE CANVAS ──────────────────────── */
  const heroCanvas = document.getElementById('resonance-canvas');
  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let W, H, waves = [], particles = [];
    let animId;

    const resize = () => {
      W = heroCanvas.width = heroCanvas.offsetWidth;
      H = heroCanvas.height = heroCanvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Wave rings
    class Wave {
      constructor() { this.reset(); }
      reset() {
        this.x = W * 0.5;
        this.y = H * 0.5;
        this.r = 0;
        this.maxR = Math.sqrt(W * W + H * H) * 0.6;
        this.speed = 0.6 + Math.random() * 0.4;
        this.opacity = 0.4;
        this.color = Math.random() > 0.5 ? '0,122,255' : '255,140,66';
      }
      update() {
        this.r += this.speed;
        this.opacity = 0.4 * (1 - this.r / this.maxR);
        if (this.r > this.maxR) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${this.color},${this.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Particles / stars
    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.r = 0.5 + Math.random() * 1.5;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.opacity = 0.1 + Math.random() * 0.4;
        this.color = Math.random() > 0.5 ? '0,122,255' : '255,140,66';
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
        ctx.fill();
      }
    }

    // Init
    for (let i = 0; i < 5; i++) {
      const w = new Wave();
      w.r = (i / 5) * w.maxR;
      waves.push(w);
    }
    for (let i = 0; i < 80; i++) particles.push(new Particle());

    // Draw connections between nearby particles
    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,122,255,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      waves.forEach(w => { w.update(); w.draw(); });
      drawConnections();
      particles.forEach(p => { p.update(); p.draw(); });
      animId = requestAnimationFrame(animate);
    };
    animate();
  }

  /* ── TOOLS BACKGROUND CANVAS ────────────────────── */
  const toolsCanvas = document.getElementById('tools-canvas');
  if (toolsCanvas) {
    const tc = toolsCanvas.getContext('2d');
    let tW, tH;
    const resizeTc = () => {
      tW = toolsCanvas.width = toolsCanvas.offsetWidth;
      tH = toolsCanvas.height = toolsCanvas.offsetHeight;
    };
    resizeTc();
    window.addEventListener('resize', resizeTc);

    const nodes = Array.from({ length: 20 }, () => ({
      x: Math.random() * (tW || 1200),
      y: Math.random() * (tH || 600),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));

    const animateTc = () => {
      tc.clearRect(0, 0, tW, tH);
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > tW) n.vx *= -1;
        if (n.y < 0 || n.y > tH) n.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 200) {
            tc.beginPath();
            tc.moveTo(nodes[i].x, nodes[i].y);
            tc.lineTo(nodes[j].x, nodes[j].y);
            tc.strokeStyle = `rgba(0,122,255,${0.06 * (1 - d / 200)})`;
            tc.lineWidth = 0.8;
            tc.stroke();
          }
        }
        tc.beginPath();
        tc.arc(nodes[i].x, nodes[i].y, 1.5, 0, Math.PI * 2);
        tc.fillStyle = 'rgba(0,122,255,0.25)';
        tc.fill();
      }
      requestAnimationFrame(animateTc);
    };
    animateTc();
  }

  /* ── FINAL CTA CANVAS ───────────────────────────── */
  const ctaCanvas = document.getElementById('cta-canvas');
  if (ctaCanvas) {
    const cc = ctaCanvas.getContext('2d');
    let cW, cH, ctaWaves = [];
    const resizeCc = () => {
      cW = ctaCanvas.width = ctaCanvas.offsetWidth;
      cH = ctaCanvas.height = ctaCanvas.offsetHeight;
    };
    resizeCc();
    window.addEventListener('resize', resizeCc);

    class CtaWave {
      constructor(delay) {
        this.r = delay;
        this.maxR = Math.max(cW, cH) * 0.8;
        this.speed = 0.8;
        this.c = '0,122,255';
      }
      update() {
        this.r += this.speed;
        if (this.r > this.maxR) this.r = 0;
      }
      draw() {
        const op = 0.25 * (1 - this.r / this.maxR);
        cc.beginPath();
        cc.arc(cW / 2, cH / 2, this.r, 0, Math.PI * 2);
        cc.strokeStyle = `rgba(${this.c},${op})`;
        cc.lineWidth = 1;
        cc.stroke();
      }
    }
    for (let i = 0; i < 6; i++) ctaWaves.push(new CtaWave((i / 6) * 300));
    const animateCc = () => {
      cc.clearRect(0, 0, cW, cH);
      ctaWaves.forEach(w => { w.update(); w.draw(); });
      requestAnimationFrame(animateCc);
    };
    animateCc();
  }

  /* ── SCROLL REVEAL ──────────────────────────────── */
  const revealEls = document.querySelectorAll(
    '.math-card, .tool-card, .event-card, .section__header, ' +
    '.nation-text, .nation-visual, .architect-text, .architect-photo, ' +
    '.friction-item, .stat, .hero__stats'
  );

  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    if (i % 3 === 1) el.classList.add('reveal-delay-1');
    if (i % 3 === 2) el.classList.add('reveal-delay-2');
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Trigger friction items animation
        if (entry.target.classList.contains('friction-item')) {
          entry.target.style.animationPlayState = 'running';
        }
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ── MATH BAR ANIMATION ─────────────────────────── */
  const mathBars = document.querySelectorAll('.math-card__fill');
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const targetW = fill.style.width;
        fill.style.width = '0%';
        setTimeout(() => {
          fill.style.width = targetW;
        }, 200);
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  mathBars.forEach(b => barObserver.observe(b));

  /* ── SMOOTH ANCHOR SCROLL ───────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── ORBIT COUNTER-ROTATION ─────────────────────── */
  // keeps orbit node labels readable (counter-rotates with the ring)
  const orbitNodes = document.querySelectorAll('.orbit-node');
  // CSS animation handles this via calc() already; no JS needed for basic orbit

  /* ── MOUSE PARALLAX ON HERO ─────────────────────── */
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const cx = heroSection.offsetWidth / 2;
      const cy = heroSection.offsetHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      const title = heroSection.querySelector('.hero__title');
      if (title) {
        title.style.transform = `translateY(${dy * 4}px)`;
      }
    });
    heroSection.addEventListener('mouseleave', () => {
      const title = heroSection.querySelector('.hero__title');
      if (title) {
        title.style.transform = '';
      }
    });
  }

  /* ── ACTIVE NAV HIGHLIGHT ───────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}`
            ? 'var(--color-text)'
            : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObserver.observe(s));

  /* ── TOOL CARD ICON ANIMATION ───────────────────── */
  document.querySelectorAll('.tool-card').forEach(card => {
    const svg = card.querySelector('.tool-card__icon svg');
    card.addEventListener('mouseenter', () => {
      if (svg) svg.style.filter = 'drop-shadow(0 0 8px currentColor)';
    });
    card.addEventListener('mouseleave', () => {
      if (svg) svg.style.filter = '';
    });
  });

  /* ── DRAGGABLE PHOTO STRIP ──────────────────────── */
  const strip = document.querySelector('.photo-strip__track');
  if (strip) {
    let isDown = false, startX, scrollLeft;
    strip.addEventListener('mousedown', e => {
      isDown = true;
      strip.style.cursor = 'grabbing';
      startX = e.pageX - strip.offsetLeft;
      scrollLeft = strip.scrollLeft;
    });
    strip.addEventListener('mouseleave', () => { isDown = false; strip.style.cursor = 'grab'; });
    strip.addEventListener('mouseup', () => { isDown = false; strip.style.cursor = 'grab'; });
    strip.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - strip.offsetLeft;
      strip.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });
    // Touch support
    let touchStart = 0, touchScrollLeft = 0;
    strip.addEventListener('touchstart', e => {
      touchStart = e.touches[0].pageX;
      touchScrollLeft = strip.scrollLeft;
    }, { passive: true });
    strip.addEventListener('touchmove', e => {
      const dx = touchStart - e.touches[0].pageX;
      strip.scrollLeft = touchScrollLeft + dx;
    }, { passive: true });

    // Auto-scroll hint animation on load
    setTimeout(() => {
      strip.scrollTo({ left: 80, behavior: 'smooth' });
      setTimeout(() => strip.scrollTo({ left: 0, behavior: 'smooth' }), 700);
    }, 2000);
  }

  /* ── RADAR LIFE ─────────────────────────────────── */
  const radarContainer = document.getElementById('scanner-figures');
  if (radarContainer) {
    const DOT_COUNT = 10;
    const colors = ['red', 'red', 'red', 'red', 'red', 'orange', 'orange', 'orange', 'blue', 'blue'];
    const dots = [];
    const centerX = 100, centerY = 100;
    const minR = 45, maxR = 85;

    class RadarDot {
      constructor(color) {
        this.color = color;
        this.reset();
        this.el = this.createEl();
        radarContainer.appendChild(this.el);
      }
      reset() {
        const angle = Math.random() * Math.PI * 2;
        const r = minR + Math.random() * (maxR - minR);
        this.x = centerX + Math.cos(angle) * r;
        this.y = centerY + Math.sin(angle) * r;
        this.vx = (Math.random() - 0.5) * 0.1; // Reduced from 0.2
        this.vy = (Math.random() - 0.5) * 0.1; // Reduced from 0.2
        this.targetAngle = 0;
      }
      createEl() {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'radar-dot');
        g.setAttribute('data-color', this.color);
        
        // Human silhouette (top view) - Slightly larger
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        body.setAttribute('rx', '4.5'); // Increased from 3.5
        body.setAttribute('ry', '2.5'); // Increased from 2.0
        body.setAttribute('class', 'dot-body');
        
        const head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        head.setAttribute('r', '2'); // Increased from 1.5
        head.setAttribute('cy', '-0.5');
        head.setAttribute('class', 'dot-head');
        
        g.appendChild(body);
        g.appendChild(head);
        return g;
      }
      update(beamAngle) {
        // Chaotic movement - 2x slower
        this.vx += (Math.random() - 0.5) * 0.01;
        this.vy += (Math.random() - 0.5) * 0.01;
        this.vx = Math.max(-0.15, Math.min(0.15, this.vx));
        this.vy = Math.max(-0.15, Math.min(0.15, this.vy));
        
        this.x += this.vx;
        this.y += this.vy;

        // Boundary check (circular)
        const dx = this.x - centerX;
        const dy = this.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxR || dist < minR) {
          const angle = Math.atan2(dy, dx);
          const targetR = dist > maxR ? maxR : minR;
          this.x = centerX + Math.cos(angle) * targetR;
          this.y = centerY + Math.sin(angle) * targetR;
          this.vx *= -1;
          this.vy *= -1;
        }

        // Apply position and rotation to silhouette
        const dotAngleDeg = Math.atan2(this.y - centerY, this.x - centerX) * (180 / Math.PI);
        this.el.setAttribute('transform', `translate(${this.x}, ${this.y}) rotate(${dotAngleDeg + 90})`);

        // Flash check (Synchronized Sector)
        const normalizedDot = (dotAngleDeg + 360) % 360;
        const start = (beamAngle - 45 + 360) % 360;
        const end = beamAngle % 360;
        
        let lit = false;
        if (start > end) {
          // Sector wraps through 0/360
          if (normalizedDot >= start || normalizedDot <= end) lit = true;
        } else {
          if (normalizedDot >= start && normalizedDot <= end) lit = true;
        }
        
        if (lit) {
          this.el.classList.add('is-lit');
        } else {
          this.el.classList.remove('is-lit');
        }
      }
    }

    // Figures & Sweep Sync
    const sweepEl = document.querySelector('.scanner__sweep');

    // Init dots
    colors.forEach(c => dots.push(new RadarDot(c)));

    const animateRadar = (time) => {
      // Beam angle: 4s loop -> 0 to 360
      const beamAngle = (time % 4000) / 4000 * 360;
      
      // Update sweep rotation visually
      if (sweepEl) {
        sweepEl.setAttribute('transform', `rotate(${beamAngle}, 100, 100)`);
      }

      dots.forEach(d => d.update(beamAngle));
      requestAnimationFrame(animateRadar);
    };
    requestAnimationFrame(animateRadar);
  }

  /* ── CONSOLE SIGNATURE ──────────────────────────── */
  const lang = document.documentElement.lang || 'ru';
  const tagline = lang === 'en' 
    ? 'Your Tribe. Your Social Code.' 
    : 'Твоё племя. Твой Социальный Код.';

  console.log(
    `%cRESOnation %c· ${tagline}`,
    'font-size:18px;font-weight:900;color:#007AFF;',
    'font-size:12px;color:#666;'
  );

});
