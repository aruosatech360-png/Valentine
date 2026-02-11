document.addEventListener('DOMContentLoaded', () => {
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const buttons = document.getElementById('buttons');
  const canvas = document.getElementById('confetti-canvas');
  const celebration = document.getElementById('celebration');
  const closeCelebration = document.getElementById('closeCelebration');

  // Prepare canvas
  const ctx = canvas.getContext('2d');
  let W = window.innerWidth;
  let H = window.innerHeight;
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Move the No button to a random location across the viewport
  function moveNoButton() {
    noBtn.style.position = 'fixed';
    const btnRect = noBtn.getBoundingClientRect();
    const margin = 24;
    const maxLeft = Math.max(0, window.innerWidth - btnRect.width - margin);
    const maxTop = Math.max(0, window.innerHeight - btnRect.height - margin);
    const left = Math.random() * maxLeft + margin / 2;
    const top = Math.random() * maxTop + margin / 2;
    noBtn.style.left = left + 'px';
    noBtn.style.top = top + 'px';
  }

  // Move when the cursor gets close
  buttons.addEventListener('mousemove', (e) => {
    const btnRect = noBtn.getBoundingClientRect();
    const cx = btnRect.left + btnRect.width / 2;
    const cy = btnRect.top + btnRect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    // larger radius so the button runs away earlier
    if (dist < 260) moveNoButton();
  });

  // Also move on touch
  buttons.addEventListener('touchstart', (e) => moveNoButton());

  // If user somehow clicks No, show a playful reply
  noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    alert("Oh no — it won't let you choose that! ❤️");
    moveNoButton();
  });

  // Confetti system
  let particles = [];
  let animId = null;

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function launchConfetti(x = W / 2, y = H / 2, amount = 150) {
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#fb7185', '#a78bfa', '#60a5fa'];
    for (let i = 0; i < amount; i++) {
      particles.push({
        x: x,
        y: y,
        vx: rand(-6, 6),
        vy: rand(-10, -2),
        size: rand(6, 12),
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: rand(0, Math.PI * 2),
        life: rand(60, 120)
      });
    }
    canvas.style.display = 'block';
    if (!animId) animate();
  }

  function animate() {
    animId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, W, H);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += 0.12; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rot += 0.1;
      p.life -= 1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      ctx.restore();
      if (p.y > H + 50 || p.life <= 0) particles.splice(i, 1);
    }
    if (particles.length === 0) {
      cancelAnimationFrame(animId);
      animId = null;
      canvas.style.display = 'none';
    }
  }

  // Show celebration overlay + confetti
  function showCelebration() {
    celebration.style.display = 'flex';
    // Launch confetti from yes button position
    const rect = yesBtn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    launchConfetti(x, y, 180);
    setTimeout(() => launchConfetti(W/2, H/3, 120), 350);
  }

  yesBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showCelebration();
  });

  closeCelebration.addEventListener('click', () => {
    celebration.style.display = 'none';
    particles = [];
    if (animId) cancelAnimationFrame(animId);
    animId = null;
    canvas.style.display = 'none';
  });

  // Hide the loader when the loader video ends (fallback to short timeout)
  const loader = document.getElementById('loader');
  const loaderVideo = document.getElementById('loader-video');
  if (loader) {
    if (loaderVideo) {
      // when video ends, fade out the loader
        loaderVideo.addEventListener('ended', () => {
          loader.classList.add('fade-out');
          setTimeout(() => { loader.style.display = 'none'; }, 420);
        });
        // if the video errors or cannot play, show the image fallback then hide
        const fallbackImg = document.getElementById('loader-fallback');
        function showFallbackAndHide() {
          if (fallbackImg) {
            fallbackImg.style.display = 'block';
            loaderVideo.style.display = 'none';
          }
          setTimeout(() => { loader.classList.add('fade-out'); setTimeout(() => { loader.style.display = 'none'; }, 420); }, 1200);
        }
        loaderVideo.addEventListener('error', showFallbackAndHide);
        // If the video never fires 'playing' within 1s, assume autoplay blocked and show fallback
        let played = false;
        loaderVideo.addEventListener('playing', () => { played = true; });
        setTimeout(() => { if (!played) showFallbackAndHide(); }, 1000);
      // try to play (some browsers require this even if autoplay+muted)
      loaderVideo.play().catch(() => {});
    } else {
      // fallback short delay
      setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => { loader.style.display = 'none'; }, 420);
      }, 900);
    }
  }
});
