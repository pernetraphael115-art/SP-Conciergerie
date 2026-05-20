/* ============================================
   SP CONCIERGERIE — Script V2
   Modal-based navigation
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Header scroll effect ---
  const header = document.querySelector('.site-header');

  function handleScroll() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // --- Mobile navigation ---
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  function closeMobileNav() {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('open');
    if (isOpen) {
      closeMobileNav();
    } else {
      hamburger.classList.add('open');
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  });

  // --- Modal system ---
  const modals = document.querySelectorAll('.modal');
  let activeModal = null;

  function openModal(id) {
    const modal = document.getElementById('modal-' + id);
    if (!modal) return;

    // Close any currently open modal first
    if (activeModal) {
      closeActiveModal(() => {
        showModal(modal);
      });
      return;
    }

    showModal(modal);
  }

  function showModal(modal) {
    activeModal = modal;
    document.body.style.overflow = 'hidden';

    // Reset scroll position of the panel
    const panel = modal.querySelector('.modal-panel');
    if (panel) panel.scrollTop = 0;

    // Push history state so back button closes modal
    history.pushState({ modal: modal.id }, '');

    // Show modal
    modal.classList.add('active');
    closeMobileNav();
  }

  function closeActiveModal(callback, fromPopstate) {
    if (!activeModal) {
      if (callback) callback();
      return;
    }

    const modal = activeModal;
    modal.classList.remove('active');

    // If NOT triggered by back button, go back in history to clean up
    if (!fromPopstate) {
      history.back();
    }

    // Wait for exit animation
    setTimeout(() => {
      document.body.style.overflow = '';
      activeModal = null;
      if (callback) callback();
    }, 500);
  }

  // --- Back button closes modal ---
  window.addEventListener('popstate', (e) => {
    if (activeModal) {
      closeActiveModal(null, true);
    }
  });

  // Bind all data-modal triggers
  document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = trigger.dataset.modal;
      openModal(modalId);
    });
  });

  // Close on backdrop click
  modals.forEach(modal => {
    const backdrop = modal.querySelector('.modal-backdrop');
    const closeBtn = modal.querySelector('.modal-close');

    if (backdrop) {
      backdrop.addEventListener('click', () => {
        closeActiveModal();
      });
    }

    // Also close when clicking on the modal container itself (visible padding area)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeActiveModal();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeActiveModal();
      });
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (activeModal) {
        closeActiveModal();
      } else if (hamburger.classList.contains('open')) {
        closeMobileNav();
      }
    }
  });

  // --- Logo click = close everything & go home ---
  document.getElementById('header-logo').addEventListener('click', (e) => {
    e.preventDefault();
    closeActiveModal();
    closeMobileNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- Accordion system ---
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const parent = item.parentElement;
      const isOpen = item.classList.contains('open');

      // Close all siblings
      parent.querySelectorAll('.accordion-item.open').forEach(openItem => {
        openItem.classList.remove('open');
      });

      // Toggle clicked item
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // --- Contact Tabs ---
  const tabBtns = document.querySelectorAll('.contact-tab');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      // Update tab buttons
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Update tab contents
      document.querySelectorAll('.contact-tab-content').forEach(c => c.classList.remove('active'));
      const content = document.getElementById('content-' + tabId);
      if (content) content.classList.add('active');
    });
  });

  // --- Calendly ---
  // Calendly inline widget is loaded automatically by widget.js
  // Colors are configured via data-url params in index.html

  // --- Form handling (Formspree) ---
  // ⚠️ REPLACE 'YOUR_FORM_ID' with your Formspree form ID
  // → Sign up free at https://formspree.io
  // → Create a form, copy the ID (e.g. "xpzvqkdl")
  const FORMSPREE_ID = 'YOUR_FORM_ID';

  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('contact-email').value.trim();
      const phone = document.getElementById('contact-phone').value.trim();
      const errorEl = document.getElementById('form-error');

      // Custom validation: email OR phone required
      if (!email && !phone) {
        if (errorEl) errorEl.style.display = 'block';
        return;
      }
      if (errorEl) errorEl.style.display = 'none';

      const btn = form.querySelector('.btn-gold');
      const originalText = btn.innerHTML;
      const t = TRANSLATIONS[currentLang];

      // Loading state
      btn.innerHTML = '<span>...</span>';
      btn.style.pointerEvents = 'none';

      try {
        const formData = new FormData(form);
        // Add fields explicitly for Formspree
        formData.set('name', document.getElementById('contact-name').value);
        formData.set('email', email || 'Non renseigné');
        formData.set('phone', phone || 'Non renseigné');
        formData.set('message', document.getElementById('contact-message').value);

        const response = await fetch('https://formspree.io/f/' + FORMSPREE_ID, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          btn.innerHTML = '<span>' + t.form_sent + '</span>';
          btn.style.background = 'linear-gradient(135deg, #4CAF50, #66BB6A)';
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.pointerEvents = '';
            form.reset();
          }, 2500);
        } else {
          throw new Error('Send failed');
        }
      } catch (err) {
        btn.innerHTML = '<span>' + (currentLang === 'fr' ? 'Erreur — réessayez' : 'Error — try again') + '</span>';
        btn.style.background = 'rgba(220,53,69,0.8)';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.style.pointerEvents = '';
        }, 3000);
      }
    });
  }

  // --- Date Range Picker ---
  const calDisplay = document.getElementById('date-range-display');
  const calDropdown = document.getElementById('calendar-dropdown');
  const calDays = document.getElementById('cal-days');
  const calMonthYear = document.getElementById('cal-month-year');
  const calPrev = document.getElementById('cal-prev');
  const calNext = document.getElementById('cal-next');
  const calClear = document.getElementById('cal-clear');
  const calConfirm = document.getElementById('cal-confirm');
  const hiddenInput = document.getElementById('contact-dates');

  if (calDisplay && calDropdown) {
    function getMonths() { return TRANSLATIONS[currentLang].cal_months; }

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let startDate = null;
    let endDate = null;
    let isOpen = false;

    function toggleCalendar() {
      isOpen = !isOpen;
      calDropdown.classList.toggle('open', isOpen);
      calDisplay.classList.toggle('active', isOpen);
    }

    function closeCalendar() {
      isOpen = false;
      calDropdown.classList.remove('open');
      calDisplay.classList.remove('active');
    }

    calDisplay.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCalendar();
      if (isOpen) renderCalendar();
    });

    // Close calendar when clicking outside
    document.addEventListener('click', (e) => {
      if (isOpen && !calDropdown.contains(e.target) && !calDisplay.contains(e.target)) {
        closeCalendar();
      }
    });

    calPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      currentMonth--;
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      renderCalendar();
    });

    calNext.addEventListener('click', (e) => {
      e.stopPropagation();
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      renderCalendar();
    });

    calClear.addEventListener('click', (e) => {
      e.stopPropagation();
      startDate = null;
      endDate = null;
      hiddenInput.value = '';
      calDisplay.innerHTML = '<span class="date-range-placeholder">' + TRANSLATIONS[currentLang].form_dates_placeholder + '</span>';
      renderCalendar();
    });

    calConfirm.addEventListener('click', (e) => {
      e.stopPropagation();
      closeCalendar();
    });

    function formatDate(date) {
      const d = date.getDate();
      const m = getMonths()[date.getMonth()].toLowerCase();
      return d + ' ' + m;
    }

    function isSameDay(a, b) {
      return a && b && a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    function isInRange(date) {
      if (!startDate || !endDate) return false;
      return date > startDate && date < endDate;
    }

    function selectDate(date) {
      if (!startDate || (startDate && endDate)) {
        // Start new selection
        startDate = date;
        endDate = null;
      } else {
        // Complete the range
        if (date < startDate) {
          endDate = startDate;
          startDate = date;
        } else {
          endDate = date;
        }
      }
      updateDisplay();
      renderCalendar();
    }

    function updateDisplay() {
      if (startDate && endDate) {
        calDisplay.innerHTML = '<span class="date-range-value">' +
          formatDate(startDate) + ' — ' + formatDate(endDate) + ' ' + endDate.getFullYear() +
          '</span>';
        hiddenInput.value = startDate.toISOString().split('T')[0] + ' / ' + endDate.toISOString().split('T')[0];
      } else if (startDate) {
        calDisplay.innerHTML = '<span class="date-range-value">' +
          formatDate(startDate) + ' ' + startDate.getFullYear() + ' → …</span>';
        hiddenInput.value = startDate.toISOString().split('T')[0];
      } else {
        calDisplay.innerHTML = '<span class="date-range-placeholder">' + TRANSLATIONS[currentLang].form_dates_placeholder + '</span>';
        hiddenInput.value = '';
      }
    }

    function renderCalendar() {
      calMonthYear.textContent = getMonths()[currentMonth] + ' ' + currentYear;

      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      const startWeekday = (firstDay.getDay() + 6) % 7; // Monday = 0
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let html = '';

      // Empty cells before first day
      for (let i = 0; i < startWeekday; i++) {
        html += '<div class="cal-day cal-day--empty"></div>';
      }

      // Day cells
      for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(currentYear, currentMonth, d);
        const isPast = date < today;
        const isToday = isSameDay(date, today);
        const isStart = isSameDay(date, startDate);
        const isEnd = isSameDay(date, endDate);
        const inRange = isInRange(date);

        let classes = 'cal-day';
        if (isPast) classes += ' cal-day--disabled';
        if (isToday) classes += ' cal-day--today';
        if (isStart || isEnd) classes += ' cal-day--selected';
        if (isStart && endDate) classes += ' cal-day--range-start';
        if (isEnd) classes += ' cal-day--range-end';
        if (inRange) classes += ' cal-day--in-range';

        html += '<button type="button" class="' + classes + '" data-date="' + d + '"' +
          (isPast ? ' disabled' : '') + '>' + d + '</button>';
      }

      calDays.innerHTML = html;

      // Bind click handlers
      calDays.querySelectorAll('.cal-day:not(.cal-day--disabled):not(.cal-day--empty)').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const day = parseInt(btn.dataset.date);
          selectDate(new Date(currentYear, currentMonth, day));
        });
      });
    }
  }

});
