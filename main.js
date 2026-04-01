/* ============================================================
   SVERIGE VM 2026 – MAIN JS
   Confetti · Nav · Scroll Reveal
   ============================================================ */

// ---- NAV SCROLL EFFECT ----
const nav = document.getElementById('nav');
const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

menuBtn.addEventListener('click', () => {
  mobileNav.classList.toggle('active');
  document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
});

function closeMobileNav() {
  mobileNav.classList.remove('active');
  document.body.style.overflow = '';
}

// ---- SCROLL REVEAL ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal-left, .reveal-right, .reveal-scroll').forEach((el) => {
  revealObserver.observe(el);
});

// Apply scroll-reveal to select elements
const scrollRevealSelectors = [
  '.goal-card',
  '.potter-body',
  '.potter-stat',
  '.gstat',
  '.group-match',
  '.section__header',
  '.vm-tagline',
  '.gyokeres-quote-wrap',
  '.match-quote',
];

scrollRevealSelectors.forEach((sel) => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add('reveal-scroll');
    el.style.transitionDelay = `${i * 0.07}s`;
    revealObserver.observe(el);
  });
});

// ---- CONFETTI ----
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const COLORS = [
  '#006AA7', '#1a8ac4', '#4db0e0',  // Swedish blue shades
  '#F5C518', '#fad44a', '#c9a010',  // Gold shades
  '#f8f4ec', '#ffffff',              // White
];

class Particle {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = Math.random() * canvas.width;
    this.y = initial ? Math.random() * canvas.height * -0.5 - 10 : -10;
    this.size = Math.random() * 10 + 4;
    this.speedY = Math.random() * 3 + 1.5;
    this.speedX = (Math.random() - 0.5) * 2;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.15;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
    this.opacity = 1;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = Math.random() * 0.05 + 0.02;
  }

  update() {
    this.y += this.speedY;
    this.wobble += this.wobbleSpeed;
    this.x += this.speedX + Math.sin(this.wobble) * 0.8;
    this.rotation += this.rotationSpeed;

    // Fade out near bottom
    if (this.y > canvas.height * 0.75) {
      this.opacity = Math.max(0, 1 - (this.y - canvas.height * 0.75) / (canvas.height * 0.25));
    }

    if (this.y > canvas.height + 20) {
      this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;

    if (this.shape === 'rect') {
      ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// Start with burst then settle into steady stream
const particles = [];
const BURST_COUNT = 200;
const STEADY_COUNT = 80;

// Initial burst
for (let i = 0; i < BURST_COUNT; i++) {
  const p = new Particle();
  p.y = Math.random() * canvas.height * 0.6;
  particles.push(p);
}

// Add steady particles over time
let steadyTimer = null;
function addSteadyParticles() {
  if (particles.length < BURST_COUNT + STEADY_COUNT) {
    particles.push(new Particle());
  }
}
steadyTimer = setInterval(addSteadyParticles, 400);

// Stop confetti after 12 seconds
setTimeout(() => {
  clearInterval(steadyTimer);
  // Gradually drain particles
  const drainInterval = setInterval(() => {
    if (particles.length > 0) {
      particles.splice(0, 5);
    } else {
      clearInterval(drainInterval);
      canvas.style.display = 'none';
    }
  }, 200);
}, 12000);

let animRunning = true;
function animate() {
  if (!animRunning) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animate);
}
animate();

// ---- SMOOTH COUNTER ANIMATION ----
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  const isDecimal = String(target).includes('.');

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    const current = Math.round(target * eased);

    el.textContent = isDecimal
      ? (target * eased).toFixed(1)
      : String(target).match(/^\d+$/) ? current : target;

    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = el.dataset.target;
  }
  requestAnimationFrame(update);
}

// Observe stat numbers
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = '1';
      const val = entry.target.dataset.target;
      if (/^\d+$/.test(val)) {
        animateCounter(entry.target, parseInt(val));
      }
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.potter-stat__num, .gstat__num').forEach((el) => {
  const text = el.textContent.trim();
  if (/^\d+$/.test(text)) {
    el.dataset.target = text;
    el.textContent = '0';
    statObserver.observe(el);
  }
});

// ---- PARALLAX ON HERO ----
document.addEventListener('mousemove', (e) => {
  const stripes = document.querySelectorAll('.stripe');
  const mx = (e.clientX / window.innerWidth - 0.5) * 2;
  const my = (e.clientY / window.innerHeight - 0.5) * 2;

  stripes.forEach((stripe, i) => {
    const factor = (i + 1) * 8;
    stripe.style.transform = `translate(${mx * factor}px, ${my * factor}px)`;
  });
});

// ---- TIMELINE ITEMS SCROLL REVEAL ----
const timelineItems = document.querySelectorAll('.timeline-item');
const timelineObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.15 });

timelineItems.forEach((item, i) => {
  item.style.opacity = '0';
  item.style.transform = 'translateY(40px)';
  item.style.transition = `opacity 0.7s ease ${i * 0.1}s, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.1}s`;
  timelineObserver.observe(item);
});
