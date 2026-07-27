/**
 * Ummah Academy — Homepage Scripts
 * One file, enqueued once, shared by every section widget.
 * Built incrementally alongside the HTML/CSS — one section at a time.
 *
 * Sections wired so far: Header/Nav, Hero, Trust Bar, Courses tabs, Career form, Contact form, Footer year.
 *
 * Pattern:
 *   - Everything lives inside one IIFE and one `UmmahAcademy` namespace
 *     object, rather than bare global functions — a real WordPress page
 *     loads many plugins' scripts in the same global scope, and a bare
 *     `function initAnimations(){}` risks colliding with someone else's.
 *   - Each initX() function is self-contained: it queries only the
 *     elements it needs and does nothing if they aren't on the page yet
 *     (so this same file keeps working as more sections get pasted in
 *     across later passes, without needing edits here).
 *   - No shared mutable state between functions.
 */
(function () {
  'use strict';

  var UA = window.UmmahAcademy = window.UmmahAcademy || {};

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ------------------------------------------------------------------ *
   * initScrollEffects — smooth scroll for in-page anchor links, offset
   * for the fixed floating nav built in header.html.
   *
   * Note: hero.html links to #ua-pricing and #ua-featured-courses,
   * which don't exist yet — those resolve once the Pricing and Featured
   * Courses sections are added in later passes. Nothing breaks in the
   * meantime; the click handler simply no-ops if the target isn't found.
   * ------------------------------------------------------------------ */
  function initScrollEffects() {
    var reduceMotion = prefersReducedMotion();

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      var hash = link.getAttribute('href');
      if (!hash || hash.length < 2) return;

      link.addEventListener('click', function (e) {
        var target = document.querySelector(hash);
        if (!target) return;

        e.preventDefault();
        var header = document.querySelector('.ua-nav-wrap');
        var headerHeight = header ? header.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;

        window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * initAnimations — reveals .ua-reveal elements (currently the hero
   * copy and hero visual) once they're in view. Adds .ua-js-ready to
   * <html> first, which is what actually arms the CSS transition in
   * styles.css — so if this script fails to load entirely, .ua-reveal
   * content is simply shown immediately, never stuck hidden.
   * ------------------------------------------------------------------ */
  function initAnimations() {
    document.documentElement.classList.add('ua-js-ready');

    var targets = document.querySelectorAll('.ua-reveal');
    if (!targets.length) return;

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('ua-is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('ua-is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------ *
   * initCounters — animates each .ua-trust-item's number from 0 to its
   * target once, the first time the Trust Bar scrolls into view. Uses
   * toLocaleString() so 1000 renders as "1,000" mid-count, not just at
   * the final frame. Skips straight to the final value under reduced
   * motion, same as every other animation in this file.
   *
   * Root-cause note: this used to select '.ua-trust-item[data-count]'
   * and read el.dataset.count as the target. That silently breaks on
   * WordPress hosts that run pasted HTML through KSES sanitization
   * (wp_kses_post) — which strips unrecognized data-* attributes for
   * any user/context without the unfiltered_html capability, while
   * leaving class names and text content untouched. Once data-count
   * is gone, the attribute selector itself matches nothing, so this
   * function used to no-op silently: no items, no error, no animation.
   * Fixed by (a) selecting .ua-trust-item unconditionally instead of
   * requiring the attribute to exist, and (b) falling back to the
   * number already sitting in the span's own text — trust-bar.html
   * now ships the real target as that span's text content precisely
   * so it survives sanitizers that only touch attributes. data-count
   * stays in the HTML and is still preferred when present.
   * ------------------------------------------------------------------ */
  function initCounters() {
    var items = document.querySelectorAll('.ua-trust-item');
    if (!items.length) return;

    function animate(el) {
      var numberEl = el.querySelector('.ua-counter');
      if (!numberEl) return;

      var target = el.dataset.count
        ? parseInt(el.dataset.count, 10)
        : parseInt(numberEl.textContent, 10);
      if (isNaN(target)) return;

      if (prefersReducedMotion()) {
        numberEl.textContent = target.toLocaleString();
        return;
      }

      var start = null;
      var duration = 1100;

      function step(timestamp) {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        numberEl.textContent = Math.round(eased * target).toLocaleString();
        if (progress < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) {
      items.forEach(animate);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------ *
   * initNavigation — sticky-scroll state for the floating pill nav,
   * plus a click guard so tapping "Courses" on touch devices opens the
   * dropdown instead of navigating straight to /courses/ on the first
   * tap (the link still works normally on desktop and for keyboard/
   * screen-reader users, since :hover/:focus-within drive the dropdown
   * in CSS regardless of this).
   * ------------------------------------------------------------------ */
  function initNavigation() {
    var navWrap = document.getElementById('ua-nav-wrap');
    if (!navWrap) return;

    var ticking = false;
    function update() {
      navWrap.classList.toggle('is-scrolled', window.scrollY > 40);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();

    var coursesToggle = document.getElementById('ua-courses-toggle');
    if (coursesToggle) {
      coursesToggle.addEventListener('click', function (e) {
        if (window.matchMedia('(hover: none)').matches) e.preventDefault();
      });
    }
  }

  /* ------------------------------------------------------------------ *
   * initMobileMenu — hamburger toggle, full-screen overlay, closes on
   * link click / Escape / resize back past the breakpoint. Mirrors the
   * Hero's own mobileNav pattern from the single-file build, adapted
   * to this file's header/overlay ids.
   * ------------------------------------------------------------------ */
  function initMobileMenu() {
    var toggle = document.getElementById('ua-nav-toggle');
    var overlay = document.getElementById('ua-mobile-overlay');
    if (!toggle || !overlay) return;

    function open() {
      overlay.hidden = false;
      requestAnimationFrame(function () { overlay.dataset.open = 'true'; });
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      overlay.dataset.open = 'false';
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      window.setTimeout(function () { overlay.hidden = true; }, prefersReducedMotion() ? 0 : 320);
    }
    function isOpen() { return toggle.getAttribute('aria-expanded') === 'true'; }

    toggle.addEventListener('click', function () { isOpen() ? close() : open(); });

    overlay.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) { close(); toggle.focus(); }
    });

    window.matchMedia('(min-width: 769px)').addEventListener('change', function (e) {
      if (e.matches && isOpen()) close();
    });
  }

  // Expose namespaced, not global — lets a later pass (or the Elementor
  // editor's live-preview re-render) call UmmahAcademy.initAnimations()
  // again manually without re-declaring anything.
  UA.initScrollEffects = initScrollEffects;
  UA.initAnimations = initAnimations;
  UA.initCounters = initCounters;
  UA.initNavigation = initNavigation;
  UA.initMobileMenu = initMobileMenu;

  /* ------------------------------------------------------------------ *
   * initCoursesTabs — swaps the active pill and relies on the smooth-
   * scroll handler already wired up by initScrollEffects() for anchor
   * links (each tab's data-target maps to a real #id, so this just
   * needs a synthetic click on a matching in-page link... simplest is
   * to scroll directly and toggle the class here, no duplication).
   * ------------------------------------------------------------------ */
  function initCoursesTabs() {
    var tabs = document.querySelectorAll('.ua-track-tab');
    if (!tabs.length) return;

    var reduceMotion = prefersReducedMotion();
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = document.getElementById(tab.dataset.target);
        if (!target) return;

        tabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');

        var header = document.querySelector('.ua-nav-wrap');
        var headerHeight = header ? header.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
        window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Shared helper for the Career and Contact forms — neither page has
   * a backend, so both build a plain-text summary of the filled
   * fields and open it as a pre-filled WhatsApp message, consistent
   * with the site's one real, working contact channel.
   * ------------------------------------------------------------------ */
  function collectFormLines(form) {
    var lines = [];
    var missing = [];
    form.querySelectorAll('.ua-form-group').forEach(function (group) {
      var label = group.querySelector('.ua-form-label');
      var field = group.querySelector('.ua-form-input, .ua-form-select, .ua-form-textarea');
      if (!label || !field) return;

      var labelText = label.textContent.replace('*', '').trim();
      var isRequired = label.textContent.indexOf('*') !== -1;
      var value = (field.value || '').trim();

      if (isRequired && !value) { missing.push(labelText); return; }
      if (value) lines.push(labelText + ': ' + value);
    });
    return { lines: lines, missing: missing };
  }

  function initCareerForm() {
    var form = document.getElementById('ua-career-form');
    var submit = document.getElementById('ua-career-submit');
    if (!form || !submit) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var result = collectFormLines(form);
      if (result.missing.length) {
        window.alert('Please fill in: ' + result.missing.join(', '));
        return;
      }
      var message = 'New Teacher Application from ummahacademy.net\n\n' + result.lines.join('\n') +
        '\n\n(Please attach your CV/Ijazah directly in this WhatsApp chat.)';
      submit.textContent = 'Opening WhatsApp…';
      window.open('https://wa.me/201154644519?text=' + encodeURIComponent(message), '_blank');
    });
  }

  function initContactForm() {
    var form = document.getElementById('ua-contact-form');
    var submit = document.getElementById('ua-contact-submit');
    if (!form || !submit) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var result = collectFormLines(form);
      if (result.missing.length) {
        window.alert('Please fill in: ' + result.missing.join(', '));
        return;
      }
      var message = 'New Free Trial Request from ummahacademy.net\n\n' + result.lines.join('\n');
      submit.textContent = 'Opening WhatsApp…';
      window.open('https://wa.me/201154644519?text=' + encodeURIComponent(message), '_blank');
    });
  }

  /* ------------------------------------------------------------------ *
   * initFooterYear — same pattern as the Hero's footer year in the
   * original single-file build, just generalized for reuse here.
   * ------------------------------------------------------------------ */
  function initFooterYear() {
    var el = document.getElementById('ua-current-year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function initAll() {
    initScrollEffects();
    initAnimations();
    initCounters();
    initNavigation();
    initMobileMenu();
    initCoursesTabs();
    initCareerForm();
    initContactForm();
    initFooterYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
