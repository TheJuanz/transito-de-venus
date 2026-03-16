/**
 * ============================================================
 * TRÁNSITO DE VENUS — script.js (Multipágina v4.0)
 * Un único archivo JS compartido por todas las páginas.
 * Cada página activa solo los módulos que necesita,
 * detectados mediante document.body.classList.
 * ============================================================
 */

/* ─────────────────────────────────────────────
   1. DETECCIÓN DE PÁGINA ACTUAL
   ─────────────────────────────────────────────
   Leemos la clase del <body> para saber en qué
   página estamos y activar solo los módulos relevantes.
   ───────────────────────────────────────────── */
const PAGE = document.body.className; // 'page-home', 'page-sol', etc.

/* ─────────────────────────────────────────────
   2. CANVAS DE ESTRELLAS (todas las páginas)
   ─────────────────────────────────────────────
   Genera un campo de estrellas dinámico con
   parpadeo y efecto de profundidad (parallax sutil).
   ───────────────────────────────────────────── */

let starsAnimId = null;
let starsArr    = [];

function initStarsCanvas() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    generateStars(W, H);
  }

  function generateStars(w, h) {
    starsArr = [];
    const N = Math.floor((w * h) / 3200);
    for (let i = 0; i < N; i++) {
      starsArr.push({
        x:           Math.random() * w,
        y:           Math.random() * h,
        r:           Math.random() * 1.3 + 0.2,
        alpha:       Math.random(),
        speed:       Math.random() * 0.008 + 0.002,
        dir:         Math.random() > 0.5 ? 1 : -1,
        layer:       Math.floor(Math.random() * 3),    // 0=fondo, 1=medio, 2=frente
        hue:         Math.random() > 0.88 ? 200 : 0,  // azuladas vs blancas
      });
    }
  }

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  function draw() {
    // Fondo espacial con gradiente
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#05080f');
    grad.addColorStop(0.5, '#080e1a');
    grad.addColorStop(1, '#05080f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Neblina galáctica sutil
    const neb = ctx.createRadialGradient(W*0.5, H*0.4, 0, W*0.5, H*0.4, W*0.45);
    neb.addColorStop(0, 'rgba(20,40,80,0.1)');
    neb.addColorStop(0.5, 'rgba(10,20,50,0.05)');
    neb.addColorStop(1, 'transparent');
    ctx.fillStyle = neb;
    ctx.fillRect(0, 0, W, H);

    // Parallax: desplazar estrellas según capa y posición del mouse
    const cx = W / 2, cy = H / 2;
    const dx = (mouseX - cx) / cx;
    const dy = (mouseY - cy) / cy;

    starsArr.forEach(s => {
      // Parpadeo
      s.alpha += s.speed * s.dir;
      if (s.alpha > 1)   { s.alpha = 1;   s.dir = -1; }
      if (s.alpha < 0.1) { s.alpha = 0.1; s.dir =  1; }

      // Parallax por capa
      const pFactor = [0, 1.5, 3.5][s.layer];
      const px = s.x + dx * pFactor;
      const py = s.y + dy * pFactor;

      const color = s.hue === 200
        ? `rgba(180,200,255,${s.alpha})`
        : `rgba(225,225,255,${s.alpha})`;

      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Halo para estrellas grandes
      if (s.r > 1.0) {
        const halo = ctx.createRadialGradient(px, py, 0, px, py, s.r * 3);
        halo.addColorStop(0, `rgba(200,210,255,${s.alpha * 0.3})`);
        halo.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(px, py, s.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();
      }
    });

    starsAnimId = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

/* ─────────────────────────────────────────────
   3. NAVEGACIÓN — Hamburger + scroll nav
   ─────────────────────────────────────────────
   Funciona igual en todas las páginas.
   ───────────────────────────────────────────── */

function initNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.querySelector('.nav-links');
  const nav       = document.getElementById('main-nav');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', open);
    });
    // Cerrar al hacer clic en un link del menú móvil
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
      });
    });
  }

  // Nav translúcida → opaca al hacer scroll
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    });
  }
}

/* ─────────────────────────────────────────────
   4. CURSOR PERSONALIZADO
   ─────────────────────────────────────────────
   Solo en dispositivos con puntero fino (desktop).
   ───────────────────────────────────────────── */

function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cursor = document.createElement('div');
  cursor.id = 'custom-cursor';
  Object.assign(cursor.style, {
    position: 'fixed', width: '20px', height: '20px',
    border: '1px solid rgba(249,115,22,0.6)', borderRadius: '50%',
    pointerEvents: 'none', zIndex: '99999',
    transition: 'transform 0.15s ease, opacity 0.3s, width 0.3s, height 0.3s, border-color 0.3s',
    transform: 'translate(-50%,-50%)', top: '0', left: '0',
    mixBlendMode: 'difference',
  });
  document.body.appendChild(cursor);

  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursor.style.opacity = '1'; });
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });

  document.querySelectorAll('a,button,.celestial-body,.info-card,.fact-item,.quiz-option,.qz-option,.ht-item')
    .forEach(el => {
      el.addEventListener('mouseenter', () => { cursor.style.width='36px'; cursor.style.height='36px'; cursor.style.borderColor='rgba(249,115,22,1)'; });
      el.addEventListener('mouseleave', () => { cursor.style.width='20px'; cursor.style.height='20px'; cursor.style.borderColor='rgba(249,115,22,0.6)'; });
    });

  (function tick() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(tick);
  })();
}

