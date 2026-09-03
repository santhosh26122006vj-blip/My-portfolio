/* ====================================================================
   SANTHOSH — PORTFOLIO GALLERY SCRIPT
   Runs on graphics.html, video.html and modeling.html.
   Structure:
   1. Image Lightbox
   2. Video Fullscreen Controls
   ==================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ==================== 1. IMAGE LIGHTBOX ==================== */
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxTriggers = Array.from(document.querySelectorAll('[data-lightbox]'));

    // Which filter category an item belongs to — either the trigger itself
    // carries [data-category] (gallery figures) or it sits inside a
    // wrapper that does (e.g. the standalone renders on the 3D page).
    function getCategory(item) {
      if (item.dataset.category) return item.dataset.category;
      const wrap = item.closest('[data-category]');
      return wrap ? wrap.dataset.category : null;
    }

    // Everything open-able in the same category the visitor clicked into,
    // in on-page order — this is what left/right/swipe step through, so
    // navigation always stays "inside the category".
    let activeGroup = [];
    let activeIndex = 0;

    function buildGroup(startItem) {
      const category = getCategory(startItem);
      return lightboxTriggers.filter((t) => category === null || getCategory(t) === category);
    }

    function renderItem(item) {
      const img = item.tagName === 'IMG' ? item : item.querySelector('img');
      const title = item.querySelector ? item.querySelector('h4') : null;
      if (!img) return;

      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt || '';
      lightboxCaption.textContent = title ? title.textContent : '';

      const showNav = activeGroup.length > 1;
      if (lightboxPrev) lightboxPrev.classList.toggle('is-hidden', !showNav);
      if (lightboxNext) lightboxNext.classList.toggle('is-hidden', !showNav);
    }

    function openLightbox(item) {
      activeGroup = buildGroup(item);
      activeIndex = Math.max(activeGroup.indexOf(item), 0);
      renderItem(item);
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function showStep(delta) {
      if (activeGroup.length < 2) return;
      activeIndex = (activeIndex + delta + activeGroup.length) % activeGroup.length;
      renderItem(activeGroup[activeIndex]);
    }

    lightboxTriggers.forEach((item) => {
      item.addEventListener('click', () => openLightbox(item));
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showStep(-1); });
    if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showStep(1); });

    // Close when clicking the dark backdrop (but not the image itself)
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard: Escape to close, arrow keys to step through the category
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') showStep(-1);
      else if (e.key === 'ArrowRight') showStep(1);
    });

    // Touch swipe (mobile): swipe left = next image, swipe right = previous
    let touchStartX = 0;
    let touchStartY = 0;
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      // Ignore mostly-vertical swipes so scrolling/closing gestures aren't hijacked
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        showStep(dx < 0 ? 1 : -1);
      }
    }, { passive: true });
  }


  /* ==================== 2. VIDEO FULLSCREEN CONTROLS ==================== */
  document.querySelectorAll('[data-fullscreen]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const wrap = btn.closest('.video-wrap');
      const video = wrap ? wrap.querySelector('video') : null;
      if (!video) return;

      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitEnterFullscreen) {
        // iOS Safari uses its own fullscreen API on the video element itself
        video.webkitEnterFullscreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      }
    });
  });

});
