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
  function renderRecent() {
    var grid = document.getElementById('recentGrid');
    if (!grid) return;
    grid.innerHTML = RECENT_MEMES.map(function (m, i) {
      var tags = (m.tags || []).map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('');
      return '<div class="card">' +
        '<div class="rank">#' + (i + 1) + '</div>' +
        '<div class="date">' + (m.date || '') + '</div>' +
        '<div class="card-top"><span class="card-emoji">' + m.emoji + '</span>' +
        '<div class="card-name">' + m.name + '</div></div>' +
        '<div class="card-tags">' + tags + '</div>' +
        '<div class="card-desc">' + m.desc + '</div>' +
        '<div class="hot-bar"><span class="label">🔥 热度</span>' +
        '<div class="track"><div class="fill" data-hot="' + m.hot + '"></div></div>' +
        '<span class="num">' + m.hot + '</span></div>' +
        '<div class="card-actions">' +
        '<button class="btn play" data-idx="' + i + '">🎬 播放动画</button>' +
        '<a class="btn video" href="' + m.videoUrl + '" target="_blank" rel="noopener">▶ 看视频</a>' +
        '</div></div>';
    }).join('');
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

  function openModal(meme) {
    modalMeme = meme;
    modalLooping = true;
    document.getElementById('modalMask').classList.add('show');
    document.getElementById('modalName').textContent = meme.emoji + ' ' + meme.name;
    document.getElementById('modalDesc').textContent = meme.desc + '（动画为本站自制 Canvas 演示，非原视频）';
    var v = document.getElementById('modalVideo');
    v.href = meme.videoUrl;
    document.body.style.overflow = 'hidden';
    var canvas = document.getElementById('modalCanvas');
    // 循环播放，直到关闭
    function loop() {
      if (!modalLooping) return;
      MemeAnim.start(canvas, meme, { duration: 6.5, onDone: loop });
    }
    loop();
  }

  function closeModal() {
    modalLooping = false;
    MemeAnim.stop();
    document.getElementById('modalMask').classList.remove('show');
    document.body.style.overflow = '';
  }

  /* ---------- 事件绑定 ---------- */
  document.addEventListener('click', function (e) {
    var playBtn = e.target.closest('.btn.play');
    if (playBtn) {
      var idx = parseInt(playBtn.getAttribute('data-idx'), 10);
      openModal(RECENT_MEMES[idx]);
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
  renderYears();
  playHero();
})();