/* ============================================================
 * 热梗档案馆 · 首页逻辑
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- 热搜滚动条（内容翻倍实现无缝滚动） ---------- */
  function renderTicker() {
    var el = document.getElementById('ticker');
    if (!el) return;
    var inner = HOT_WORDS.map(function (w) {
      return '<span><span class="flame">🔥</span>' + w + '</span>';
    }).join('');
    el.innerHTML = inner + inner; // 复制一份实现无缝循环
  }

  /* ---------- 近10天卡片墙 ---------- */
  function q(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  function getBvid(url) {
    var m = String(url || '').match(/BV[0-9A-Za-z]{10}/);
    return m ? m[0] : '';
  }

  /* ---------- 无真实封面时：canvas 绘制 MC 像素兜底封面 ---------- */
  function drawMcFallback(c, name, emoji) {
    var w = 640, h = 360;
    // 天空渐变
    var g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#6ba7ff'); g.addColorStop(1, '#c8e6ff');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    // 方块太阳
    c.fillStyle = 'rgba(255,232,122,.35)'; c.fillRect(430, 36, 96, 96);
    c.fillStyle = '#ffe87a'; c.fillRect(468, 48, 60, 60);
    c.fillStyle = '#ffc93c'; c.fillRect(498, 48, 30, 60);
    // 像素云
    for (var i = 0; i < 3; i++) {
      var rx = Math.abs(Math.sin(i * 77.7)) * 500 + 30;
      var ry = 42 + Math.abs(Math.sin(i * 13.3 + 5)) * 90;
      c.fillStyle = '#ffffff';
      c.fillRect(rx, ry, 90, 24); c.fillRect(rx + 24, ry - 22, 48, 22);
      c.fillStyle = '#d8e8f8'; c.fillRect(rx, ry + 16, 90, 8);
    }
    // 草方块地面
    c.fillStyle = '#79c143'; c.fillRect(0, 300, w, 60);
    c.fillStyle = '#5d9c34'; c.fillRect(0, 300, w, 10);
    c.fillStyle = '#8a6a45'; c.fillRect(0, 310, w, 16);
    c.fillStyle = '#7a5540'; c.fillRect(0, 326, w, 34);
    // 底部暗化渐变（保证文字可读）
    var dg = c.createLinearGradient(0, 150, 0, h);
    dg.addColorStop(0, 'rgba(10,20,40,0)'); dg.addColorStop(1, 'rgba(10,20,40,.6)');
    c.fillStyle = dg; c.fillRect(0, 150, w, 210);
    // 大 emoji
    c.font = '110px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(emoji, 320, 170);
    // 标题（动态字号，完整显示不截断）
    var fs = Math.max(18, Math.min(36, w / (name.length * 1.12 + 3)));
    c.font = '800 ' + fs + 'px "Microsoft YaHei",sans-serif';
    c.lineJoin = 'round';
    c.strokeStyle = 'rgba(16,26,58,.9)'; c.lineWidth = Math.max(4, fs * 0.18);
    c.strokeText(name, 320, 322);
    c.fillStyle = '#ffffff';
    c.fillText(name, 320, 322);
    // MC 像素角标
    c.fillStyle = '#d33b2b'; c.fillRect(26, 320, 14, 14);
    c.fillStyle = '#f4ead9'; c.fillRect(30, 324, 6, 6);
    c.fillStyle = '#46e8d8'; c.fillRect(46, 320, 14, 14);
    c.fillStyle = '#ffd84d'; c.fillRect(66, 320, 14, 14);
  }

  function renderRecent() {
    var grid = document.getElementById('recentGrid');
    if (!grid) return;
    grid.innerHTML = RECENT_MEMES.map(function (m, i) {
      var tags = (m.tags || []).map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('');
      var bv = getBvid(m.videoUrl);
      var real = bv && (window.COVERS || {})[bv];
      var cover = real
        ? '<div class="card-cover"><img class="cover-img" src="' + COVERS[bv] + '" referrerpolicy="no-referrer" loading="lazy" alt="" onerror="this.parentNode.style.display=\'none\'"><span class="cover-badge">🔥 热梗</span><span class="cover-hot">' + m.hot + '</span><span class="cover-play">▶ 看原视频</span></div>'
        : '<div class="card-cover fb" data-name="' + q(m.name) + '" data-emoji="' + q(m.emoji || '🔥') + '"><span class="cover-badge">🔥 热梗</span><span class="cover-hot">' + m.hot + '</span><span class="cover-play">▶ 看原视频</span></div>';
      return '<div class="card" data-kw="' + q(memeText(m)) + '">' + cover +
        '<div class="card-head"><span class="rank">#' + (i + 1) + '</span><span class="date">' + (m.date || '') + '</span></div>' +
        '<div class="card-top"><span class="card-emoji">' + m.emoji + '</span>' +
        '<div class="card-name" title=' + q(m.name) + '>' + m.name + '</div></div>' +
        '<div class="card-tags">' + tags + '</div>' +
        '<div class="card-desc" title=' + q(m.desc) + '>' + m.desc + '</div>' +
        '<div class="hot-bar"><span class="label">🔥 热度</span>' +
        '<div class="track"><div class="fill" data-hot="' + m.hot + '"></div></div>' +
        '<span class="num">' + m.hot + '</span></div>' +
        '<div class="card-actions">' +
        '<button class="btn play" data-idx="' + i + '">🎬 播放动画</button>' +
        '<a class="btn video" href="' + m.videoUrl + '" target="_blank" rel="noopener">▶ 看视频</a>' +
        '</div></div>';
    }).join('');
    // 无真实封面的卡片：canvas 绘制 MC 像素兜底封面
    [].forEach.call(grid.querySelectorAll('.card-cover.fb'), function (el) {
      var cv = document.createElement('canvas');
      cv.width = 640; cv.height = 360;
      drawMcFallback(cv.getContext('2d'), el.getAttribute('data-name'), el.getAttribute('data-emoji'));
      el.insertBefore(cv, el.firstChild);
    });
    // 热度条动画
    setTimeout(function () {
      grid.querySelectorAll('.fill').forEach(function (f) {
        f.style.width = f.getAttribute('data-hot') + '%';
      });
    }, 120);
  }

  /* ---------- 全网出圈热梗（流传度广的梗 + 爆火的人） ---------- */
  function renderViral() {
    var grid = document.getElementById('viralGrid');
    if (!grid) return;
    grid.innerHTML = VIRAL_MEMES.map(function (m, i) {
      var tags = (m.tags || []).map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('');
      var bv = getBvid(m.videoUrl);
      var real = bv && (window.COVERS || {})[bv];
      var cover = real
        ? '<div class="card-cover"><img class="cover-img" src="' + COVERS[bv] + '" referrerpolicy="no-referrer" loading="lazy" alt="" onerror="this.parentNode.style.display=\'none\'"><span class="cover-badge">🚀 出圈</span><span class="cover-hot">' + m.hot + '</span><span class="cover-play">▶ 看原视频</span></div>'
        : '<div class="card-cover fb" data-name="' + q(m.name) + '" data-emoji="' + q(m.emoji || '🚀') + '"><span class="cover-badge">🚀 出圈</span><span class="cover-hot">' + m.hot + '</span><span class="cover-play">▶ 看原视频</span></div>';
      return '<div class="card" data-kw="' + q(memeText(m)) + '">' + cover +
        '<div class="card-head"><span class="rank">#' + (i + 1) + '</span><span class="date">' + (m.date || '') + '</span></div>' +
        '<div class="card-top"><span class="card-emoji">' + m.emoji + '</span>' +
        '<div class="card-name" title=' + q(m.name) + '>' + m.name + '</div></div>' +
        '<div class="card-tags">' + tags + '</div>' +
        '<div class="card-desc" title=' + q(m.desc) + '>' + m.desc + '</div>' +
        '<div class="hot-bar"><span class="label">🔥 热度</span>' +
        '<div class="track"><div class="fill" data-hot="' + m.hot + '"></div></div>' +
        '<span class="num">' + m.hot + '</span></div>' +
        '<div class="card-actions">' +
        '<button class="btn play" data-vidx="' + i + '">🎬 播放动画</button>' +
        '<a class="btn video" href="' + m.videoUrl + '" target="_blank" rel="noopener">▶ 看视频</a>' +
        '</div></div>';
    }).join('');
    // 无真实封面的卡片：canvas 绘制 MC 像素兜底封面
    [].forEach.call(grid.querySelectorAll('.card-cover.fb'), function (el) {
      var cv = document.createElement('canvas');
      cv.width = 640; cv.height = 360;
      drawMcFallback(cv.getContext('2d'), el.getAttribute('data-name'), el.getAttribute('data-emoji'));
      el.insertBefore(cv, el.firstChild);
    });
    // 热度条动画
    setTimeout(function () {
      grid.querySelectorAll('.fill').forEach(function (f) {
        f.style.width = f.getAttribute('data-hot') + '%';
      });
    }, 120);
  }

  /* ---------- 五年入口 ---------- */
  function renderYears() {
    var strip = document.getElementById('yearStrip');
    if (!strip) return;
    strip.innerHTML = YEARS.map(function (y) {
      return '<a class="year-card" href="years.html#' + y.year + '" style="--yc:' + y.color + '">' +
        '<div class="y">' + y.year + '</div>' +
        '<div class="n">' + y.memes.length + ' 个经典梗</div></a>';
    }).join('');
  }

  /* ---------- 全站搜索 ---------- */
  function memeText(m) {
    return ((m.name || '') + ' ' + (m.desc || '') + ' ' + (m.tags || []).join(' ') + ' ' + (m.emoji || '')).toLowerCase();
  }

  function buildAllMemes() {
    var all = [];
    (RECENT_MEMES || []).forEach(function (m) { all.push({ m: m, isRecent: true }); });
    (VIRAL_MEMES || []).forEach(function (m) { all.push({ m: m, isRecent: true }); });
    (YEARS || []).forEach(function (yr) {
      (yr.memes || []).forEach(function (m) { all.push({ m: m, year: yr.year, isRecent: false }); });
    });
    return all;
  }
  var ALL_MEMES = buildAllMemes();

  function initSearch() {
    var input = document.getElementById('searchInput');
    var clear = document.getElementById('searchClear');
    var count = document.getElementById('searchCount');
    var hits = document.getElementById('searchHits');
    var grid = document.getElementById('recentGrid');
    var vgrid = document.getElementById('viralGrid');
    if (!input) return;
    var histMemes = [];

    function run() {
      var kw = input.value.trim().toLowerCase();
      var has = kw.length > 0;
      if (clear) clear.style.display = has ? 'block' : 'none';
      var cards = grid ? grid.querySelectorAll('.card') : [];
      if (vgrid) cards = cards.concat(Array.prototype.slice.call(vgrid.querySelectorAll('.card')));
      var recentHit = 0;
      histMemes = [];
      if (has) {
        ALL_MEMES.forEach(function (e) {
          if (memeText(e.m).indexOf(kw) >= 0) {
            if (e.isRecent) recentHit++;
            else histMemes.push(e);
          }
        });
      }
      cards.forEach(function (card) {
        var k = card.getAttribute('data-kw') || '';
        card.style.display = (!has || k.indexOf(kw) >= 0) ? '' : 'none';
      });
      var total = recentHit + histMemes.length;
      if (count) count.textContent = has ? (total + ' 个结果') : '';
      if (!hits) return;
      if (has && histMemes.length) {
        hits.style.display = 'block';
        hits.innerHTML = '<div class="s-title">📚 五年编年史命中 ' + histMemes.length + ' 个</div><div class="s-grid">' +
          histMemes.map(function (e, i) {
            var m = e.m;
            return '<div class="s-card"><span class="s-emoji">' + m.emoji + '</span>' +
              '<div class="s-info"><div class="s-name" title="' + q(m.name) + '">' + m.name + '</div>' +
              '<div class="s-meta">📅 ' + e.year + ' · 🔥 热度 ' + m.hot + '</div></div>' +
              '<div class="s-btns">' +
              '<button class="btn s-play" data-hidx="' + i + '">🎬 播放</button>' +
              (m.videoUrl ? '<a class="btn video" href="' + m.videoUrl + '" target="_blank" rel="noopener">▶ 视频</a>' : '') +
              '</div></div>';
          }).join('') + '</div>';
      } else if (has) {
        hits.style.display = 'block';
        hits.innerHTML = '<div class="search-empty">🤔 没找到「' + q(input.value.trim()) + '」，换个关键词试试？</div>';
      } else {
        hits.style.display = 'none';
        hits.innerHTML = '';
      }
    }

    input.addEventListener('input', run);
    if (clear) clear.addEventListener('click', function () { input.value = ''; input.focus(); run(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.activeElement === input) { input.value = ''; run(); }
    });
    if (hits) hits.addEventListener('click', function (e) {
      var btn = e.target.closest('.s-play');
      if (!btn) return;
      var hi = parseInt(btn.getAttribute('data-hidx'), 10);
      var e2 = histMemes[hi];
      if (!e2) return;
      var target = e2.m;
      if (e2.year) target = Object.assign({}, target, { year: e2.year });
      openModal(target);
    });
  }

  /* ---------- Hero 轮播 ---------- */
  var heroIdx = 0, heroTimer = null;
  var DURATION = 7; // 每个梗演示 7 秒

  function heroChip(m) {
    return '<span class="chip">🔥 热度 ' + m.hot + '</span>' +
      '<span class="chip">📅 ' + (m.date || '') + '</span>' +
      '<span class="chip">🎬 ' + (m.animation === 'dance' ? '火柴人跳舞' :
        m.animation === 'fire' ? '火焰特效' :
        m.animation === 'flower' ? '开花动画' :
        m.animation === 'shake' ? '剧烈抖动' :
        m.animation === 'emojiRain' ? '表情雨' :
        m.animation === 'ring' ? '光环扩散' : '文字弹跳') + '</span>' +
      '<span class="chip video"><a href="' + m.videoUrl + '" target="_blank" rel="noopener">▶ 看视频</a></span>';
  }

  function playHero() {
    var canvas = document.getElementById('heroCanvas');
    var meta = document.getElementById('heroMeta');
    var badge = document.getElementById('heroBadge');
    var progress = document.getElementById('heroProgress');
    var m = RECENT_MEMES[heroIdx];
    heroIdx = (heroIdx + 1) % RECENT_MEMES.length;
    if (meta) meta.innerHTML = heroChip(m);
    if (badge) badge.textContent = '🔥 第 ' + ((heroIdx - 1 + RECENT_MEMES.length) % RECENT_MEMES.length + 1) + '/' + RECENT_MEMES.length + ' 个 · ' + m.name;
    if (progress) { progress.style.transition = 'none'; progress.style.width = '0%'; void progress.offsetWidth; progress.style.transition = 'width ' + DURATION + 's linear'; progress.style.width = '100%'; }
    MemeAnim.start(canvas, m, { duration: DURATION, onDone: playHero });
  }

  /* ---------- 弹窗动画演示 ---------- */
  var modalMeme = null, modalLooping = false;

  function showStage(tab) {
    var video = document.getElementById('stageVideo');
    var canvas = document.getElementById('modalCanvas');
    var tabs = document.querySelectorAll('#stageTabs .st-tab');
    if (tab === 'video') {
      video.style.display = 'block';
      canvas.style.display = 'none';
      modalLooping = false;
      MemeAnim.stop();
    } else {
      video.style.display = 'none';
      canvas.style.display = 'block';
    }
    tabs.forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-tab') === tab);
    });
  }

  function openModal(meme) {
    modalMeme = meme;
    modalLooping = true;
    document.getElementById('modalMask').classList.add('show');
    document.getElementById('modalName').textContent = meme.emoji + ' ' + meme.name;
    document.getElementById('modalDesc').textContent = meme.desc + '（默认播放 B 站原视频，可切换为本站自制动画）';
    var v = document.getElementById('modalVideo');
    v.href = meme.videoUrl;
    // 嵌入 B 站官方播放器
    var bv = getBvid(meme.videoUrl);
    var frame = document.getElementById('videoFrame');
    var loading = document.getElementById('stageLoading');
    if (bv) {
      loading.classList.add('show'); // 播放器加载占位
      frame.onload = function () { loading.classList.remove('show'); };
      frame.src = 'https://player.bilibili.com/player.html?bvid=' + bv + '&autoplay=1&danmaku=1&high_quality=1';
      frame.style.display = 'block';
      showStage('video');
    } else {
      loading.classList.remove('show');
      frame.onload = null;
      frame.src = '';
      frame.style.display = 'none';
      showStage('anim');
    }
    // ---------- 详情元信息：平台 / 热度 / 出圈时间 ----------
    var meta = document.getElementById('modalMeta');
    if (meta) {
      var src = meme.source || '';
      var badge = '📅 经典';
      if (src.indexOf('B站') >= 0) badge = '📺 B站';
      else if (src.indexOf('百度') >= 0) badge = '🔥 微博';
      else if (src.indexOf('头条') >= 0 || src.indexOf('抖音') >= 0) badge = '🎵 抖音';
      var h = meme.hot || 50;
      var stars = h >= 95 ? 5 : h >= 85 ? 4 : h >= 70 ? 3 : h >= 50 ? 2 : 1;
      var hotStr = '';
      for (var s = 0; s < 5; s++) hotStr += s < stars ? '★' : '☆';
      var year = meme.year || (meme.date ? meme.date.slice(0, 4) : '');
      meta.innerHTML = '<span class="m-chip">' + badge + '</span>' +
        '<span class="m-chip hot">热度 ' + hotStr + '</span>' +
        (year ? '<span class="m-chip">出圈 ' + year + '</span>' : '') +
        (meme.videoUrl ? '<a class="m-chip link" href="' + meme.videoUrl + '" target="_blank" rel="noopener">🎥 原视频</a>' : '');
    }
    // ---------- 同类热梗推荐 ----------
    var relBox = document.getElementById('modalRelated');
    if (relBox) {
      var year2 = meme.year || (meme.date ? meme.date.slice(0, 4) : '');
      var related = [];
      var seen = {};
      if (year2) {
        (YEARS || []).forEach(function (yr) {
          (yr.memes || []).forEach(function (m2) {
            if (yr.year === year2 && m2 !== meme && !seen[m2.name]) { seen[m2.name] = 1; related.push(m2); }
          });
        });
        (RECENT_MEMES || []).forEach(function (r2) {
          var y2 = r2.date ? r2.date.slice(0, 4) : '';
          if (y2 === year2 && r2 !== meme && !seen[r2.name]) { seen[r2.name] = 1; related.push(r2); }
        });
      }
      if (related.length) {
        var html = '<div class="m-rel-title">💡 同类热梗推荐</div><div class="m-rel-list">';
        related.slice(0, 3).forEach(function (r3) {
          html += '<button class="m-rel" data-name="' + r3.name.replace(/"/g, '&quot;') + '">' + r3.emoji + ' ' + r3.name + '</button>';
        });
        html += '</div>';
        relBox.innerHTML = html;
        relBox.querySelectorAll('.m-rel').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var nm = btn.getAttribute('data-name');
            var target = null;
            (YEARS || []).forEach(function (yr) { (yr.memes || []).forEach(function (m4) { if (m4.name === nm) target = m4; }); });
            (RECENT_MEMES || []).forEach(function (r4) { if (r4.name === nm) target = r4; });
            if (target) openModal(target);
          });
        });
      } else { relBox.innerHTML = ''; }
    }
    document.body.style.overflow = 'hidden';
    var canvas = document.getElementById('modalCanvas');
    // 默认显示原视频时不启动 canvas；仅在切到「自制动画」时启动循环
    if (modalLooping) {
      (function loop() {
        if (!modalLooping) return;
        MemeAnim.start(canvas, meme, { duration: 6.5, onDone: loop });
      })();
    }
  }

  function closeModal() {
    modalLooping = false;
    MemeAnim.stop();
    var frame = document.getElementById('videoFrame');
    if (frame) frame.src = ''; // 停止播放
    document.getElementById('modalMask').classList.remove('show');
    document.body.style.overflow = '';
  }

  /* ---------- 事件绑定 ---------- */
  document.addEventListener('click', function (e) {
    var playBtn = e.target.closest('.btn.play');
    if (playBtn && playBtn.hasAttribute('data-idx')) {
      var idx = parseInt(playBtn.getAttribute('data-idx'), 10);
      openModal(RECENT_MEMES[idx]);
      return;
    }
    if (playBtn && playBtn.hasAttribute('data-vidx')) {
      var vidx = parseInt(playBtn.getAttribute('data-vidx'), 10);
      openModal(VIRAL_MEMES[vidx]);
      return;
    }
    var st = e.target.closest('.st-tab');
    if (st && modalMeme) {
      var tab = st.getAttribute('data-tab');
      showStage(tab);
      if (tab === 'anim' && !modalLooping) {
        modalLooping = true;
        var cv = document.getElementById('modalCanvas');
        (function loop() {
          if (!modalLooping) return;
          MemeAnim.start(cv, modalMeme, { duration: 6.5, onDone: loop });
        })();
      }
      return;
    }
    if (e.target.closest('#modalClose') || e.target.id === 'modalMask') {
      closeModal();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ---------- 启动 ---------- */
  renderTicker();
  renderRecent();
  renderViral();
  renderYears();
  initSearch();
  playHero();
})();
