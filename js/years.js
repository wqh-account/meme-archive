/* ============================================================
 * 热梗档案馆 · 编年史页逻辑
 * ============================================================ */
(function () {
  'use strict';

  var timeline = document.getElementById('timeline');

  timeline.innerHTML = YEARS.map(function (y) {
    var cards = y.memes.map(function (m, i) {
      return '<div class="tl-card" style="--yc:' + y.color + '">' +
        '<div class="tl-top"><span class="tl-emoji">' + m.emoji + '</span>' +
        '<span class="tl-name">' + m.name + '</span>' +
        '<span class="tl-hot">🔥' + m.hot + '</span></div>' +
        '<div class="tl-desc">' + m.desc + '</div>' +
        '<div class="tl-actions">' +
        '<button class="btn play" data-year="' + y.year + '" data-idx="' + i + '">🎬 播放动画</button>' +
        '<a class="btn video" href="' + m.videoUrl + '" target="_blank" rel="noopener">▶ 看视频</a>' +
        '</div></div>';
    }).join('');
    return '<div class="tl-year" id="' + y.year + '" style="--yc:' + y.color + '">' +
      '<h2>' + y.year + '</h2>' +
      '<div class="tl-title">' + y.title + '</div>' +
      '<div class="tl-grid">' + cards + '</div></div>';
  }).join('');

  /* ---------- 弹窗 ---------- */
  var modalLooping = false;

  function findMeme(year, idx) {
    for (var i = 0; i < YEARS.length; i++) {
      if (YEARS[i].year === year) return YEARS[i].memes[idx];
    }
    return null;
  }

  function openModal(meme) {
    modalLooping = true;
    document.getElementById('modalMask').classList.add('show');
    document.getElementById('modalName').textContent = meme.emoji + ' ' + meme.name;
    document.getElementById('modalDesc').textContent = meme.desc + '（动画为本站自制 Canvas 演示，非原视频）';
    var v = document.getElementById('modalVideo');
    v.href = meme.videoUrl;
    document.body.style.overflow = 'hidden';
    var canvas = document.getElementById('modalCanvas');
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

  document.addEventListener('click', function (e) {
    var playBtn = e.target.closest('.btn.play');
    if (playBtn) {
      var m = findMeme(playBtn.getAttribute('data-year'), parseInt(playBtn.getAttribute('data-idx'), 10));
      if (m) openModal(m);
      return;
    }
    if (e.target.closest('#modalClose') || e.target.id === 'modalMask') closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ---------- 锚点定位（避开固定导航栏） ---------- */
  if (location.hash) {
    setTimeout(function () {
      var t = document.getElementById(location.hash.slice(1));
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  }
})();
