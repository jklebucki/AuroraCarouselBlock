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

    var originalSlides = Array.prototype.slice.call(track.querySelectorAll('.aurora-carousel__slide'));
    if (!originalSlides.length) return;

    var btnPrev = root.querySelector('.aurora-carousel__prev');
    var btnNext = root.querySelector('.aurora-carousel__next');
    var pagination = root.querySelector('.aurora-carousel__pagination');

    // If only one slide, disable some features
    var single = originalSlides.length <= 1;

    // State
    var state = {
      page: 0,
      virtualPage: 0,
      timer: null,
      lastLayout: { spv: null, gap: null, slideW: null, pageSize: null, pageCount: null, maxStart: null }
    };

    // Apply base styles
    track.style.transitionProperty = 'transform';
    track.style.transitionTimingFunction = 'ease';
    track.style.willChange = 'transform';

    function getAllSlides() {
      return Array.prototype.slice.call(track.querySelectorAll('.aurora-carousel__slide'));
    }

    function cleanupClones() {
      var clones = track.querySelectorAll('[data-aurora-clone="1"]');
      for (var i = 0; i < clones.length; i++) {
        clones[i].parentNode.removeChild(clones[i]);
      }
    }

    function buildClones(pageSize) {
      cleanupClones();
      if (!cfg.loop || single) return;
      if (originalSlides.length <= pageSize) return;

      var head = originalSlides.slice(0, pageSize);
      var tail = originalSlides.slice(Math.max(0, originalSlides.length - pageSize));

      // Prepend tail clones
      for (var i = 0; i < tail.length; i++) {
        var c1 = tail[i].cloneNode(true);
        c1.setAttribute('data-aurora-clone', '1');
        track.insertBefore(c1, track.firstChild);
      }

      // Append head clones
      for (var j = 0; j < head.length; j++) {
        var c2 = head[j].cloneNode(true);
        c2.setAttribute('data-aurora-clone', '1');
        track.appendChild(c2);
      }
    }

    function getPageSize(spv) {
      return Math.max(1, Math.round(spv));
    }

    function isSinglePage() {
      return !state.lastLayout.pageCount || state.lastLayout.pageCount <= 1;
    }

    function layout() {
      var responsive = pickResponsive(cfg);
      var spv = responsive.spv;
      var gap = responsive.gap;

      // Ensure sane values
      spv = Math.max(1, spv);
      gap = Math.max(0, gap);

      var pageSize = getPageSize(spv);
      var pageCount = Math.ceil(originalSlides.length / pageSize);
      var maxStart = Math.max(0, originalSlides.length - pageSize);

      if (state.lastLayout.pageSize !== pageSize) {
        buildClones(pageSize);
      }

      var slides = getAllSlides();

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

      state.lastLayout = { spv: spv, gap: gap, slideW: slideW, pageSize: pageSize, pageCount: pageCount, maxStart: maxStart };

      // Keep page within range
      state.page = clamp(state.page, 0, pageCount - 1);
      if (!cfg.loop || originalSlides.length <= pageSize) {
        state.virtualPage = state.page;
      }

      buildDots();
      applyControlsVisibility();
      update(false);
    }

    function slideStartForPage(pageIndex) {
      var L = state.lastLayout;
      var pageSize = L.pageSize;
      var maxStart = L.maxStart;
      var base = (cfg.loop && originalSlides.length > pageSize) ? pageSize : 0;

      if (cfg.loop && originalSlides.length > pageSize) {
        if (pageIndex === -1) return 0;
        if (pageIndex === L.pageCount) return base + originalSlides.length;
      }

      var start = Math.min(pageIndex * pageSize, maxStart);
      return base + start;
    }

    function translateXForPage(pageIndex) {
      var L = state.lastLayout;
      var step = L.slideW + L.gap;
      return -(slideStartForPage(pageIndex) * step);
    }

    function update(animate) {
      if (animate === false) {
        // temporarily disable transition
        var prev = track.style.transitionDuration;
        track.style.transitionDuration = '0ms';
        track.style.transform = 'translate3d(' + translateXForPage(state.virtualPage) + 'px,0,0)';
        // force reflow
        track.getBoundingClientRect();
        track.style.transitionDuration = prev;
      } else {
        track.style.transform = 'translate3d(' + translateXForPage(state.virtualPage) + 'px,0,0)';
      }

      // Update dots
      if (cfg.dots && pagination) {
        var dots = pagination.querySelectorAll('.aurora-carousel__dot');
        for (var i = 0; i < dots.length; i++) {
          dots[i].setAttribute('aria-current', i === state.page ? 'true' : 'false');
        }
      }

      // Update arrow disabled state when not looping
      if (cfg.arrows && btnPrev && btnNext && (!cfg.loop || originalSlides.length <= state.lastLayout.pageSize)) {
        btnPrev.disabled = (state.page === 0);
        btnNext.disabled = (state.page === state.lastLayout.pageCount - 1);
      }
    }

    function goTo(page) {
      if (single || isSinglePage()) return;
      var pageCount = state.lastLayout.pageCount;
      var pageSize = state.lastLayout.pageSize;

      if (cfg.loop && originalSlides.length > pageSize) {
        if (page < 0) {
          state.page = pageCount - 1;
          state.virtualPage = -1;
        } else if (page >= pageCount) {
          state.page = 0;
          state.virtualPage = pageCount;
        } else {
          state.page = page;
          state.virtualPage = page;
        }
      } else {
        page = clamp(page, 0, pageCount - 1);
        state.page = page;
        state.virtualPage = page;
      }
      update(true);
    }

    function next() { goTo(state.page + 1); }
    function prev() { goTo(state.page - 1); }

    function stopAutoplay() {
      if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
      }
    }

    function startAutoplay() {
      if (!cfg.autoplay || single || isSinglePage()) return;
      stopAutoplay();
      state.timer = setInterval(function () {
        next();
      }, Math.max(300, cfg.autoplayDelay));
    }

    function buildDots() {
      if (!pagination) return;
      pagination.innerHTML = '';
      if (!cfg.dots || single || isSinglePage()) return;

      for (var i = 0; i < state.lastLayout.pageCount; i++) {
        (function (dotIndex) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'aurora-carousel__dot';
          b.setAttribute('aria-label', 'Go to page ' + (dotIndex + 1));
          b.setAttribute('aria-current', dotIndex === state.page ? 'true' : 'false');
          b.addEventListener('click', function () {
            goTo(dotIndex);
          });
          pagination.appendChild(b);
        })(i);
      }
    }

    function applyControlsVisibility() {
      if (btnPrev && btnNext) {
        var show = cfg.arrows && !single && !isSinglePage();
        btnPrev.style.display = show ? '' : 'none';
        btnNext.style.display = show ? '' : 'none';
      }
      if (pagination) {
        pagination.style.display = (cfg.dots && !single && !isSinglePage()) ? '' : 'none';
      }
    }

    // Events
    if (btnPrev) btnPrev.addEventListener('click', prev);
    if (btnNext) btnNext.addEventListener('click', next);

    // Seamless loop snapping
    track.addEventListener('transitionend', function (e) {
      if (e.propertyName !== 'transform') return;
      if (!cfg.loop) return;
      if (originalSlides.length <= state.lastLayout.pageSize) return;
      if (state.virtualPage === -1) {
        state.virtualPage = state.lastLayout.pageCount - 1;
        update(false);
      } else if (state.virtualPage === state.lastLayout.pageCount) {
        state.virtualPage = 0;
        update(false);
      }
    });

    // Pause on hover
    if (cfg.pauseOnHover && cfg.autoplay && !single) {
      root.addEventListener('mouseenter', stopAutoplay);
      root.addEventListener('mouseleave', startAutoplay);
    }

    // Keyboard navigation (when focused)
    root.addEventListener('keydown', function (e) {
      if (!cfg.arrows || single || isSinglePage()) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    });

    // Touch swipe (basic)
    var touch = { active: false, startX: 0, dx: 0 };
    viewport.addEventListener('touchstart', function (e) {
      if (single || isSinglePage()) return;
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
