(function () {
  var toggle = document.getElementById('navToggle');
  document.querySelectorAll('.navlinks a').forEach(function (a) {
    a.addEventListener('click', function () { if (toggle) toggle.checked = false; });
  });

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // scroll reveal
  var revealItems = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealItems.forEach(function (el) { io.observe(el); });
  }

  // count-up metrics: <span class="num" data-count-to="536500" data-suffix="">
  var counters = document.querySelectorAll('[data-count-to]');
  if (counters.length) {
    var animateCounter = function (el) {
      var target = parseFloat(el.getAttribute('data-count-to'));
      var suffix = el.getAttribute('data-suffix') || '';
      var decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals'), 10) : 0;
      if (reduced) {
        el.textContent = target.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        return;
      }
      var start = null;
      var duration = 1100;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = target * eased;
        el.textContent = value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      var counterIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { counterIo.observe(el); });
    } else {
      counters.forEach(animateCounter);
    }
  }

  // ---------------------------------------------------------------
  // Interactive chart: monthly revenue trend (line, hover tooltip)
  // ---------------------------------------------------------------
  var revenueMount = document.getElementById('chart-revenue-trend');
  if (revenueMount) {
    var months = ['Dec ’10', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec ’11*'];
    var values = [0.75, 0.60, 0.55, 0.58, 0.52, 0.56, 0.61, 0.58, 0.64, 0.75, 0.82, 1.40, 0.44];
    var w = 640, h = 260, padL = 40, padR = 16, padT = 20, padB = 34;
    var maxV = Math.max.apply(null, values);
    var stepX = (w - padL - padR) / (values.length - 1);
    var pts = values.map(function (v, i) {
      var x = padL + i * stepX;
      var y = padT + (1 - v / maxV) * (h - padT - padB);
      return [x, y];
    });
    var pathD = pts.map(function (p, i) { return (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var areaD = pathD + ' L' + pts[pts.length - 1][0].toFixed(1) + ' ' + (h - padB) + ' L' + pts[0][0].toFixed(1) + ' ' + (h - padB) + ' Z';

    var gridLines = '';
    for (var g = 0; g <= 3; g++) {
      var gy = padT + (g / 3) * (h - padT - padB);
      gridLines += '<line x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (w - padR) + '" y2="' + gy.toFixed(1) + '" stroke="var(--line)" stroke-width="1"/>';
    }

    var labels = pts.map(function (p, i) {
      if (i % 2 !== 0 && i !== values.length - 1) return '';
      return '<text x="' + p[0].toFixed(1) + '" y="' + (h - 10) + '" class="mono" font-size="9.5" fill="var(--ink-faint)" text-anchor="middle">' + months[i] + '</text>';
    }).join('');

    var dots = pts.map(function (p, i) {
      var isPeak = i === 11;
      return '<circle class="pt" data-i="' + i + '" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (isPeak ? 5 : 3.5) + '" fill="' + (isPeak ? 'var(--tag-amber)' : 'var(--accent)') + '" stroke="var(--paper-raised)" stroke-width="1.5" style="cursor:pointer"/>';
    }).join('');

    revenueMount.innerHTML =
      '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" role="img" aria-label="Monthly net revenue, December 2010 to December 2011, peaking in November 2011">' +
      gridLines +
      '<path d="' + areaD + '" fill="color-mix(in srgb, var(--accent) 12%, transparent)" stroke="none"/>' +
      '<path d="' + pathD + '" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      dots +
      labels +
      '<text x="' + pts[11][0] + '" y="' + (pts[11][1] - 14) + '" class="mono" font-size="10" fill="var(--tag-amber)" text-anchor="middle" font-weight="600">Nov peak</text>' +
      '</svg>' +
      '<div class="chart-tooltip" id="revenue-tooltip"></div>';

    var tooltip = revenueMount.querySelector('#revenue-tooltip');
    var revenueLabels = [0.75, 0.60, 0.55, 0.58, 0.52, 0.56, 0.61, 0.58, 0.64, 0.75, 0.82, 1.40, 0.44].map(function (v) { return '£' + v.toFixed(2) + 'M'; });
    revenueMount.querySelectorAll('.pt').forEach(function (dot) {
      dot.addEventListener('mouseenter', function () {
        var i = parseInt(dot.getAttribute('data-i'), 10);
        var rect = revenueMount.getBoundingClientRect();
        var cx = parseFloat(dot.getAttribute('cx')) / w * rect.width;
        var cy = parseFloat(dot.getAttribute('cy')) / h * rect.height;
        tooltip.textContent = months[i].replace('’10', '2010').replace('’11*', '2011 (partial)') + ': ' + revenueLabels[i];
        tooltip.style.left = cx + 'px';
        tooltip.style.top = cy + 'px';
        tooltip.classList.add('show');
      });
      dot.addEventListener('mouseleave', function () { tooltip.classList.remove('show'); });
    });
  }

  // ---------------------------------------------------------------
  // Interactive chart: customer revenue concentration (Pareto bar)
  // ---------------------------------------------------------------
  var paretoMount = document.getElementById('chart-customer-concentration');
  if (paretoMount) {
    var segs = [
      { label: 'Top 20% of customers', value: 74.6, color: 'var(--tag-amber)' },
      { label: 'Remaining 80% of customers', value: 25.4, color: 'var(--accent)' }
    ];
    var pw = 640, ph = 120, bp = 20;
    var barW = pw - bp * 2;
    var x = bp;
    var bars = '', legends = '';
    segs.forEach(function (s, i) {
      var segW = (s.value / 100) * barW;
      bars += '<rect class="pareto-seg" data-i="' + i + '" x="' + x.toFixed(1) + '" y="30" width="' + segW.toFixed(1) + '" height="46" fill="' + s.color + '" style="cursor:pointer"/>';
      legends += '<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--ink-muted)"><span style="width:10px;height:10px;border-radius:2px;background:' + s.color + ';display:inline-block"></span>' + s.label + ' — <strong style="color:var(--ink)">' + s.value + '%</strong> of revenue</div>';
      x += segW;
    });
    paretoMount.innerHTML =
      '<svg viewBox="0 0 ' + pw + ' ' + ph + '" width="100%" role="img" aria-label="The top 20 percent of customers generate 74.6 percent of revenue">' +
      '<rect x="' + bp + '" y="30" width="' + barW + '" height="46" rx="3" fill="none" stroke="var(--line-strong)"/>' +
      bars +
      '</svg>' +
      '<div style="display:flex;flex-direction:column;gap:6px;margin-top:14px">' + legends + '</div>';
  }
})();
