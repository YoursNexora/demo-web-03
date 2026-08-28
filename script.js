/* ==========================================================================
   AURELLE — Beauty Atelier & Spa
   Vanilla JS · No dependencies
   ========================================================================== */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  /* ------------------------------------------------------------------
     1. Toast
  ------------------------------------------------------------------ */
  const toast = $('#toast');
  const toastMsg = $('#toastMsg');
  let toastTimer = null;

  function showToast(message) {
    toastMsg.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3400);
  }

  /* ------------------------------------------------------------------
     2. Sticky nav: scrolled state
  ------------------------------------------------------------------ */
  const nav = $('#siteNav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ------------------------------------------------------------------
     3. Scrollspy — highlight the nav link of the section in view
  ------------------------------------------------------------------ */
  const navLinks = $$('.nav-link');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) =>
        link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id)
      );
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  ['services', 'artists', 'gallery', 'testimonials', 'contact']
    .map((id) => document.getElementById(id))
    .forEach((sec) => sec && spy.observe(sec));

  /* ------------------------------------------------------------------
     4. Scroll-reveal + staggered groups
  ------------------------------------------------------------------ */
  $$('[data-reveal-stagger]').forEach((group) => {
    $$(':scope > *', group).forEach((child, i) => {
      child.classList.add('reveal');
      child.style.setProperty('--d', `${Math.min(i * 90, 540)}ms`);
    });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach((el) => revealObserver.observe(el));

  /* ------------------------------------------------------------------
     5. Hero stat count-up
  ------------------------------------------------------------------ */
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countObserver.unobserve(entry.target);

      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1500;
      const start = performance.now();

      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });

  $$('[data-count]').forEach((el) => countObserver.observe(el));

  /* ------------------------------------------------------------------
     6. Mobile drawer
  ------------------------------------------------------------------ */
  const drawer = $('#mobileDrawer');
  const drawerOverlay = $('#drawerOverlay');
  const burger = $('#navBurger');
  let drawerReturnFocus = null;

  const isDrawerOpen = () => drawer.classList.contains('is-open');

  function openDrawer() {
    drawerReturnFocus = document.activeElement;
    drawer.classList.add('is-open');
    drawerOverlay.classList.add('is-open');
    burger.classList.add('is-active');
    burger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    $('#drawerClose').focus();
  }

  function closeDrawer() {
    if (!isDrawerOpen()) return;
    drawer.classList.remove('is-open');
    drawerOverlay.classList.remove('is-open');
    burger.classList.remove('is-active');
    burger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (drawerReturnFocus) drawerReturnFocus.focus();
  }

  burger.addEventListener('click', () => (isDrawerOpen() ? closeDrawer() : openDrawer()));
  drawerOverlay.addEventListener('click', closeDrawer);
  $('#drawerClose').addEventListener('click', closeDrawer);

  // Drawer links: close, then glide to the target section
  $$('.drawer-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const hash = link.getAttribute('href');
      closeDrawer();
      setTimeout(() => {
        const target = $(hash);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }, 260);
    });
  });

  /* ------------------------------------------------------------------
     7. Service tabs (with sliding ink indicator + keyboard support)
  ------------------------------------------------------------------ */
  const tabList = $('#serviceTabs');
  const tabBtns = $$('.tab-btn', tabList);
  const tabInk = $('.tab-ink', tabList);
  const tabPanels = $$('.tab-panel');

  function moveInk(btn) {
    tabInk.style.left = `${btn.offsetLeft}px`;
    tabInk.style.width = `${btn.offsetWidth}px`;
  }

  function activateTab(btn) {
    tabBtns.forEach((b) => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
    });
    tabPanels.forEach((p) => {
      const on = p.id === `panel-${btn.dataset.tab}`;
      p.classList.toggle('is-active', on);
      p.hidden = !on;
    });
    moveInk(btn);
    tabList.scrollTo({
      left: btn.offsetLeft - (tabList.clientWidth - btn.offsetWidth) / 2,
      behavior: 'smooth'
    });
  }

  tabBtns.forEach((btn) => btn.addEventListener('click', () => activateTab(btn)));

  tabList.addEventListener('keydown', (e) => {
    const idx = tabBtns.indexOf(document.activeElement);
    if (idx === -1) return;
    let next = null;
    if (e.key === 'ArrowRight') next = tabBtns[(idx + 1) % tabBtns.length];
    else if (e.key === 'ArrowLeft') next = tabBtns[(idx - 1 + tabBtns.length) % tabBtns.length];
    else if (e.key === 'Home') next = tabBtns[0];
    else if (e.key === 'End') next = tabBtns[tabBtns.length - 1];
    if (next) {
      e.preventDefault();
      next.focus();
      activateTab(next);
    }
  });

  // Position the ink once typography has settled, and keep it aligned on resize
  const positionInk = () => {
    const active = $('.tab-btn.is-active', tabList);
    if (active) moveInk(active);
  };
  window.addEventListener('load', positionInk);
  window.addEventListener('resize', positionInk);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(positionInk);
  positionInk();

  /* ------------------------------------------------------------------
     8. Gallery filter (dynamic counts + staggered re-entry)
  ------------------------------------------------------------------ */
  const gItems = $$('.g-item');
  const filterBtns = $$('.filter-btn');

  // Append live counts to each filter button
  filterBtns.forEach((btn) => {
    const f = btn.dataset.filter;
    const n = f === 'all' ? gItems.length : gItems.filter((i) => i.dataset.cat === f).length;
    const count = document.createElement('span');
    count.className = 'filter-count';
    count.textContent = n;
    btn.appendChild(count);
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      const f = btn.dataset.filter;
      let shown = 0;

      gItems.forEach((item) => {
        const match = f === 'all' || item.dataset.cat === f;
        item.classList.toggle('is-hidden', !match);
        if (match) {
          item.classList.remove('g-in');
          void item.offsetWidth; // restart the entry animation
          item.style.animationDelay = `${shown * 70}ms`;
          item.classList.add('g-in');
          shown++;
        }
      });
    });
  });

  /* ------------------------------------------------------------------
     9. Before / After comparison slider (pointer + keyboard)
  ------------------------------------------------------------------ */
  const ba = $('#baSlider');
  const baHandle = $('#baHandle');
  const baHint = $('#baHint');
  let baPos = 50;
  let baDragging = false;

  function setBaPos(p) {
    baPos = clamp(p, 3, 97);
    ba.style.setProperty('--pos', `${baPos}%`);
    baHandle.setAttribute('aria-valuenow', String(Math.round(baPos)));
  }

  const baPosFromEvent = (e) => {
    const rect = ba.getBoundingClientRect();
    return ((e.clientX - rect.left) / rect.width) * 100;
  };

  ba.addEventListener('pointerdown', (e) => {
    baDragging = true;
    ba.classList.add('is-dragging');
    if (baHint) baHint.classList.add('is-hidden');
    setBaPos(baPosFromEvent(e));
    if (ba.setPointerCapture) ba.setPointerCapture(e.pointerId);
  });

  ba.addEventListener('pointermove', (e) => {
    if (baDragging) setBaPos(baPosFromEvent(e));
  });

  ['pointerup', 'pointercancel'].forEach((ev) =>
    ba.addEventListener(ev, () => {
      baDragging = false;
      ba.classList.remove('is-dragging');
    })
  );

  baHandle.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); setBaPos(baPos - 4); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); setBaPos(baPos + 4); }
  });

  /* ------------------------------------------------------------------
     10. Testimonial carousel (auto-advance, swipe, dots, arrows)
  ------------------------------------------------------------------ */
  const tTrack = $('#tTrack');
  const tSlides = $$('.t-slide');
  const tDotsWrap = $('#tDots');
  const tCarousel = $('#tCarousel');
  let tIndex = 0;
  let tTimer = null;

  tSlides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'car-dot';
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTestimonial(i, true));
    tDotsWrap.appendChild(dot);
  });
  const tDots = $$('.car-dot', tDotsWrap);

  function goTestimonial(i, fromUser) {
    tIndex = (i + tSlides.length) % tSlides.length;
    tTrack.style.transform = `translateX(-${tIndex * 100}%)`;
    tDots.forEach((d, j) => d.classList.toggle('is-active', j === tIndex));
    if (fromUser) startAutoRotate();
  }

  function startAutoRotate() {
    stopAutoRotate();
    tTimer = setInterval(() => goTestimonial(tIndex + 1), 6500);
  }
  function stopAutoRotate() {
    if (tTimer) clearInterval(tTimer);
    tTimer = null;
  }

  $('#tPrev').addEventListener('click', () => goTestimonial(tIndex - 1, true));
  $('#tNext').addEventListener('click', () => goTestimonial(tIndex + 1, true));

  // Pause while the reader is engaged (hover or keyboard focus inside)
  tCarousel.addEventListener('mouseenter', stopAutoRotate);
  tCarousel.addEventListener('mouseleave', startAutoRotate);
  tCarousel.addEventListener('focusin', stopAutoRotate);
  tCarousel.addEventListener('focusout', startAutoRotate);

  // Pause when the tab is hidden so we never "skip" reviews invisibly
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAutoRotate() : startAutoRotate();
  });

  // Touch / pointer swipe
  let swipeStartX = null;
  $('#tViewport').addEventListener('pointerdown', (e) => { swipeStartX = e.clientX; });
  $('#tViewport').addEventListener('pointerup', (e) => {
    if (swipeStartX === null) return;
    const delta = e.clientX - swipeStartX;
    if (Math.abs(delta) > 45) goTestimonial(tIndex + (delta < 0 ? 1 : -1), true);
    swipeStartX = null;
  });

  goTestimonial(0);
  startAutoRotate();

  /* ------------------------------------------------------------------
     11. Booking modal — open/close, focus trap, quick-book preselect
  ------------------------------------------------------------------ */
  const overlay = $('#bookingModal');
  const modalPanel = $('#bookingPanel');
  const bookingForm = $('#bookingForm');
  const bookingSuccess = $('#bookingSuccess');
  const successBadge = $('#successBadge');
  const successSummary = $('#successSummary');
  const bkSubmit = $('#bkSubmit');
  const bkSubmitLabel = $('#bkSubmitLabel');
  const serviceSelect = $('#bkService');
  const timeSelect = $('#bkTime');
  const dateInput = $('#bkDate');

  let modalOpen = false;
  let modalReturnFocus = null;

  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function trapTab(e, container) {
    const focusables = $$(FOCUSABLE, container).filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function resetModalState() {
    bookingForm.reset();
    bookingForm.hidden = false;
    bookingSuccess.hidden = true;
    successBadge.classList.remove('play');
    $$('.field', bookingForm).forEach((f) => f.classList.remove('is-invalid', 'shake'));
    $$('.field-error', bookingForm).forEach((err) => { err.hidden = true; err.textContent = ''; });
    $$('input, select, textarea', bookingForm).forEach((el) => {
      el.removeAttribute('aria-invalid');
      delete el.dataset.touched;
    });
    bkSubmit.classList.remove('is-loading');
    bkSubmit.disabled = false;
    bkSubmitLabel.textContent = 'Request appointment';
  }

  function openModal(servicePreset) {
    if (bookingForm.hidden) resetModalState();
    modalReturnFocus = document.activeElement;

    if (servicePreset) {
      serviceSelect.value = servicePreset;
      delete serviceSelect.dataset.touched;
      const wrap = serviceSelect.closest('.field');
      wrap.classList.remove('is-invalid');
      const err = $('#bkServiceError');
      err.hidden = true; err.textContent = '';
      serviceSelect.removeAttribute('aria-invalid');
    }

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    modalOpen = true;
    setTimeout(() => $('#bookingTitle').focus(), 80);
  }

  function closeModal() {
    if (!modalOpen) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    modalOpen = false;
    if (modalReturnFocus) modalReturnFocus.focus();
    setTimeout(resetModalState, 400);
  }

  // Every element carrying [data-open-booking] opens the modal;
  // those with [data-service] preselect the treatment ("quick book")
  $$('[data-open-booking]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (isDrawerOpen()) closeDrawer();
      const service = el.dataset.service || null;
      openModal(service);
      if (service) showToast(`${service} — tell us when suits you`);
    });
  });

  $('#modalClose').addEventListener('click', closeModal);
  $('#successClose').addEventListener('click', closeModal);

  // Backdrop click (the overlay itself, never the panel)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Global keys: ESC to close, TAB trapped inside whichever layer is open
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modalOpen) closeModal();
      else if (isDrawerOpen()) closeDrawer();
    }
    if (e.key === 'Tab') {
      if (modalOpen) trapTab(e, modalPanel);
      else if (isDrawerOpen()) trapTab(e, drawer);
    }
  });

  /* ------------------------------------------------------------------
     12. Booking form — date floor, time slots, inline validation
  ------------------------------------------------------------------ */
  // Populate time slots 09:00 – 19:00
  (function fillTimeSlots() {
    const frag = document.createDocumentFragment();
    for (let h = 9; h <= 19; h++) {
      [0, 30].forEach((m) => {
        if (h === 19 && m === 30) return;
        const opt = document.createElement('option');
        const label = `${String(h).padStart(2, '0')}:${m === 0 ? '00' : '30'}`;
        opt.value = label;
        opt.textContent = label;
        frag.appendChild(opt);
      });
    }
    timeSelect.appendChild(frag);
  })();

  // Dates can't be in the past
  (function setDateFloor() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    dateInput.min = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  })();

  const validators = {
    bkName: (v) => (v.trim().length >= 2 ? '' : 'Please share your full name.'),
    bkPhone: (v) =>
      /^[\d\s()+\-]{7,18}$/.test(v.trim()) ? '' : 'Enter a phone number we can reach you on.',
    bkEmail: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'That email doesn\u2019t look quite right.',
    bkService: (v) => (v ? '' : 'Choose the treatment you\u2019re dreaming of.'),
    bkDate: (v) => {
      if (!v) return 'Pick a date for your visit.';
      const chosen = new Date(`${v}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return chosen < today ? 'Please choose today or a later date.' : '';
    },
    bkTime: (v) => (v ? '' : 'Choose a time that suits you.')
  };

  function showError(id, message) {
    const input = document.getElementById(id);
    const wrap = input.closest('.field');
    const err = document.getElementById(`${id}Error`);
    if (message) {
      wrap.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
      err.textContent = message;
      err.hidden = false;
    } else {
      wrap.classList.remove('is-invalid');
      input.removeAttribute('aria-invalid');
      err.textContent = '';
      err.hidden = true;
    }
  }

  Object.keys(validators).forEach((id) => {
    const el = document.getElementById(id);
    const revalidate = () => {
      if (el.dataset.touched === '1') showError(id, validators[id](el.value));
    };
    el.addEventListener('blur', () => {
      el.dataset.touched = '1';
      showError(id, validators[id](el.value));
    });
    el.addEventListener('input', revalidate);
    el.addEventListener('change', revalidate);
  });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  function renderSuccessSummary() {
    const rawDate = dateInput.value;
    const niceDate = rawDate
      ? new Date(`${rawDate}T00:00:00`).toLocaleDateString('en-GB', {
          weekday: 'long', day: 'numeric', month: 'long'
        })
      : '';

    const rows = [
      ['Treatment', serviceSelect.value],
      ['Artist', $('#bkStylist').value],
      ['Date', niceDate],
      ['Time', timeSelect.value],
      ['Guest', $('#bkName').value]
    ];

    successSummary.innerHTML = rows
      .map(([k, v]) => `<li><span>${k}</span><strong>${escapeHtml(v)}</strong></li>`)
      .join('');
  }

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate every required field; focus + gently shake the first offender
    let firstInvalid = null;
    Object.keys(validators).forEach((id) => {
      const el = document.getElementById(id);
      el.dataset.touched = '1';
      const message = validators[id](el.value);
      showError(id, message);
      if (message && !firstInvalid) firstInvalid = el;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      const wrap = firstInvalid.closest('.field');
      wrap.classList.add('shake');
      setTimeout(() => wrap.classList.remove('shake'), 500);
      return;
    }

    // Simulated concierge round-trip, then confirmation panel
    bkSubmit.classList.add('is-loading');
    bkSubmit.disabled = true;
    bkSubmitLabel.textContent = 'Sending your request\u2026';

    setTimeout(() => {
      renderSuccessSummary();
      bookingForm.hidden = true;
      bookingSuccess.hidden = false;
      successBadge.classList.remove('play');
      void successBadge.offsetWidth; // restart the stroke animation
      successBadge.classList.add('play');
      $('#successClose').focus();
    }, 1400);
  });

  /* ------------------------------------------------------------------
     13. Newsletter (inline validation, elegant success swap)
  ------------------------------------------------------------------ */
  const newsForm = $('#newsForm');
  const newsEmail = $('#newsEmail');
  const newsError = $('#newsError');
  const newsSuccess = $('#newsSuccess');
  const newsField = $('.news-field');

  newsEmail.addEventListener('input', () => {
    if (!newsError.hidden) {
      newsError.hidden = true;
      newsField.classList.remove('is-invalid');
    }
  });

  newsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = newsEmail.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      newsError.textContent = 'Please enter a valid email address.';
      newsError.hidden = false;
      newsField.classList.add('is-invalid');
      newsEmail.focus();
      return;
    }

    newsError.hidden = true;
    newsField.classList.remove('is-invalid');
    newsField.classList.add('is-done');
    newsEmail.disabled = true;
    $('.news-field button').disabled = true;
    newsSuccess.hidden = false;
    showToast('Subscribed — welcome to the inner circle');
  });

  /* ------------------------------------------------------------------
     14. Footer niceties — today's hours highlighted, live year
  ------------------------------------------------------------------ */
  const today = new Date().getDay(); // 0 = Sunday
  $$('#hoursList li').forEach((li) => {
    if (parseInt(li.dataset.day, 10) === today) li.classList.add('today');
  });

  $('#year').textContent = String(new Date().getFullYear());
})();