/* ─────────────────────────────────────────────
   5. ANIMACIONES AL HACER SCROLL (IntersectionObserver)
   ─────────────────────────────────────────────
   Anima elementos al entrar en el viewport.
   ───────────────────────────────────────────── */

function initScrollAnimations() {
  if (!window.IntersectionObserver) return;

  const targets = document.querySelectorAll(
    '.info-card,.stat-item,.fact-item,.exosim-intro-card,.ht-item,.astro-datum,.qz-question'
  );

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = (parseInt(entry.target.dataset.aIndex || 0) % 5) * 80;
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(22px)';
    el.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
    el.dataset.aIndex = i;
    obs.observe(el);
  });
}

/* ─────────────────────────────────────────────
   6. CONTADORES ANIMADOS (index — stats-row)
   ─────────────────────────────────────────────
   Los números cuentan hasta su valor al ser visibles.
   ───────────────────────────────────────────── */

function initCounters() {
  if (!window.IntersectionObserver) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = '1';
        const raw    = entry.target.textContent.replace(/[^\d]/g, '');
        const target = parseInt(raw, 10);
        if (!isNaN(target) && target > 0) animateCounter(entry.target, target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num').forEach(el => obs.observe(el));
}

function animateCounter(el, target, duration = 1600) {
  const suffix = el.querySelector('span') ? el.querySelector('span').outerHTML : '';
  const start  = Date.now();
  function tick() {
    const t = Math.min((Date.now() - start) / duration, 1);
    const e = 1 - Math.pow(1 - t, 3);
    el.innerHTML = Math.round(e * target).toLocaleString('es-ES') + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  tick();
}

/* ─────────────────────────────────────────────
   7. PARALLAX SUAVE DEL HERO (index)
   ─────────────────────────────────────────────
   Los planetas se desplazan levemente con el mouse.
   ───────────────────────────────────────────── */

function initParallax() {
  if (PAGE !== 'page-home') return;

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    const sun   = document.querySelector('.sun');
    const earth = document.querySelector('.earth');
    if (sun)   sun.style.transform   = `translateY(-50%) translate(${dx * -8}px, ${dy * -4}px)`;
    if (earth) earth.style.transform = `translateY(-50%) translate(${dx * 6}px, ${dy * 3}px)`;
  });
}

/* ─────────────────────────────────────────────
   8. LÍNEA DE TIEMPO INTERACTIVA (index)
   ─────────────────────────────────────────────
   Click en cada ítem para expandir/colapsar.
   ───────────────────────────────────────────── */

