/* ═══════════════════════════════════════════════════════════
   RESOnation — JavaScript: Animations, Canvas, Interactions
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── THEME MANAGER ────────────────────────────── */
  class ThemeManager {
    constructor() {
      this.theme = localStorage.getItem('theme') || 
                   (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      this.init();
    }

    init() {
      this.applyTheme();
      
      // Desktop toggle
      const toggle = document.getElementById('theme-toggle');
      toggle?.addEventListener('click', () => this.toggleTheme());

      // Mobile toggle
      const toggleMobile = document.getElementById('theme-toggle-mobile');
      toggleMobile?.addEventListener('click', () => this.toggleTheme());

      // Listen for system changes
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
          this.theme = e.matches ? 'light' : 'dark';
          this.applyTheme();
        }
      });
    }

    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', this.theme);
      this.applyTheme();
      
      // Notify components (like Canvas) to update colors
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: this.theme } }));
    }

    applyTheme() {
      document.documentElement.setAttribute('data-theme', this.theme);
    }

    getColors() {
      const styles = getComputedStyle(document.documentElement);
      return {
        blue: styles.getPropertyValue('--color-blue-rgb').trim() || '0,122,255',
        copper: styles.getPropertyValue('--color-copper-rgb').trim() || '255,140,66'
      };
    }
  }

  const themeManager = new ThemeManager();

  // ── Shared theme colors (accessible to ALL canvas animations) ──
  let themeColors = themeManager.getColors();
  window.addEventListener('themeChanged', () => {
    themeColors = themeManager.getColors();
  });

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

    // Theme colors shared from outer scope (see top of DOMContentLoaded)

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
        this.colorType = Math.random() > 0.5 ? 'blue' : 'copper';
      }
      update() {
        this.r += this.speed;
        this.opacity = 0.4 * (1 - this.r / this.maxR);
        if (this.r > this.maxR) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        const rgb = themeColors[this.colorType];
        ctx.strokeStyle = `rgba(${rgb},${this.opacity})`;
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
        this.colorType = Math.random() > 0.5 ? 'blue' : 'copper';
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        const rgb = themeColors[this.colorType];
        ctx.fillStyle = `rgba(${rgb},${this.opacity})`;
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
            const rgb = themeColors[particles[i].colorType];
            ctx.strokeStyle = `rgba(${rgb},${0.08 * (1 - dist / 120)})`;
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
            tc.strokeStyle = `rgba(${themeColors.blue},${0.06 * (1 - d / 200)})`;
            tc.lineWidth = 0.8;
            tc.stroke();
          }
        }
        tc.beginPath();
        tc.arc(nodes[i].x, nodes[i].y, 1.5, 0, Math.PI * 2);
        tc.fillStyle = `rgba(${themeColors.blue},0.25)`;
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
      }
      update() {
        this.r += this.speed;
        if (this.r > this.maxR) this.r = 0;
      }
      draw() {
        const op = 0.25 * (1 - this.r / this.maxR);
        cc.beginPath();
        cc.arc(cW / 2, cH / 2, this.r, 0, Math.PI * 2);
        cc.strokeStyle = `rgba(${themeColors.blue},${op})`;
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
    '.friction-item, .stat, .hero__stats, ' +
    '.anima-text, .anima-visual, .anima-step'
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

  /* ── RADAR LIFE (Reflect.app style) ─────────────────────────────────── */
  const radarNodesGroup = document.getElementById('radar-nodes');
  const radarEdgesGroup = document.getElementById('radar-edges');
  const sweepEl = document.getElementById('radar-sweep-beam');
  const sweepElEn = document.getElementById('radar-sweep-beam-en');

  if (radarNodesGroup && radarEdgesGroup) {
    const NODE_COUNT = 16;
    const centerX = 300, centerY = 300;
    const minR = 60, maxR = 270;
    const nodes = [];
    const edges = [];

    // Colors mapping from design variables
    const nodeColors = ['var(--color-blue)', 'var(--color-purple)', 'var(--color-copper)', 'var(--color-pink)'];

    class NetworkNode {
      constructor(index) {
        this.index = index;
        
        // Distribute nodes in the upper semi-circle (180 to 360 degrees, or PI to 2*PI radians)
        const anglePadding = 0.2; // avoid edges
        const angle = Math.PI + anglePadding + Math.random() * (Math.PI - 2 * anglePadding);
        const r = minR + Math.random() * (maxR - minR);

        this.baseX = centerX + Math.cos(angle) * r;
        this.baseY = centerY + Math.sin(angle) * r;
        
        this.x = this.baseX;
        this.y = this.baseY;

        this.floatSpeed = 0.0008 + Math.random() * 0.0008;
        this.phaseX = Math.random() * Math.PI * 2;
        this.phaseY = Math.random() * Math.PI * 2;
        this.amp = 8 + Math.random() * 8; // float amplitude

        this.isKeyNode = Math.random() > 0.65;
        this.size = this.isKeyNode ? (4 + Math.random() * 2) : (2 + Math.random() * 1.5);
        this.color = nodeColors[Math.floor(Math.random() * nodeColors.length)];

        this.el = this.createEl();
        this.haloEl = this.createHaloEl();
        
        radarNodesGroup.appendChild(this.haloEl);
        radarNodesGroup.appendChild(this.el);
      }

      createEl() {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'radar-node');
        circle.setAttribute('r', this.size);
        circle.setAttribute('fill', this.color);
        return circle;
      }

      createHaloEl() {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'radar-node-halo');
        circle.setAttribute('r', this.size * 2.5);
        circle.setAttribute('fill', this.color);
        circle.setAttribute('opacity', '0');
        return circle;
      }

      update(time, beamAngleRad) {
        // Floating movement
        this.x = this.baseX + Math.sin(time * this.floatSpeed + this.phaseX) * this.amp;
        this.y = this.baseY + Math.cos(time * this.floatSpeed + this.phaseY) * this.amp;

        this.el.setAttribute('cx', this.x);
        this.el.setAttribute('cy', this.y);
        
        this.haloEl.setAttribute('cx', this.x);
        this.haloEl.setAttribute('cy', this.y);

        // Flash behavior when sweeping beam passes
        const nodeAngleRad = Math.atan2(this.y - centerY, this.x - centerX);
        // Normalize angle to [0, 2*PI]
        const normNodeAngle = (nodeAngleRad + Math.PI * 2) % (Math.PI * 2);
        const normBeamAngle = (beamAngleRad + Math.PI * 2) % (Math.PI * 2);

        // Angular distance
        let diff = Math.abs(normNodeAngle - normBeamAngle);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;

        if (diff < 0.25) {
          const factor = 1 - (diff / 0.25); // 0 to 1
          this.el.setAttribute('r', this.size * (1 + factor * 0.6));
          this.haloEl.setAttribute('opacity', 0.2 + factor * 0.45);
          this.el.setAttribute('fill', 'var(--color-text)');
        } else {
          this.el.setAttribute('r', this.size);
          this.haloEl.setAttribute('opacity', '0.08');
          this.el.setAttribute('fill', this.color);
        }
      }
    }

    class NetworkEdge {
      constructor(nodeA, nodeB) {
        this.nodeA = nodeA;
        this.nodeB = nodeB;
        this.el = this.createEl();
        radarEdgesGroup.appendChild(this.el);
      }

      createEl() {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('class', 'radar-edge');
        line.setAttribute('stroke', 'rgba(124, 58, 237, 0.18)');
        line.setAttribute('stroke-width', '0.8');
        return line;
      }

      update() {
        this.el.setAttribute('x1', this.nodeA.x);
        this.el.setAttribute('y1', this.nodeA.y);
        this.el.setAttribute('x2', this.nodeB.x);
        this.el.setAttribute('y2', this.nodeB.y);
        
        // Dynamically fade edges if nodes float too far
        const dx = this.nodeA.x - this.nodeB.x;
        const dy = this.nodeA.y - this.nodeB.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const opacity = Math.max(0, 0.25 * (1 - dist / 160));
        this.el.setAttribute('stroke', `rgba(124, 58, 237, ${opacity})`);
      }
    }

    // Initialize nodes
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push(new NetworkNode(i));
    }

    // Connect close nodes to form constellation network
    for (let i = 0; i < nodes.length; i++) {
      const targets = [];
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const dx = nodes[i].baseX - nodes[j].baseX;
        const dy = nodes[i].baseY - nodes[j].baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          targets.push({ node: nodes[j], dist });
        }
      }
      
      // Sort and take top 2 closest
      targets.sort((a, b) => a.dist - b.dist);
      const connections = targets.slice(0, 2);
      connections.forEach(c => {
        // Prevent duplicate edges
        const exists = edges.some(e => 
          (e.nodeA === nodes[i] && e.nodeB === c.node) ||
          (e.nodeA === c.node && e.nodeB === nodes[i])
        );
        if (!exists) {
          edges.push(new NetworkEdge(nodes[i], c.node));
        }
      });
    }

    const animateReflectRadar = (time) => {
      // Beam angle sweeps back and forth between -90 and 90 degrees (180 to 360 in rads)
      const sweepPeriod = 8000; // 8s back-and-forth
      let progress = (time % sweepPeriod) / sweepPeriod; // 0 to 1
      if (progress > 0.5) progress = 1 - progress; // triangle wave: 0 -> 0.5 -> 0
      
      // Map progress [0, 0.5] to [-90, 90] degrees
      const beamAngleDeg = -90 + (progress * 2) * 180;
      
      // Update sweep element transformation
      if (sweepEl) {
        sweepEl.setAttribute('transform', `rotate(${beamAngleDeg}, 300, 300)`);
      }
      if (sweepElEn) {
        sweepElEn.setAttribute('transform', `rotate(${beamAngleDeg}, 300, 300)`);
      }

      // Convert beam angle to standard radians relative to (300,300) pivot
      // Degree 0 is pointing right (360°), -90 is pointing up (270°), -180 is pointing left (180°)
      // Since rotation pivots around (300,300) and the beam is vertical, beamAngleDeg = 0 is straight up (-90 degrees / 1.5*PI rads)
      const beamAngleRad = Math.PI + (beamAngleDeg + 90) * (Math.PI / 180);

      // Update nodes and edges
      nodes.forEach(node => node.update(time, beamAngleRad));
      edges.forEach(edge => edge.update());

      requestAnimationFrame(animateReflectRadar);
    };
    requestAnimationFrame(animateReflectRadar);
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
