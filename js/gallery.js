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

    /* ---- Scroll-wheel zoom + drag-to-pan ---------------------------------
       scale 1 = fit to screen (the default). The wheel zooms toward the
       pointer, so the spot under the cursor stays put. Once zoomed in the
       image can be dragged around; double-click toggles 2x / reset. */
    const MIN_SCALE = 1;
    const MAX_SCALE = 6;
    let scale = 1;
    let panX = 0;
    let panY = 0;

    // Small floating hint / zoom readout, injected so no page markup changes.
    const zoomHint = document.createElement('div');
    zoomHint.className = 'lightbox-zoom-hint';
    zoomHint.textContent = 'Scroll to zoom';
    lightbox.appendChild(zoomHint);

    function applyTransform() {
      lightboxImage.style.transform =
        'translate(' + panX + 'px, ' + panY + 'px) scale(' + scale + ')';
      lightboxImage.classList.toggle('is-zoomed', scale > 1);
      zoomHint.textContent = scale > 1
        ? Math.round(scale * 100) + '%  ·  drag to pan'
        : 'Scroll to zoom';
    }

    function resetZoom() {
      scale = 1;
      panX = 0;
      panY = 0;
      lightboxImage.classList.remove('is-panning');
      applyTransform();
    }

    // Clamp the pan so the image can never be dragged completely off-screen.
    function clampPan() {
      const rect = lightboxImage.getBoundingClientRect();
      const baseW = rect.width / scale;
      const baseH = rect.height / scale;
      const maxX = Math.max(0, (baseW * scale - baseW) / 2);
      const maxY = Math.max(0, (baseH * scale - baseH) / 2);
      panX = Math.min(maxX, Math.max(-maxX, panX));
      panY = Math.min(maxY, Math.max(-maxY, panY));
    }

    function zoomAt(clientX, clientY, nextScale) {
      nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
      if (nextScale === scale) return;

      if (nextScale === MIN_SCALE) {
        resetZoom();
        return;
      }

      const rect = lightboxImage.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const ratio = nextScale / scale;

      // Keep the point under the pointer anchored while scaling.
      panX -= (clientX - centerX) * (ratio - 1);
      panY -= (clientY - centerY) * (ratio - 1);
      scale = nextScale;

      clampPan();
      applyTransform();
    }

    lightbox.addEventListener('wheel', (e) => {
      if (!lightbox.classList.contains('open')) return;
      e.preventDefault();                       // don't scroll the page behind
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      zoomAt(e.clientX, e.clientY, scale * factor);
    }, { passive: false });

    // Double-click / double-tap: quick zoom in, or back to fit.
    lightboxImage.addEventListener('dblclick', (e) => {
      e.preventDefault();
      if (scale > 1) resetZoom();
      else zoomAt(e.clientX, e.clientY, 2);
    });

    // Drag to pan (mouse, pen and touch via pointer events)
    let dragging = false;
    let dragMoved = false;
    let startX = 0;
    let startY = 0;

    lightboxImage.addEventListener('pointerdown', (e) => {
      if (scale <= 1) return;
      dragging = true;
      dragMoved = false;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
      lightboxImage.classList.add('is-panning');
      if (lightboxImage.setPointerCapture) lightboxImage.setPointerCapture(e.pointerId);
    });

    lightboxImage.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      dragMoved = true;
      clampPan();
      applyTransform();
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      lightboxImage.classList.remove('is-panning');
    }
    lightboxImage.addEventListener('pointerup', endDrag);
    lightboxImage.addEventListener('pointercancel', endDrag);

    // Clicking a zoomed image (to drag it) must never close the lightbox.
    lightboxImage.addEventListener('click', (e) => {
      if (scale > 1 || dragMoved) e.stopPropagation();
    });

    function renderItem(item) {
      const img = item.tagName === 'IMG' ? item : item.querySelector('img');
      const title = item.querySelector ? item.querySelector('h4') : null;
      if (!img) return;

      resetZoom();
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
      resetZoom();
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
      if (scale > 1) return;   // zoomed in: the gesture is a pan, not a swipe
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