function initTimeline() {
  const items = document.querySelectorAll('.ht-item');
  if (!items.length) return;

  items.forEach(item => {
    item.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      // Cerrar todos
      items.forEach(i => i.classList.remove('open'));
      // Abrir el clickeado (si no estaba abierto)
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Abrir el primero por defecto
  if (items[0]) items[0].classList.add('open');
}

/* ═══════════════════════════════════════════════════════════════
   9. SIMULACIÓN DE EXOPLANETAS (exoplanetas.html)
   ═══════════════════════════════════════════════════════════════
   Motor completo: vista telescópica + curva de luz.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Definición de los 4 sistemas ─── */
const SYSTEMS = {
  small: {
    id: 'small', name: 'Planeta tipo Tierra (Kepler-442b)',
    starColor: '#fde68a', starRadius: 18,
    spectralType: 'G5V', starMag: 8.742,
    transits: [{ planetR:3, period:520, phase:60, dipDepth:0.015, transitDuration:55 }],
    quizAnswer: 'small',
    explanation: 'La pequeña y única caída periódica en la curva de luz delata un planeta de tamaño similar a la Tierra (~1.5% de oscurecimiento). Detectar caídas tan diminutas requirió la precisión sin precedentes del telescopio Kepler. Kepler-442b es un ejemplo real: orbita en la zona habitable de su estrella a 0.409 UA.',
  },
  giant: {
    id: 'giant', name: 'Júpiter caliente (HD 209458b)',
    starColor: '#fbbf24', starRadius: 20,
    spectralType: 'G0V', starMag: 7.651,
    transits: [{ planetR:10, period:380, phase:40, dipDepth:0.16, transitDuration:70 }],
    quizAnswer: 'giant',
    explanation: 'La caída profunda y pronunciada (~16%) es la firma de un gigante gaseoso. HD 209458b fue el primer exoplaneta confirmado por tránsito (1999). Su disco oscurece un 1.6% de la estrella, detectable incluso desde telescopios terrestres. Estos "Júpiteres calientes" dominaron los primeros catálogos por su fácil detección.',
  },
  multi: {
    id: 'multi', name: 'Sistema TRAPPIST-1 (3 planetas)',
    starColor: '#f87171', starRadius: 15,
    spectralType: 'M8V', starMag: 11.354,
    transits: [
      { planetR:4,   period:290, phase:30,  dipDepth:0.023, transitDuration:45 },
      { planetR:6,   period:470, phase:180, dipDepth:0.050, transitDuration:60 },
      { planetR:3.5, period:700, phase:400, dipDepth:0.018, transitDuration:40 },
    ],
    quizAnswer: 'multi',
    explanation: 'Las múltiples caídas de diferente profundidad y periodicidad son la firma de un sistema con varios planetas. TRAPPIST-1 es el ejemplo más famoso: 7 planetas rocosos orbitando una enana roja, 3 en la zona habitable. Cada caída corresponde a un planeta distinto con su propio tamaño y período orbital.',
  },
  none: {
    id: 'none', name: 'Estrella solitaria (51 Pegasi)',
    starColor: '#fef08a', starRadius: 22,
    spectralType: 'G2IV', starMag: 5.490,
    transits: [],
    quizAnswer: 'none',
    explanation: 'Una curva de luz esencialmente plana (solo ruido instrumental) indica que no hay planetas transitando frente a la estrella desde nuestra perspectiva. Esto no descarta planetas: sus órbitas pueden estar inclinadas. El método del tránsito solo funciona para geometrías favorables. ¡La señal ausente también es información científica!',
  },
};

/* ─── Estado global de la simulación ─── */
let simState = {
  system: null, tick: 0, speed: 1,
  lightCurveData: [], drawCursor: 0, elapsedSec: 0,
  transitActive: false, quizAnswered: false,
  telescopeAnimId: null, lightCurveAnimId: null,
  bgStars: [], astronomerMode: false,
};

const STAR_NAMES = ['Kepler-452','TRAPPIST-1','HD 209458','Kepler-186','GJ 1214','TOI-700','LHS 1140','Kepler-22','Kepler-62','K2-18','Gliese 667C','CoRoT-7'];
const WRONG_EXPLANATIONS = {
  small: 'La caída única y periódica, aunque pequeña, indica un solo planeta de tamaño terrestre. Las caídas del ~1.5% son características de mundos del tamaño de la Tierra.',
  giant: 'La caída profunda (>10%) y su única periodicidad son la huella inconfundible de un gigante gaseoso. Estos planetas orbitan muy cerca de su estrella.',
  multi: 'Las múltiples caídas de distinta profundidad —con diferentes períodos— revelan más de un planeta. Cada planeta tiene su propia firma temporal en la curva de luz.',
  none:  'La curva esencialmente plana, con solo pequeñas fluctuaciones de ruido, indica que no hay planetas transitando desde nuestra perspectiva.',
};

/* ─── Punto de entrada ─── */
window.generateSystem = function() {
  const keys   = Object.keys(SYSTEMS);
  simState.system = SYSTEMS[keys[Math.floor(Math.random() * keys.length)]];
  simState.tick = 0; simState.lightCurveData = []; simState.drawCursor = 0;
  simState.elapsedSec = 0; simState.transitActive = false; simState.quizAnswered = false;
  simState.bgStars = generateBgStars(280);

  const idle   = document.getElementById('sim-idle');
  const main   = document.getElementById('sim-main');
  const quiz   = document.getElementById('sim-quiz');
  const astroP = document.getElementById('astronomer-panel');
  if (idle) idle.style.display = 'none';
  if (main) main.style.display = 'flex';
  if (quiz) quiz.style.display = 'block';
  if (astroP && !simState.astronomerMode) astroP.style.display = 'none';

  document.getElementById('sim-star-name').textContent = STAR_NAMES[Math.floor(Math.random() * STAR_NAMES.length)];
  resetQuiz();

  if (simState.telescopeAnimId)  cancelAnimationFrame(simState.telescopeAnimId);
  if (simState.lightCurveAnimId) cancelAnimationFrame(simState.lightCurveAnimId);

  requestAnimationFrame(() => {
    resizeSimCanvases();
    simState.lightCurveData = precomputeLightCurve(simState.system, 700);
    loopSim();
    if (simState.astronomerMode) updateAstronomerPanel();
  });
};

window.setSpeed = function(v) {
  simState.speed = v;
  document.querySelectorAll('.speed-btn').forEach(b => b.classList.toggle('active', parseFloat(b.dataset.speed) === v));
};

window.toggleAstronomerMode = function() {
  simState.astronomerMode = !simState.astronomerMode;
  const btn   = document.getElementById('btn-astronomer');
  const panel = document.getElementById('astronomer-panel');
  if (btn)   btn.classList.toggle('active', simState.astronomerMode);
  if (panel) panel.style.display = simState.astronomerMode && simState.system ? 'block' : 'none';
  if (simState.astronomerMode && simState.system) updateAstronomerPanel();
};

window.checkAnswer = function(userAnswer) {
  if (simState.quizAnswered || !simState.system) return;
  simState.quizAnswered = true;
  const correct = userAnswer === simState.system.quizAnswer;

  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.disabled = true;
    if (opt.dataset.value === simState.system.quizAnswer) opt.classList.add('correct');
    else if (opt.dataset.value === userAnswer && !correct) opt.classList.add('wrong');
  });

  const res  = document.getElementById('quiz-result');
  const icon = document.getElementById('quiz-result-icon');
  const verd = document.getElementById('quiz-result-verdict');
  const expl = document.getElementById('quiz-result-explanation');
  const retry= document.getElementById('btn-retry');

  icon.textContent = correct ? '✅' : '❌';
  verd.textContent = correct
    ? `¡Correcto! Se trata de: ${simState.system.name}`
    : `Casi. El sistema es: ${simState.system.name}`;
  expl.textContent = correct ? simState.system.explanation : WRONG_EXPLANATIONS[simState.system.quizAnswer];

  res.style.display   = 'flex';
  retry.style.display = 'block';
  res.scrollIntoView({ behavior:'smooth', block:'nearest' });
};

function resetQuiz() {
  document.querySelectorAll('.quiz-option').forEach(o => { o.disabled=false; o.classList.remove('correct','wrong'); });
  const r = document.getElementById('quiz-result');
  const b = document.getElementById('btn-retry');
  if (r) r.style.display = 'none';
  if (b) b.style.display = 'none';
}

