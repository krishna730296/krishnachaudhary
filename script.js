document.addEventListener('DOMContentLoaded', () => {

  // ─── Custom Cursor ───
  const cursor = document.getElementById('cursor');
  const cursorDot = cursor.querySelector('.cursor-dot');
  const cursorRing = cursor.querySelector('.cursor-ring');
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Cursor hover states
  document.querySelectorAll('a, button, .project-card:not(.current-project), .magnetic').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  });

  // ─── Mouse Glow ───
  const mouseGlow = document.getElementById('mouse-glow');
  document.addEventListener('mousemove', (e) => {
    mouseGlow.style.left = e.clientX + 'px';
    mouseGlow.style.top = e.clientY + 'px';
  });

  // ─── Grid Canvas ───
  const canvas = document.getElementById('grid-canvas');
  const ctx = canvas.getContext('2d');
  let gridMouse = { x: 0, y: 0 };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  document.addEventListener('mousemove', (e) => {
    gridMouse.x = e.clientX;
    gridMouse.y = e.clientY;
  });

  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const spacing = 60;
    const cols = Math.ceil(canvas.width / spacing) + 1;
    const rows = Math.ceil(canvas.height / spacing) + 1;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * spacing;
        const y = j * spacing;
        const dx = gridMouse.x - x;
        const dy = gridMouse.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 200;

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.15;
          ctx.fillStyle = `rgba(129, 140, 248, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    requestAnimationFrame(drawGrid);
  }
  drawGrid();

  // ─── Navbar ───
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) current = section.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  });

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  navLinks.forEach(link => link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navMenu.classList.remove('active');
  }));

  // ─── Text Scramble ───
  class TextScramble {
    constructor(el) {
      this.el = el;
      this.original = el.textContent;
      this.chars = '!<>-_\\/[]{}—=+*^?#________';
      this.frame = 0;
      this.queue = [];
      this.resolve = null;
    }
    setText(newText) {
      const oldText = this.original;
      const length = Math.max(oldText.length, newText.length);
      this.queue = [];
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 20);
        const end = start + Math.floor(Math.random() * 20);
        this.queue.push({ from, to, start, end });
      }
      this.frame = 0;
      return new Promise((resolve) => { this.resolve = resolve; });
    }
    update() {
      let output = '';
      let complete = 0;
      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];
        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.chars[Math.floor(Math.random() * this.chars.length)];
            this.queue[i].char = char;
          }
          output += char;
        } else {
          output += from;
        }
      }
      this.el.textContent = output;
      if (complete === this.queue.length) {
        this.resolve();
      } else {
        requestAnimationFrame(() => this.update());
        this.frame++;
      }
    }
  }

  // Scramble on load
  document.querySelectorAll('[data-scramble]').forEach(el => {
    const text = el.getAttribute('data-scramble');
    const scrambler = new TextScramble(el);
    setTimeout(() => {
      scrambler.setText(text).then(() => {
        el.textContent = text;
      });
    }, 800 + Math.random() * 400);
  });

  // ─── Terminal Typing ───
  const terminalLines = document.querySelectorAll('.terminal-line');
  terminalLines.forEach((line, i) => {
    setTimeout(() => line.classList.add('visible'), 600 + i * 180);
  });

  // ─── Scroll Reveal ───
  const revealElements = document.querySelectorAll('.reveal-up');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.getAttribute('data-delay')) || 0;
        setTimeout(() => entry.target.classList.add('revealed'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // ─── Magnetic Effect ───
  document.querySelectorAll('.magnetic').forEach(el => {
    const strength = parseFloat(el.getAttribute('data-strength')) || 0.3;
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => { el.style.transition = ''; }, 500);
    });
  });

  // ─── Smooth Scroll ───
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});
