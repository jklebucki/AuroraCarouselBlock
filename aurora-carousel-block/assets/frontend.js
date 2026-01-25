(function () {
  function toBool(v) {
    return v === '1' || v === 'true';
  }
  function toNum(v, fallback) {
    var n = Number(v);
    return isFinite(n) ? n : fallback;
  }

  function getConfig(root) {
    return {
      autoplay: toBool(root.dataset.autoplay),
      autoplayDelay: toNum(root.dataset.autoplayDelay, 3000),
      speed: toNum(root.dataset.speed, 500),
      pauseOnHover: toBool(root.dataset.pauseOnHover),
      loop: toBool(root.dataset.loop),
      arrows: toBool(root.dataset.arrows),
      dots: toBool(root.dataset.dots),
      spvM: toNum(root.dataset.spvM, 1.1),
      spvT: toNum(root.dataset.spvT, 2),
      spvD: toNum(root.dataset.spvD, 3),
      gapM: toNum(root.dataset.gapM, 12),
      gapT: toNum(root.dataset.gapT, 16),
      gapD: toNum(root.dataset.gapD, 20)
    };
  }

  function pickResponsive(cfg) {
    var w = window.innerWidth || 1200;
    if (w >= 1024) return { spv: cfg.spvD, gap: cfg.gapD };
    if (w >= 768) return { spv: cfg.spvT, gap: cfg.gapT };
    return { spv: cfg.spvM, gap: cfg.gapM };
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function initCarousel(root) {
    if (root.__auroraCarousel) return;

    var cfg = getConfig(root);
    var viewport = root.querySelector('.aurora-carousel__viewport');
    var track = root.querySelector('.aurora-carousel__track');
    if (!viewport || !track) return;

    var slides = Array.prototype.slice.call(root.querySelectorAll('.aurora-carousel__slide'));
    if (!slides.length) return;

    var btnPrev = root.querySelector('.aurora-carousel__prev');
    var btnNext = root.querySelector('.aurora-carousel__next');
    var pagination = root.querySelector('.aurora-carousel__pagination');

    // If only one slide, disable some features
    var single = slides.length <= 1;

    // State
    var state = {
      index: 0,
      timer: null,
      lastLayout: { spv: null, gap: null, slideW: null }
    };

    // Apply base styles
    track.style.transitionProperty = 'transform';
    track.style.transitionTimingFunction = 'ease';
    track.style.willChange = 'transform';

    function layout() {
      var responsive = pickResponsive(cfg);
      var spv = responsive.spv;
      var gap = responsive.gap;

      // Ensure sane values
      spv = Math.max(1, spv);
      gap = Math.max(0, gap);

      // Apply gap
      track.style.gap = gap + 'px';

      // Calculate slide width (supports fractional spv)
      var vw = viewport.getBoundingClientRect().width;
      var slideW = (vw - gap * (spv - 1)) / spv;

      // If viewport not measurable yet, skip
      if (!isFinite(slideW) || slideW <= 0) return;

      // Set slide widths
      for (var i = 0; i < slides.length; i++) {
        slides[i].style.flex = '0 0 ' + slideW + 'px';
        slides[i].style.maxWidth = slideW + 'px';
      }

      // Transition speed
      track.style.transitionDuration = cfg.speed + 'ms';

      state.lastLayout = { spv: spv, gap: gap, slideW: slideW };

      // Keep index within range
      state.index = clamp(state.index, 0, slides.length - 1);
      update(false);
    }

    function translateXForIndex(idx) {
      var L = state.lastLayout;
      var step = L.slideW + L.gap;
      return -(idx * step);
    }

    function update(animate) {
      if (animate === false) {
        // temporarily disable transition
        var prev = track.style.transitionDuration;
        track.style.transitionDuration = '0ms';
        track.style.transform = 'translate3d(' + translateXForIndex(state.index) + 'px,0,0)';
        // force reflow
        track.getBoundingClientRect();
        track.style.transitionDuration = prev;
      } else {
        track.style.transform = 'translate3d(' + translateXForIndex(state.index) + 'px,0,0)';
      }

      // Update dots
      if (cfg.dots && pagination) {
        var dots = pagination.querySelectorAll('.aurora-carousel__dot');
        for (var i = 0; i < dots.length; i++) {
          dots[i].setAttribute('aria-current', i === state.index ? 'true' : 'false');
        }
      }

      // Update arrow disabled state when not looping
      if (cfg.arrows && btnPrev && btnNext && !cfg.loop) {
        btnPrev.disabled = (state.index === 0);
        btnNext.disabled = (state.index === slides.length - 1);
      }
    }

    function goTo(idx) {
      if (single) return;
      if (cfg.loop) {
        if (idx < 0) idx = slides.length - 1;
        if (idx >= slides.length) idx = 0;
      } else {
        idx = clamp(idx, 0, slides.length - 1);
      }
      state.index = idx;
      update(true);
    }

    function next() { goTo(state.index + 1); }
    function prev() { goTo(state.index - 1); }

    function stopAutoplay() {
      if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
      }
    }

    function startAutoplay() {
      if (!cfg.autoplay || single) return;
      stopAutoplay();
      state.timer = setInterval(function () {
        next();
      }, Math.max(300, cfg.autoplayDelay));
    }

    function buildDots() {
      if (!pagination) return;
      pagination.innerHTML = '';
      if (!cfg.dots || single) return;

      for (var i = 0; i < slides.length; i++) {
        (function (dotIndex) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'aurora-carousel__dot';
          b.setAttribute('aria-label', 'Go to slide ' + (dotIndex + 1));
          b.setAttribute('aria-current', dotIndex === state.index ? 'true' : 'false');
          b.addEventListener('click', function () {
            goTo(dotIndex);
          });
          pagination.appendChild(b);
        })(i);
      }
    }

    function applyControlsVisibility() {
      if (btnPrev && btnNext) {
        var show = cfg.arrows && !single;
        btnPrev.style.display = show ? '' : 'none';
        btnNext.style.display = show ? '' : 'none';
      }
      if (pagination) {
        pagination.style.display = (cfg.dots && !single) ? '' : 'none';
      }
    }

    // Events
    if (btnPrev) btnPrev.addEventListener('click', prev);
    if (btnNext) btnNext.addEventListener('click', next);

    // Pause on hover
    if (cfg.pauseOnHover && cfg.autoplay && !single) {
      root.addEventListener('mouseenter', stopAutoplay);
      root.addEventListener('mouseleave', startAutoplay);
    }

    // Keyboard navigation (when focused)
    root.addEventListener('keydown', function (e) {
      if (!cfg.arrows || single) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    });

    // Touch swipe (basic)
    var touch = { active: false, startX: 0, dx: 0 };
    viewport.addEventListener('touchstart', function (e) {
      if (single) return;
      touch.active = true;
      touch.startX = e.touches[0].clientX;
      touch.dx = 0;
      stopAutoplay();
    }, { passive: true });

    viewport.addEventListener('touchmove', function (e) {
      if (!touch.active) return;
      touch.dx = e.touches[0].clientX - touch.startX;
    }, { passive: true });

    viewport.addEventListener('touchend', function () {
      if (!touch.active) return;
      touch.active = false;
      // threshold based on slide width
      var threshold = Math.max(30, (state.lastLayout.slideW || 300) * 0.15);
      if (touch.dx > threshold) prev();
      else if (touch.dx < -threshold) next();
      startAutoplay();
    });

    // Resize
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layout, 80);
    });

    // Init
    buildDots();
    applyControlsVisibility();
    layout();
    startAutoplay();

    root.__auroraCarousel = {
      destroy: function () {
        stopAutoplay();
        root.__auroraCarousel = null;
      }
    };
  }

  function initAll() {
    var nodes = document.querySelectorAll('.wp-block-aurora-carousel');
    for (var i = 0; i < nodes.length; i++) initCarousel(nodes[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