/* ─── Modo Astrónomo ─── */
function updateAstronomerPanel() {
  const sys = simState.system;
  if (!sys || !sys.transits.length) {
    setAstroData('—','—','—','—','—', sys ? sys.spectralType : '—');
    return;
  }
  const tr = sys.transits[0];
  const depth    = (tr.dipDepth * 100).toFixed(3);
  const rPlanet  = Math.sqrt(tr.dipDepth) * sys.starRadius * 0.1 * 11; // Radio en R⊕ (aprox)
  const period   = (tr.period * 0.18).toFixed(1); // ticks → días simulados
  const bri      = (1 - tr.dipDepth).toFixed(4);
  const dur      = (tr.transitDuration * 0.18 * 24).toFixed(1); // días → horas

  setAstroData(depth, rPlanet.toFixed(2), period, bri, dur, sys.spectralType);
}

function setAstroData(depth, radius, period, bri, dur, type) {
  const set = (id, val) => { const el=document.getElementById(id); if(el) el.textContent=val; };
  set('astro-depth',      depth);
  set('astro-radius',     radius);
  set('astro-period',     period);
  set('astro-brightness', bri);
  set('astro-duration',   dur);
  set('astro-type',       type);
}

/* ─── Resize canvases ─── */
function resizeSimCanvases() {
  const tc = document.getElementById('telescope-canvas');
  const lc = document.getElementById('lightcurve-canvas');
  if (tc && tc.parentElement) {
    const w = tc.parentElement.clientWidth || 700;
    tc.width  = w;
    tc.height = window.innerWidth < 640 ? Math.min(w, 260) : Math.round(w * 0.42);
  }
  if (lc && lc.parentElement) {
    lc.width  = lc.parentElement.clientWidth || 700;
    lc.height = window.innerWidth < 640 ? 180 : 230;
  }
}

/* ─── Estrellas de fondo ─── */
function generateBgStars(n) {
  return Array.from({length:n}, () => ({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 0.9 + 0.2,
    alpha: Math.random() * 0.5 + 0.1,
    ts: Math.random() * 0.014 + 0.003,
    td: Math.random() > 0.5 ? 1 : -1,
  }));
}

/* ─── Precalcular curva de luz ─── */
function precomputeLightCurve(system, N) {
  const bri = new Float64Array(N).fill(1.0);
  // Variabilidad estelar intrínseca
  const sp = N * (0.4 + Math.random() * 0.4);
  const sa = 0.003 + Math.random() * 0.004;
  for (let i=0;i<N;i++) bri[i] += Math.sin((i/sp)*Math.PI*2)*sa;

  system.transits.forEach(tr => {
    let t = tr.phase % tr.period;
    while (t < N) {
      const center = t;
      const hd = tr.transitDuration / 2;
      const ing = hd * 0.3;
      for (let i=Math.max(0,Math.floor(center-hd-ing)); i<Math.min(N,Math.ceil(center+hd+ing)); i++) {
        const dt = Math.abs(i - center);
        let f = 0;
        if (dt <= hd - ing)      f = tr.dipDepth;
        else if (dt <= hd + ing) f = tr.dipDepth * (1 - smoothStep((dt-(hd-ing))/(ing*2)));
        bri[i] -= f;
      }
      t += tr.period;
    }
  });

  const na = 0.004 + Math.random() * 0.002;
  for (let i=0;i<N;i++) {
    bri[i] += gaussNoise() * na;
    bri[i] = Math.max(0.85, Math.min(1.02, bri[i]));
  }
  return Array.from(bri);
}
function smoothStep(t) { return t*t*(3-2*t); }
function gaussNoise() {
  const u = 1 - Math.random(), v = Math.random();
  return Math.sqrt(-2*Math.log(u)) * Math.cos(2*Math.PI*v);
}

/* ─── Bucle principal ─── */
function loopSim() {
  simState.tick      += simState.speed;
  simState.drawCursor = Math.min(Math.round(simState.tick), simState.lightCurveData.length);
  simState.elapsedSec += simState.speed * 0.18;
  updateHUD();
  drawTelescopeView();
  drawLightCurve();
  updateLcCount();
  simState.telescopeAnimId = requestAnimationFrame(loopSim);
}

/* ─── HUD ─── */
function updateHUD() {
  const ts = Math.round(simState.elapsedSec * 86400);
  const hh = String(Math.floor(ts/3600)%100).padStart(2,'0');
  const mm = String(Math.floor((ts%3600)/60)).padStart(2,'0');
  const ss = String(ts%60).padStart(2,'0');
  const timeEl = document.getElementById('hud-time');
  if (timeEl) timeEl.textContent = `T+${hh}:${mm}:${ss}`;

  const idx = Math.min(simState.drawCursor-1, simState.lightCurveData.length-1);
  const b = idx>=0 ? simState.lightCurveData[idx] : 1;
  const magEl = document.getElementById('hud-mag');
  if (magEl) magEl.textContent = `MAG: ${(8.5-b*0.5).toFixed(3)}`;

  const alertEl = document.getElementById('hud-transit-alert');
  if (alertEl) {
    simState.transitActive = b < 0.985;
    alertEl.style.opacity = simState.transitActive ? '1' : '0';
  }
}
function updateLcCount() {
  const el = document.getElementById('lc-points-count');
  if (el) el.textContent = `${Math.min(simState.drawCursor,simState.lightCurveData.length)} / ${simState.lightCurveData.length} puntos`;
}

