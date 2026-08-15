document.addEventListener('DOMContentLoaded', () => {

  // Navbar
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  // Scroll: navbar style + active link
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  });

  // Mobile menu
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Terminal typing effect
  const terminalBody = document.querySelector('.terminal-body');
  if (terminalBody) {
    const lines = terminalBody.querySelectorAll('.terminal-line');
    terminalBody.style.opacity = '0';
    
    setTimeout(() => {
      terminalBody.style.opacity = '1';
      lines.forEach((line, i) => {
        line.style.opacity = '0';
        line.style.transform = 'translateX(-8px)';
        line.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
          line.style.opacity = '1';
          line.style.transform = 'translateX(0)';
        }, 150 * i);
      });
    }, 400);
  }

  // Intersection Observer for reveals
  const revealElements = document.querySelectorAll('.about-card, .project-card, .stack-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => observer.observe(el));

  // Smooth scroll
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
