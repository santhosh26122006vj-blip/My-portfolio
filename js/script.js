/* ====================================================================
   SANTHOSH — PORTFOLIO SITE SCRIPT
   Site-wide behaviour shared across all pages.
   Structure:
   0. Welcome Screen (home page only, once per browser session)
   1. Preloader
   2. Scroll Progress Bar
   3. Custom Cursor
   4. Navbar (scroll state + mobile menu + smooth scroll)
   5. Theme Toggle (dark/light + localStorage)
   6. Ripple Click Effect
   7. Scroll Reveal (IntersectionObserver)
   8. Animated Counters
   9. 3D Tilt Card Hover
   10. Hero Typing Effect + Mouse Parallax
   11. Testimonial Slider
   12. Back To Top
   13. Contact Form Validation + Web3Forms Submission
   14. Footer Year
   15. Magnetic Buttons
   16. Page Transitions (native CSS View Transitions — see style.css)
   ==================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ==================== 0. WELCOME SCREEN ==================== */
  // Only present in index.html's markup, so this safely no-ops on every
  // other page. Shows once per browser tab session (sessionStorage, not
  // localStorage) so it greets a visitor arriving at the site but never
  // repeats itself while they browse around or refresh the home page.
  const welcomeScreen = document.getElementById('welcomeScreen');
  if (welcomeScreen) {
    const alreadyWelcomed = sessionStorage.getItem('portfolio-welcomed');
    if (alreadyWelcomed) {
      welcomeScreen.remove();
    } else {
      sessionStorage.setItem('portfolio-welcomed', 'true');
      document.body.style.overflow = 'hidden';

      // Splash stays visible for a fixed 5.2s "brand moment" — the loader
      // bar and percentage count up across that same window so the wait
      // reads as a deliberate intro rather than the page just being slow.
      const WELCOME_DURATION = 5200;
      const loaderBar = document.getElementById('welcomeLoaderBar');
      const loaderPercent = document.getElementById('welcomeLoaderPercent');
      const startTime = performance.now();

      function tickProgress(now) {
        const elapsed = now - startTime;
        const pct = Math.min(100, Math.round((elapsed / WELCOME_DURATION) * 100));
        if (loaderBar) loaderBar.style.width = pct + '%';
        if (loaderPercent) loaderPercent.textContent = pct + '%';
        if (elapsed < WELCOME_DURATION) requestAnimationFrame(tickProgress);
      }
      requestAnimationFrame(tickProgress);

      const minDisplay = new Promise((resolve) => setTimeout(resolve, WELCOME_DURATION));
      const pageLoaded = new Promise((resolve) => {
        if (document.readyState === 'complete') resolve();
        else window.addEventListener('load', resolve);
      });
      Promise.all([minDisplay, pageLoaded]).then(() => {
        welcomeScreen.classList.add('hidden');
        document.body.style.overflow = '';
        setTimeout(() => welcomeScreen.remove(), 800);
      });
    }
  }


  /* ==================== 1. PRELOADER ==================== */
  const preloader = document.getElementById('preloader');
  // Body starts at opacity:0 (see style.css) so the whole page eases in
  // together instead of popping in behind the preloader. This always
  // fires, even if the preloader element is ever missing from a page.
  const revealPage = () => document.body.classList.add('page-ready');

  if (preloader) {
    // Fade the preloader out once everything (images/fonts) has loaded.
    // A minimum display time keeps it from flashing on fast connections.
    const minDisplay = new Promise((resolve) => setTimeout(resolve, 500));
    const pageLoaded = new Promise((resolve) => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve);
    });
    Promise.all([minDisplay, pageLoaded]).then(() => {
      preloader.classList.add('loaded');
      revealPage();
      setTimeout(() => preloader.remove(), 700);
    });
  } else {
    revealPage();
  }


  /* ==================== 2. SCROLL PROGRESS BAR ==================== */
  const scrollProgress = document.getElementById('scrollProgress');
  function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = percent + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();


  /* ==================== 3. CUSTOM CURSOR ==================== */
  const cursorDot = document.getElementById('cursorDot');
  const cursorFollower = document.getElementById('cursorFollower');
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  if (cursorDot && cursorFollower && !isTouchDevice) {
    document.body.classList.add('has-custom-cursor');

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    // Smoothly ease the follower toward the pointer for a "trailing glow" feel.
    function animateFollower() {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      cursorFollower.style.left = followerX + 'px';
      cursorFollower.style.top = followerY + 'px';
      requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Expand the cursor on interactive elements.
    const hoverTargets = 'a, button, .gallery-item, .tilt-card, input, textarea';
    document.querySelectorAll(hoverTargets).forEach((el) => {
      el.addEventListener('mouseenter', () => cursorFollower.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => cursorFollower.classList.remove('cursor-hover'));
    });
  }


  /* ==================== 4. NAVBAR ==================== */
  const navbar = document.getElementById('navbar');
  function updateNavbarState() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', updateNavbarState, { passive: true });
  updateNavbarState();

  // Mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen);
    });
    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll('.mobile-link').forEach((link) => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', false);
      });
    });
  }

  // Smooth scroll for same-page anchor links (e.g. #skills)
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });


  /* ==================== 5. THEME TOGGLE ==================== */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  // The actual theme is already applied the instant the page starts
  // loading by the small blocking script in <head> (so there's never a
  // white-then-dark flash on a slow connection) — dark is the site's
  // default, and it only stays light if the visitor explicitly chose
  // light before. Nothing to set here; this section just wires up the
  // click handler to flip and persist the choice.
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      if (isDark) {
        root.removeAttribute('data-theme');
        localStorage.setItem('portfolio-theme', 'light');
      } else {
        root.setAttribute('data-theme', 'dark');
        localStorage.setItem('portfolio-theme', 'dark');
      }
    });
  }


  /* ==================== 6. RIPPLE CLICK EFFECT ==================== */
  document.querySelectorAll('.ripple').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const circle = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      circle.classList.add('ripple-circle');
      circle.style.width = circle.style.height = size + 'px';
      circle.style.left = (e.clientX - rect.left - size / 2) + 'px';
      circle.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(circle);
      setTimeout(() => circle.remove(), 650);
    });
  });


  /* ==================== 7. SCROLL REVEAL ==================== */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => revealObserver.observe(el));
  }


  /* ==================== 8. ANIMATED COUNTERS ==================== */
  const counters = document.querySelectorAll('.counter');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10) || 0;
        const duration = 1400;
        const startTime = performance.now();

        function tick(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          // Ease-out for a natural "settling" count-up feel
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach((c) => counterObserver.observe(c));
  }


  /* ==================== 9. 3D TILT CARD HOVER ==================== */
  // Sets --rx/--ry/--lift custom properties consumed by the [data-tilt] rule
  // in style.css (section 28), so the shine sweep, glow and lift stay baked
  // into one transform instead of fighting a separate hover rule.
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  if (!isCoarsePointer) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('mouseenter', () => {
        card.style.setProperty('--lift', '-18px');
      });
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -14;
        const rotateY = ((x - centerX) / centerX) * 14;
        card.style.setProperty('--rx', `${rotateX}deg`);
        card.style.setProperty('--ry', `${rotateY}deg`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--lift', '0px');
      });
    });
  }


  /* ==================== 10. HERO TYPING EFFECT + PARALLAX ==================== */
  const typedTarget = document.getElementById('typedText');
  if (typedTarget) {
    const phrases = [
      'Graphic Designer',
      'Video Editor',
      'Motion Designer',
      '3D Artist',
      'Brand Designer'
    ];
    let phraseIndex = 0, charIndex = 0, deleting = false;

    function typeLoop() {
      const current = phrases[phraseIndex];
      if (!deleting) {
        charIndex++;
        typedTarget.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(typeLoop, 1400);
          return;
        }
      } else {
        charIndex--;
        typedTarget.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      }
      setTimeout(typeLoop, deleting ? 40 : 80);
    }
    typeLoop();
  }

  // Mouse parallax for floating glass shapes in the hero background
  const heroShapes = document.querySelectorAll('.hero .glass-shape');
  const heroSection = document.getElementById('hero');
  const heroPhotoFrame = document.querySelector('.hero-photo-frame');
  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const { innerWidth, innerHeight } = window;
      const xRatio = (e.clientX / innerWidth) - 0.5;
      const yRatio = (e.clientY / innerHeight) - 0.5;

      heroShapes.forEach((shape, i) => {
        const depth = (i + 1) * 14;
        shape.style.transform = `translate(${xRatio * depth}px, ${yRatio * depth}px)`;
      });

      // The hero portrait itself gets a subtle 3D tilt toward the cursor —
      // full page-width tracking reads as a deliberate depth effect rather
      // than a jittery per-card tilt.
      if (heroPhotoFrame && !isCoarsePointer) {
        heroPhotoFrame.style.transform =
          `perspective(1400px) rotateX(${yRatio * -10}deg) rotateY(${xRatio * 14}deg)`;
      }
    });
    heroSection.addEventListener('mouseleave', () => {
      if (heroPhotoFrame) heroPhotoFrame.style.transform = 'perspective(1400px) rotateX(0deg) rotateY(0deg)';
    });
  }


  /* ==================== 11. TESTIMONIAL SLIDER ==================== */
  const testimonialTrack = document.getElementById('testimonialTrack');
  const testimonialDotsWrap = document.getElementById('testimonialDots');
  if (testimonialTrack && testimonialDotsWrap) {
    const cards = testimonialTrack.querySelectorAll('.testimonial-card');

    cards.forEach((_, i) => {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => scrollToCard(i));
      testimonialDotsWrap.appendChild(dot);
    });
    const dots = testimonialDotsWrap.querySelectorAll('span');

    function scrollToCard(index) {
      const card = cards[index];
      testimonialTrack.scrollTo({ left: card.offsetLeft - testimonialTrack.offsetLeft, behavior: 'smooth' });
    }

    // Highlight the active dot as the user scrolls the track
    testimonialTrack.addEventListener('scroll', () => {
      let closestIndex = 0;
      let closestDistance = Infinity;
      cards.forEach((card, i) => {
        const distance = Math.abs(card.offsetLeft - testimonialTrack.scrollLeft - testimonialTrack.offsetLeft);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === closestIndex));
    }, { passive: true });

    // Auto-advance every 5 seconds, looping back to the start
    let autoIndex = 0;
    setInterval(() => {
      autoIndex = (autoIndex + 1) % cards.length;
      scrollToCard(autoIndex);
    }, 5000);
  }


  /* ==================== 12. BACK TO TOP ==================== */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ==================== 13. CONTACT FORM VALIDATION + WEB3FORMS SUBMISSION ==================== */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const formSuccess = document.getElementById('formSuccess');
    const formFail = document.getElementById('formFail');
    const submitBtn = contactForm.querySelector('.form-submit');

    function validateField(field) {
      const group = field.closest('.form-group');
      if (!group) return true;
      let valid = true;

      if (field.hasAttribute('required') && !field.value.trim()) {
        valid = false;
      } else if (field.type === 'email' && field.value.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        valid = emailPattern.test(field.value.trim());
      } else if (field.id === 'message' && field.value.trim().length < 10) {
        valid = false;
      }

      group.classList.toggle('invalid', !valid);
      return valid;
    }

    // Validate on blur for immediate feedback
    contactForm.querySelectorAll('input, textarea').forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
    });

    function showStatus(el) {
      formSuccess.classList.remove('visible');
      formFail.classList.remove('visible');
      if (el) {
        el.classList.add('visible');
        setTimeout(() => el.classList.remove('visible'), 6000);
      }
    }

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Honeypot: if the hidden checkbox got checked, it's a bot — silently
      // pretend success and stop, never hit the API.
      const honeypot = contactForm.querySelector('input[name="botcheck"]');
      if (honeypot && honeypot.checked) {
        contactForm.reset();
        return;
      }

      const fields = contactForm.querySelectorAll('input[required], textarea[required]');
      let formValid = true;
      fields.forEach((field) => {
        if (!validateField(field)) formValid = false;
      });
      if (!formValid) return;

      const accessKey = contactForm.querySelector('input[name="access_key"]')?.value || '';
      if (!accessKey || accessKey.includes('YOUR_WEB3FORMS')) {
        // No real key configured yet — fail loudly instead of faking success,
        // so this doesn't get mistaken for a working form.
        showStatus(formFail);
        return;
      }

      if (submitBtn) submitBtn.classList.add('is-loading');

      const formData = new FormData(contactForm);

      fetch(contactForm.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            showStatus(formSuccess);
            contactForm.reset();
          } else {
            showStatus(formFail);
          }
        })
        .catch(() => {
          showStatus(formFail);
        })
        .finally(() => {
          if (submitBtn) submitBtn.classList.remove('is-loading');
        });
    });
  }


  /* ==================== 14. FOOTER YEAR ==================== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ==================== 15. MAGNETIC BUTTONS ==================== */
  // Any element with [data-magnetic] gets a small pull-toward-cursor effect,
  // driven by the --mx/--my custom properties consumed in style.css
  // (section 28). Skipped on touch devices where there's no real cursor.
  if (!isCoarsePointer) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        const pull = 0.35; // strength of the magnetic pull
        el.style.setProperty('--mx', `${relX * pull}px`);
        el.style.setProperty('--my', `${relY * pull}px`);
      });
      el.addEventListener('mouseleave', () => {
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      });
    });
  }

  /* ==================== 16. PAGE TRANSITIONS ==================== */
  // Handled natively via the CSS View Transitions API (see style.css —
  // @view-transition + ::view-transition-old/new(root)) instead of a JS
  // click-intercept + setTimeout delay. The old approach added a fixed
  // ~400ms of dead time before the browser even started loading the next
  // page, which is what was making navigation feel laggy. The native API
  // is GPU-composited, adds no delay, and simply does a normal instant
  // navigation on any browser that doesn't support it yet — no JS needed
  // here at all.

});