/* ─── Vista telescópica ─── */
function drawTelescopeView() {
  const canvas = document.getElementById('telescope-canvas');
  if (!canvas || !simState.system) return;
  const ctx = canvas.getContext('2d');
  const W=canvas.width, H=canvas.height, cx=W/2, cy=H/2;

  ctx.fillStyle='#000005'; ctx.fillRect(0,0,W,H);
  // Neblina
  const ng=ctx.createRadialGradient(cx*.7,cy*.8,0,cx*.7,cy*.8,W*.5);
  ng.addColorStop(0,'rgba(20,30,80,0.07)'); ng.addColorStop(1,'transparent');
  ctx.fillStyle=ng; ctx.fillRect(0,0,W,H);

  // Estrellas de campo
  simState.bgStars.forEach(s=>{
    s.alpha += s.ts*s.td;
    if(s.alpha>0.75){s.alpha=0.75;s.td=-1;}
    if(s.alpha<0.05){s.alpha=0.05;s.td=1;}
    const sx=s.x*W, sy=s.y*H;
    if(Math.hypot(sx-cx,sy-cy)<45) return;
    ctx.beginPath(); ctx.arc(sx,sy,s.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(200,210,255,${s.alpha})`; ctx.fill();
  });

  const sys=simState.system, sR=sys.starRadius, sC=sys.starColor;
  const idx=Math.max(0,Math.min(simState.drawCursor-1,simState.lightCurveData.length-1));
  const bri=simState.lightCurveData.length>0?simState.lightCurveData[idx]:1;

  drawDiffractionSpikes(ctx,cx,cy,sR,sC,bri);

  // Halo
  const halo=ctx.createRadialGradient(cx,cy,sR*.8,cx,cy,sR*5);
  halo.addColorStop(0,hexRgba(sC,0.35*bri)); halo.addColorStop(0.3,hexRgba(sC,0.12*bri));
  halo.addColorStop(0.7,hexRgba(sC,0.04*bri)); halo.addColorStop(1,'transparent');
  ctx.beginPath(); ctx.arc(cx,cy,sR*5,0,Math.PI*2); ctx.fillStyle=halo; ctx.fill();

  // Cuerpo estelar
  const sg=ctx.createRadialGradient(cx-sR*.3,cy-sR*.3,0,cx,cy,sR);
  sg.addColorStop(0,`rgba(255,255,255,${bri})`);
  sg.addColorStop(0.4,hexRgba(sC,bri));
  sg.addColorStop(1,hexRgba(shadeHex(sC,-30),bri));
  ctx.beginPath(); ctx.arc(cx,cy,sR,0,Math.PI*2); ctx.fillStyle=sg; ctx.fill();

  // Planetas en tránsito
  sys.transits.forEach(tr=>{
    const t=simState.tick % tr.period;
    const tStart=tr.phase % tr.period;
    const tEnd=tStart+tr.transitDuration+20;
    if(t>tStart && t<tEnd){
      const frac=(t-tStart)/(tr.transitDuration+20);
      const px=cx+(frac*2-1)*(sR*2.5+tr.planetR*2);
      const py=cy+Math.sin(tr.phase*0.1)*sR*0.3;
      if(Math.hypot(px-cx,py-cy)<sR*2.5+tr.planetR){
        ctx.beginPath(); ctx.arc(px,py,tr.planetR+1.5,0,Math.PI*2);
        ctx.fillStyle='rgba(100,120,180,0.10)'; ctx.fill();
        ctx.beginPath(); ctx.arc(px,py,tr.planetR,0,Math.PI*2);
        ctx.fillStyle='rgba(2,4,10,0.97)'; ctx.fill();
      }
    }
  });
}

function drawDiffractionSpikes(ctx,cx,cy,sR,color,bri){
  ctx.save(); ctx.globalAlpha=0.17*bri;
  const sl=sR*14, sw=sR*0.25;
  [0,Math.PI/2,Math.PI/4,-Math.PI/4].forEach(a=>{
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(a);
    const g=ctx.createLinearGradient(-sl,0,sl,0);
    g.addColorStop(0,'transparent'); g.addColorStop(0.35,hexRgba(color,0.7));
    g.addColorStop(0.5,hexRgba(color,1.0)); g.addColorStop(0.65,hexRgba(color,0.7)); g.addColorStop(1,'transparent');
    ctx.beginPath();
    ctx.moveTo(-sl,-sw); ctx.lineTo(sl,-sw); ctx.lineTo(sl,sw); ctx.lineTo(-sl,sw);
    ctx.closePath(); ctx.fillStyle=g; ctx.fill(); ctx.restore();
  });
  ctx.restore();
}

/* ─── Curva de luz ─── */
function drawLightCurve(){
  const canvas=document.getElementById('lightcurve-canvas');
  if(!canvas||!simState.lightCurveData.length) return;
  const ctx=canvas.getContext('2d');
  const W=canvas.width,H=canvas.height;
  const data=simState.lightCurveData,N=data.length,cur=simState.drawCursor;
  const PAD={top:20,right:18,bottom:36,left:52};
  const pW=W-PAD.left-PAD.right, pH=H-PAD.top-PAD.bottom;

  ctx.fillStyle='#020508'; ctx.fillRect(0,0,W,H);

  // Grilla
  ctx.strokeStyle='rgba(255,255,255,0.045)'; ctx.lineWidth=1;
  for(let i=0;i<=5;i++){ const x=PAD.left+(pW/5)*i; ctx.beginPath(); ctx.moveTo(x,PAD.top); ctx.lineTo(x,PAD.top+pH); ctx.stroke(); }
  for(let i=0;i<=4;i++){ const y=PAD.top+(pH/4)*i; ctx.beginPath(); ctx.moveTo(PAD.left,y); ctx.lineTo(PAD.left+pW,y); ctx.stroke(); }

  // Eje Y
  ctx.fillStyle='rgba(148,163,184,0.55)'; ctx.font='9px DM Mono,monospace'; ctx.textAlign='right';
  const yMin=0.82,yMax=1.02,yR=yMax-yMin;
  for(let i=0;i<=4;i++){ const val=yMin+(yR/4)*i; const y=PAD.top+pH-(pH/4)*i; ctx.fillText(val.toFixed(3),PAD.left-5,y+3); }

  ctx.save(); ctx.translate(11,PAD.top+pH/2); ctx.rotate(-Math.PI/2);
  ctx.fillStyle='rgba(249,115,22,0.55)'; ctx.font='8px DM Mono,monospace'; ctx.textAlign='center';
  ctx.fillText('BRILLO RELATIVO',0,0); ctx.restore();

  ctx.fillStyle='rgba(249,115,22,0.45)'; ctx.font='8px DM Mono,monospace'; ctx.textAlign='center';
  ctx.fillText('TIEMPO (días de observación)',PAD.left+pW/2,H-6);
  ctx.fillStyle='rgba(148,163,184,0.45)';
  for(let i=0;i<=5;i++){ ctx.fillText(Math.round((i/5)*simState.elapsedSec*0.12)+'d', PAD.left+(pW/5)*i, H-20); }

  // Línea de referencia
  const ry=PAD.top+pH*(1-(1.0-yMin)/yR);
  ctx.beginPath(); ctx.moveTo(PAD.left,ry); ctx.lineTo(PAD.left+pW,ry);
  ctx.strokeStyle='rgba(96,165,250,0.3)'; ctx.lineWidth=1;
  ctx.setLineDash([6,8]); ctx.stroke(); ctx.setLineDash([]);

  if(cur<2) return;
  const xStep=pW/(N-1);

  // Área de relleno
  ctx.beginPath();
  for(let i=0;i<cur;i++){ const x=PAD.left+i*xStep; const y=PAD.top+pH*(1-(data[i]-yMin)/yR); if(i===0)ctx.moveTo(x,y); else ctx.lineTo(x,y); }
  ctx.lineTo(PAD.left+(cur-1)*xStep,PAD.top+pH); ctx.lineTo(PAD.left,PAD.top+pH); ctx.closePath();
  const ag=ctx.createLinearGradient(0,PAD.top,0,PAD.top+pH);
  ag.addColorStop(0,'rgba(249,115,22,0.10)'); ag.addColorStop(1,'transparent');
  ctx.fillStyle=ag; ctx.fill();

  // Línea de señal
  ctx.beginPath();
  for(let i=0;i<cur;i++){ const x=PAD.left+i*xStep; const y=PAD.top+pH*(1-(data[i]-yMin)/yR); if(i===0)ctx.moveTo(x,y); else ctx.lineTo(x,y); }
  ctx.strokeStyle='#f97316'; ctx.lineWidth=1.5; ctx.lineJoin='round'; ctx.stroke();

  // Punto live
  if(cur<N&&cur>0){
    const lx=PAD.left+(cur-1)*xStep; const lb=data[cur-1]; const ly=PAD.top+pH*(1-(lb-yMin)/yR);
    ctx.beginPath(); ctx.arc(lx,ly,7,0,Math.PI*2); ctx.fillStyle='rgba(251,191,36,0.18)'; ctx.fill();
    ctx.beginPath(); ctx.arc(lx,ly,3.5,0,Math.PI*2); ctx.fillStyle='#fbbf24'; ctx.fill();
  }

  // Etiqueta de caída activa
  if(simState.transitActive&&cur>0){
    const lb=data[cur-1]; const pct=((1-lb)*100).toFixed(2);
    const lx=PAD.left+(cur-1)*xStep; const ly=PAD.top+pH*(1-(lb-yMin)/yR);
    ctx.fillStyle='rgba(251,191,36,0.9)'; ctx.font='8px DM Mono,monospace'; ctx.textAlign='left';
    const lbx=lx+8<PAD.left+pW-60?lx+8:lx-62;
    ctx.fillText(`−${pct}%`,lbx,ly-6);
  }
}

/* ─── Utilidades de color ─── */
function hexRgba(hex,alpha){
  const n=parseInt(hex.replace('#',''),16);
  return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${alpha.toFixed(3)})`;
}
function shadeHex(hex,amt){
  const n=parseInt(hex.replace('#',''),16);
  const r=Math.max(0,Math.min(255,((n>>16)&255)+amt));
  const g=Math.max(0,Math.min(255,((n>>8)&255)+amt));
  const b=Math.max(0,Math.min(255,(n&255)+amt));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

/* ─── QR Code ─── */
function generateQRCode(){
  const canvas=document.getElementById('qr-canvas');
  if(!canvas) return;
  // URL fija apuntando al sitio en GitHub Pages
  const url='https://thejuanz.github.io/transito-de-venus/exoplanetas.html';
  const el=document.getElementById('qr-url-text');
  if(el) el.textContent=url;
  const img=new Image();
  img.crossOrigin='anonymous';
  img.onload=()=>{ const ctx=canvas.getContext('2d'); canvas.width=canvas.height=180; ctx.drawImage(img,0,0,180,180); };
  img.onerror=()=>drawFallbackQR(canvas,url);
  img.src=`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000&margin=2`;
}
function drawFallbackQR(canvas,text){
  const ctx=canvas.getContext('2d'); const size=180; canvas.width=canvas.height=size;
  const m=21; const c=size/m;
  ctx.fillStyle='#fff'; ctx.fillRect(0,0,size,size);
  function finder(ox,oy){ ctx.fillStyle='#000'; ctx.fillRect(ox*c,oy*c,7*c,7*c); ctx.fillStyle='#fff'; ctx.fillRect((ox+1)*c,(oy+1)*c,5*c,5*c); ctx.fillStyle='#000'; ctx.fillRect((ox+2)*c,(oy+2)*c,3*c,3*c); }
  finder(0,0); finder(m-7,0); finder(0,m-7);
  ctx.fillStyle='#000';
  for(let r=0;r<m;r++) for(let cc=0;cc<m;cc++){
    const iF=(r<9&&cc<9)||(r<9&&cc>=m-8)||(r>=m-8&&cc<9);
    if(!iF){ const s=Math.sin(r*m+cc+text.charCodeAt(0%text.length))*9999; if((s-Math.floor(s))>0.52) ctx.fillRect(cc*c,r*c,c,c); }
  }
}

/* ═══════════════════════════════════════════════════════════════
   10. QUIZ FINAL (quiz.html)
   ═══════════════════════════════════════════════════════════════ */

// Definición del banco de preguntas
const QUIZ_DATA = [
  {
    question: '¿Qué es el tránsito de Venus?',
    options: [
      'Venus pasa detrás del Sol',
      'Venus pasa frente al Sol visto desde la Tierra',
      'Venus eclipsa a la Tierra',
      'Venus orbita la Tierra',
    ],
    correct: 1,
    feedback: 'El tránsito ocurre cuando Venus se interpone entre la Tierra y el Sol, siendo visible como un pequeño disco oscuro moviéndose sobre la cara solar.',
  },
  {
    question: '¿Por qué es importante el tránsito de Venus en astronomía?',
    options: [
      'Permite medir la masa de la Tierra',
      'Permite ver el interior del Sol',
      'Permite medir la distancia Tierra-Sol',
      'Permite calcular la edad del Sol',
    ],
    correct: 2,
    feedback: 'Usando la paralaje solar y el método propuesto por Halley, los tránsitos de 1761 y 1769 permitieron medir por primera vez la Unidad Astronómica (149.6 millones de km).',
  },
  {
    question: '¿Cómo se descubren muchos exoplanetas hoy en día?',
    options: [
      'Escuchando ondas de radio',
      'Observando eclipses lunares',
      'Midiendo el brillo de las estrellas',
      'Enviando sondas a otras estrellas',
    ],
    correct: 2,
    feedback: 'El método del tránsito detecta la pequeña caída de brillo que produce un planeta al pasar frente a su estrella. El telescopio Kepler confirmó más de 2,600 exoplanetas con este método.',
  },
  {
    question: '¿Qué indica una caída en la curva de luz de una estrella?',
    options: [
      'La estrella explota',
      'Un planeta está pasando frente a ella',
      'La estrella desaparece',
      'Hay una tormenta solar',
    ],
    correct: 1,
    feedback: 'Una caída periódica y repetida en el brillo estelar es la firma inequívoca de un planeta en tránsito. La profundidad de la caída indica el tamaño relativo del planeta respecto a la estrella.',
  },
  {
    question: '¿Cuándo ocurrirá el próximo tránsito de Venus?',
    options: [
      'En el año 2050',
      'En el año 2117',
      'En el año 2200',
      'Ya no ocurrirá más',
    ],
    correct: 1,
    feedback: 'El próximo tránsito de Venus ocurrirá el 11 de diciembre de 2117. Los tránsitos se producen en pares separados por 8 años, con un intervalo de 105-121 años entre cada par.',
  },
];

let quizState = {
  current: 0,
  score: 0,
  answers: [],
  answered: false,
};

function initFinalQuiz() {
  // Mostrar primera pregunta
  showQuestion(0);
}

function showQuestion(idx) {
  // Ocultar todas
  document.querySelectorAll('.qz-question').forEach(q => q.style.display='none');
  // Mostrar la actual
  const el = document.getElementById('q'+idx);
  if (el) el.style.display='block';

  // Actualizar barra de progreso
  updateProgress(idx);

  // Adjuntar eventos a opciones de esta pregunta
  const qEl = document.getElementById('q'+idx);
  if (!qEl) return;
  qEl.querySelectorAll('.qz-option').forEach(btn => {
    btn.addEventListener('click', () => handleQuizAnswer(idx, parseInt(btn.dataset.i)), {once:true});
  });
}

function handleQuizAnswer(qIdx, selectedIdx) {
  const q = QUIZ_DATA[qIdx];
  const correct = selectedIdx === q.correct;
  if (correct) quizState.score++;
  quizState.answers[qIdx] = { selected: selectedIdx, correct };

  // Marcar opciones
  const qEl = document.getElementById('q'+qIdx);
  qEl.querySelectorAll('.qz-option').forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct)                  btn.classList.add('correct');
    else if (i === selectedIdx && !correct) btn.classList.add('wrong');
  });

  // Mostrar feedback
  const fb = document.getElementById('feedback-'+qIdx);
  if (fb) {
    fb.textContent = q.feedback;
    fb.style.display = 'block';
  }

  // Actualizar puntaje live
  document.getElementById('q-score-live').textContent = `Aciertos: ${quizState.score}`;

  // Avanzar o terminar
  setTimeout(() => {
    if (qIdx + 1 < QUIZ_DATA.length) {
      showQuestion(qIdx + 1);
    } else {
      showFinalResult();
    }
  }, 1400);
}

function updateProgress(idx) {
  const fill = document.getElementById('quiz-progress-fill');
  const text = document.getElementById('q-progress-text');
  if (fill) fill.style.width = ((idx / QUIZ_DATA.length) * 100) + '%';
  if (text) text.textContent = `Pregunta ${idx+1} de ${QUIZ_DATA.length}`;
}

function showFinalResult() {
  document.querySelector('.quiz-container').style.display = 'none';
  document.getElementById('quiz-progress-wrap').style.display = 'none';

  const result = document.getElementById('quiz-result-final');
  result.style.display = 'block';

  document.getElementById('result-score-num').textContent = quizState.score;

  const pct = quizState.score / QUIZ_DATA.length;
  let title, msg;
  if (pct === 1) {
    title = '🏆 ¡Perfecto! ¡Puntaje máximo!';
    msg   = '¡Extraordinario! Dominaste todos los conceptos sobre el tránsito de Venus y el método del tránsito para detectar exoplanetas. ¡Eres un astrónomo nato!';
  } else if (pct >= 0.8) {
    title = '⭐ ¡Excelente resultado!';
    msg   = `Obtuviste ${quizState.score} de ${QUIZ_DATA.length}. Entendiste muy bien cómo funciona el método del tránsito y su importancia histórica y actual. ¡Casi perfecto!`;
  } else if (pct >= 0.6) {
    title = '📚 ¡Buen intento!';
    msg   = `Obtuviste ${quizState.score} de ${QUIZ_DATA.length}. Tienes una buena base, pero hay algunos conceptos que vale la pena repasar. ¡Vuelve a explorar el sitio!`;
  } else {
    title = '🔭 Sigue explorando';
    msg   = `Obtuviste ${quizState.score} de ${QUIZ_DATA.length}. Te recomendamos revisar las secciones del sitio y luego volver a intentarlo. ¡El cosmos espera!`;
  }

  document.getElementById('result-title').textContent   = title;
  document.getElementById('result-message').textContent = msg;

  // Desglose
  const breakdown = document.getElementById('result-breakdown');
  breakdown.innerHTML = QUIZ_DATA.map((q, i) => {
    const ans = quizState.answers[i];
    const ok = ans && ans.correct;
    return `<div class="result-breakdown-item">
      <span>${i+1}. ${q.question.substring(0,45)}…</span>
      <span class="${ok?'ri-correct':'ri-wrong'}">${ok?'✓ Correcto':'✗ Incorrecto'}</span>
    </div>`;
  }).join('');
}

window.restartQuiz = function() {
  quizState = { current:0, score:0, answers:[], answered:false };
  document.getElementById('result-score-num').textContent = '0';
  document.getElementById('quiz-result-final').style.display = 'none';
  document.querySelector('.quiz-container').style.display = 'block';
  document.getElementById('quiz-progress-wrap').style.display = 'block';
  document.getElementById('q-score-live').textContent = 'Aciertos: 0';

  // Resetear preguntas
  QUIZ_DATA.forEach((q, i) => {
    const qEl = document.getElementById('q'+i);
    if (!qEl) return;
    qEl.querySelectorAll('.qz-option').forEach(b => { b.disabled=false; b.classList.remove('correct','wrong'); });
    const fb = document.getElementById('feedback-'+i);
    if (fb) fb.style.display = 'none';
  });

  showQuestion(0);
};

/* ─────────────────────────────────────────────
   11. INICIALIZACIÓN POR PÁGINA
   ─────────────────────────────────────────────
   Dependiendo del body.className, activamos
   solo los módulos relevantes para cada página.
   ───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Módulos que corren en TODAS las páginas
  initStarsCanvas();
  initNav();
  initCursor();
  initScrollAnimations();

  // Módulos específicos por página
  if (PAGE === 'page-home') {
    initCounters();
    initParallax();
    initTimeline();
  }

  if (PAGE === 'page-exoplanetas') {
    generateQRCode();
    // Scroll automático al #simulacion si viene de un QR
    if (window.location.hash === '#simulacion') {
      setTimeout(() => {
        const target = document.getElementById('simulacion');
        if (target) target.scrollIntoView({ behavior:'smooth' });
      }, 600);
    }
  }

  if (PAGE === 'page-quiz') {
    initFinalQuiz();
  }
});

/* ─────────────────────────────────────────────
   12. RESIZE HANDLER
   ─────────────────────────────────────────────
   Regenera canvases al cambiar el tamaño de pantalla.
   ───────────────────────────────────────────── */

let resizeTO;
window.addEventListener('resize', () => {
  clearTimeout(resizeTO);
  resizeTO = setTimeout(() => {
    if (PAGE === 'page-exoplanetas' && simState.system) {
      resizeSimCanvases();
    }
  }, 250);
});
