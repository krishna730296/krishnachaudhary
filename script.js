document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.style.opacity = '0';
    hero.style.transform = 'translateY(20px)';
    requestAnimationFrame(() => {
      hero.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      hero.style.opacity = '1';
      hero.style.transform = 'translateY(0)';
    });
  }

  const cards = document.querySelectorAll('.about-card, .project-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
});
