(function () {
  'use strict';

  var STORAGE_KEY = 'stockGuide_checklist';

  document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initCounters();
    initStepCards();
    initFaq();
    initChecklist();
    initScrollAnimations();
  });

  /* --------
     Navbar
  -------- */
  function initNavbar() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* -----------
     Mobile Menu
  ----------- */
  function initMobileMenu() {
    var hamburger = document.getElementById('hamburger');
    var navLinks  = document.getElementById('navLinks');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', function () {
      var isOpen = navLinks.classList.contains('open');
      navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });

    var links = navLinks.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    }
  }

  /* -------------
     Smooth Scroll
  ------------- */
  function initSmoothScroll() {
    var anchors = document.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < anchors.length; i++) {
      anchors[i].addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (!href || href === '#') return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        var navHeight = document.getElementById('navbar').offsetHeight;
        var top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
        window.scrollTo({ top: top, behavior: 'smooth' });
        // 네비 링크로 이동 시 해당 섹션 내 요소들을 즉시 visible 처리
        var animEls = target.querySelectorAll('.animate-on-scroll');
        for (var j = 0; j < animEls.length; j++) {
          animEls[j].classList.add('visible');
        }
      });
    }
  }

  /* --------
     Counters
  -------- */
  function initCounters() {
    var counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < counters.length; i++) {
        counters[i].textContent = counters[i].getAttribute('data-target');
      }
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          animateCounter(entries[i].target);
          observer.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.5 });

    for (var j = 0; j < counters.length; j++) {
      observer.observe(counters[j]);
    }
  }

  function animateCounter(el) {
    var target   = parseInt(el.getAttribute('data-target'), 10);
    var duration = 1500;
    var start    = performance.now();

    function step(now) {
      var elapsed  = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(step);
  }

  /* ----------
     Step Cards
  ---------- */
  function initStepCards() {
    var cards = document.querySelectorAll('.step-card');
    for (var i = 0; i < cards.length; i++) {
      var header = cards[i].querySelector('.card-header');
      header.addEventListener('click', makeCardClickHandler(cards, cards[i]));
    }
  }

  function makeCardClickHandler(allCards, card) {
    return function () {
      var toggle = card.querySelector('.card-toggle');
      var isOpen = card.classList.contains('open');
      for (var j = 0; j < allCards.length; j++) {
        allCards[j].classList.remove('open');
        allCards[j].querySelector('.card-toggle').setAttribute('aria-expanded', 'false');
      }
      if (!isOpen) {
        card.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    };
  }

  /* ---
     FAQ
  --- */
  function initFaq() {
    var items = document.querySelectorAll('.faq-item');
    for (var i = 0; i < items.length; i++) {
      var btn = items[i].querySelector('.faq-question');
      btn.addEventListener('click', makeFaqClickHandler(items, items[i], btn));
    }
  }

  function makeFaqClickHandler(allItems, item, btn) {
    return function () {
      var isOpen = item.classList.contains('open');
      for (var j = 0; j < allItems.length; j++) {
        allItems[j].classList.remove('open');
        allItems[j].querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      }
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    };
  }

  /* ---------
     Checklist
  --------- */
  function initChecklist() {
    loadChecklist();

    var checkboxes = document.querySelectorAll('.check-item input[type="checkbox"]');
    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].addEventListener('change', function () {
        saveChecklist();
        updateProgress();
        updateRoadmap();
      });
    }

    var resetBtn = document.getElementById('resetChecklist');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (confirm('체크리스트를 모두 초기화하시겠습니까?')) {
          try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
          loadChecklist();
        }
      });
    }
  }

  function loadChecklist() {
    var state = {};
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) state = JSON.parse(stored);
    } catch (e) {}

    var checkboxes = document.querySelectorAll('.check-item input[type="checkbox"]');
    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = state[checkboxes[i].getAttribute('data-key')] === true;
    }
    updateProgress();
    updateRoadmap();
  }

  function saveChecklist() {
    var state = {};
    var checkboxes = document.querySelectorAll('.check-item input[type="checkbox"]');
    for (var i = 0; i < checkboxes.length; i++) {
      state[checkboxes[i].getAttribute('data-key')] = checkboxes[i].checked;
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function updateProgress() {
    var checkboxes = document.querySelectorAll('.check-item input[type="checkbox"]');
    var checked = 0;
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) checked++;
    }
    var total = checkboxes.length;
    var pct   = total > 0 ? Math.round((checked / total) * 100) : 0;
    var bar   = document.getElementById('progressBar');
    var label = document.getElementById('progressLabel');
    if (bar)   bar.style.width = pct + '%';
    if (label) label.textContent = pct + '% 완료 (' + checked + '/' + total + ')';
  }

  function updateRoadmap() {
    for (var step = 1; step <= 5; step++) {
      var items = document.querySelectorAll(
        '.checklist-group[data-step="' + step + '"] input[type="checkbox"]'
      );
      var allDone = items.length > 0;
      for (var i = 0; i < items.length; i++) {
        if (!items[i].checked) { allDone = false; break; }
      }
      var node = document.querySelector('.roadmap-step[data-step="' + step + '"]');
      if (node) {
        if (allDone) node.classList.add('active');
        else         node.classList.remove('active');
      }
    }
  }

  /* -----------------
     Scroll Animations
  ----------------- */
  function initScrollAnimations() {
    var targets = document.querySelectorAll('.animate-on-scroll');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < targets.length; i++) {
        targets[i].classList.add('visible');
      }
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('visible');
          observer.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.05 });

    for (var j = 0; j < targets.length; j++) {
      observer.observe(targets[j]);
    }

    // 2초 후에도 visible이 안 붙은 요소들 강제 표시 (보험)
    setTimeout(function () {
      var hidden = document.querySelectorAll('.animate-on-scroll:not(.visible)');
      for (var k = 0; k < hidden.length; k++) {
        hidden[k].classList.add('visible');
      }
    }, 2000);
  }

})();
