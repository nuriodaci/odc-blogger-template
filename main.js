//<![CDATA[
(function() {
  var header = document.querySelector('.site-header');
  var panel = document.querySelector('[data-menu-panel]');
  if (!header) {
    return;
  }
  var lastY = window.scrollY || window.pageYOffset || 0;
  var pendingY = lastY;
  var ticking = false;
  var isScrolled = false;
  var isHidden = false;
  var isPinned = true;
  function setHeaderState(nextScrolled, nextHidden, nextPinned) {
    if (isScrolled !== nextScrolled) {
      header.classList.toggle('is-scrolled', nextScrolled);
      isScrolled = nextScrolled;
    }
    if (isHidden !== nextHidden) {
      header.classList.toggle('is-hidden', nextHidden);
      isHidden = nextHidden;
    }
    if (isPinned !== nextPinned) {
      header.classList.toggle('is-pinned', nextPinned);
      isPinned = nextPinned;
    }
  }
  function updateHeaderState() {
    ticking = false;
    var currentY = pendingY;
    var menuOpen = !!(panel && panel.classList.contains('is-open'));
    if (menuOpen || currentY < 16) {
      setHeaderState(currentY > 12, false, true);
      lastY = currentY;
      return;
    }
    var delta = currentY - lastY;
    if (delta > 6 && currentY > 96) {
      setHeaderState(true, true, false);
    } else if (delta < -6) {
      setHeaderState(true, false, true);
    } else {
      setHeaderState(currentY > 12, isHidden, isPinned);
    }
    lastY = currentY;
  }
  function requestHeaderUpdate() {
    pendingY = window.scrollY || window.pageYOffset || 0;
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(updateHeaderState);
  }
  setHeaderState(false, false, true);
  requestHeaderUpdate();
  window.addEventListener('scroll', requestHeaderUpdate, {passive: true});
  window.addEventListener('resize', requestHeaderUpdate);
})();
(function() {
  var doc = document;
  var toggle = doc.querySelector('[data-menu-toggle]');
  var panel = doc.querySelector('[data-menu-panel]');
  var navLinks = panel ? panel.querySelectorAll('a[href]') : [];
  if (!toggle || !panel) {
    return;
  }
  function normalizePath(url) {
    try {
      var parsed = new URL(url, window.location.href);
      var path = parsed.pathname.replace(/\/+$/, '') || '/';
      return path;
    } catch (error) {
      return url;
    }
  }
  var currentPath = normalizePath(window.location.href);
  for (var i = 0; i < navLinks.length; i += 1) {
    var link = navLinks[i];
    if (normalizePath(link.href) === currentPath) {
      link.classList.add('is-active');
      if (!link.hasAttribute('aria-current')) {
        link.setAttribute('aria-current', 'page');
      }
    }
  }
  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open');
  }
  toggle.addEventListener('click', function() {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    panel.classList.toggle('is-open', !expanded);
  });
  panel.addEventListener('click', function(event) {
    if (event.target && event.target.tagName === 'A') {
      closeMenu();
    }
  });
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 1024) {
      closeMenu();
    }
  });
})();
(function() {
  var hero = document.querySelector('.article-hero img[data-featured-image]');
  var prose = document.querySelector('.article-prose');
  if (!hero || !prose || document.body.getAttribute('data-page-type') !== 'item') {
    return;
  }
  function normalizeImageUrl(url) {
    if (!url) {
      return '';
    }
    try {
      var parsed = new URL(url, window.location.href);
      var parts = parsed.pathname.split('/').filter(Boolean).filter(function(part) {
        return !/^(s|w)\d+.*$/i.test(part);
      });
      return parsed.hostname + '/' + parts.slice(-2).join('/');
    } catch (error) {
      return url.split('?')[0].split('#')[0];
    }
  }
  function removableContainer(node) {
    var container = node.closest('figure,.separator,p,div');
    if (!container || container === prose) {
      return node;
    }
    var text = (container.textContent || '').replace(/\s+/g, '');
    var mediaCount = container.querySelectorAll('img,video,iframe,picture').length;
    if (!text || mediaCount === 1) {
      return container;
    }
    return node;
  }
  var heroKey = normalizeImageUrl(hero.currentSrc || hero.src);
  if (!heroKey) {
    return;
  }
  var bodyImages = prose.querySelectorAll('img');
  for (var i = 0; i < bodyImages.length; i += 1) {
    var image = bodyImages[i];
    var imageKey = normalizeImageUrl(image.currentSrc || image.src);
    if (imageKey && imageKey === heroKey) {
      removableContainer(image).remove();
      break;
    }
  }
})();
//]]>
