// daily.js - render daily hot topics with portal buttons
(function () {
  "use strict";
  var DATA = window.DAILY_HOT || null;
  var PLATFORMS = [
    { key: "weibo",  name: "微博", emoji: "🔁", portalName: "微博" },
    { key: "bili",   name: "B站",  emoji: "📺", portalName: "B站" },
    { key: "douyin", name: "抖音", emoji: "🎵", portalName: "抖音" }
  ];

  function searchUrl(title, platform) {
    var q = encodeURIComponent(title);
    if (platform === "weibo")  return "https://s.weibo.com/weibo?q=" + q;
    if (platform === "bili")   return "https://search.bilibili.com/all?keyword=" + q;
    if (platform === "douyin") return "https://www.douyin.com/search/" + q;
    return "#";
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fmtHot(h) {
    h = parseInt(h, 10);
    if (!h || isNaN(h)) return "🔥 热";
    if (h >= 100000000) return (h / 100000000).toFixed(1) + " 亿";
    if (h >= 10000) return (h / 10000).toFixed(1) + " 万";
    return String(h);
  }

  var tabsEl = document.getElementById("dailyTabs");
  var listEl = document.getElementById("dailyList");
  var updEl = document.getElementById("dailyUpdated");
  var srcEl = document.getElementById("dailySource");
  var current = "weibo";
  // 支持 hash 直达：daily.html#douyin / #bili / #weibo
  var _h = location.hash ? location.hash.replace('#', '') : '';
  if (_h && PLATFORMS.some(function (p) { return p.key === _h; })) current = _h;
  // default to the first platform that has data (better UX)
  if (DATA) {
    for (var i = 0; i < PLATFORMS.length; i++) {
      if (DATA[PLATFORMS[i].key] && DATA[PLATFORMS[i].key].length) { current = PLATFORMS[i].key; break; }
    }
  }

  function platformLabel(key) {
    for (var i = 0; i < PLATFORMS.length; i++) if (PLATFORMS[i].key === key) return PLATFORMS[i];
    return null;
  }

  function renderTabs() {
    var html = "";
    PLATFORMS.forEach(function (p) {
      var count = (DATA && DATA[p.key]) ? DATA[p.key].length : 0;
      html += '<div class="d-tab' + (p.key === current ? " active" : "") + '" data-key="' + p.key + '">' +
        p.emoji + " " + p.name + " <span style='opacity:.6'>(" + count + ")</span></div>";
    });
    tabsEl.innerHTML = html;
    tabsEl.querySelectorAll(".d-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        current = tab.getAttribute("data-key");
        renderTabs();
        renderList();
      });
    });
  }

  function renderList() {
    if (!DATA) {
      listEl.innerHTML = '<div class="d-empty"><b>数据加载中…</b><br>请稍后刷新，或检查 js/daily-data.js 是否存在</div>';
      return;
    }
    var items = DATA[current] || [];
    var p = platformLabel(current);
    if (!items.length) {
      listEl.innerHTML = '<div class="d-empty">' + (p ? p.emoji + " " + p.name : "") +
        ' 暂无数据<br><b>若持续为空</b>：数据源可能被临时限制，等待下一次自动更新即可</div>';
      return;
    }
    var html = "";
    items.forEach(function (it, idx) {
      var rank = it.rank || idx + 1;
      var rankCls = rank === 1 ? " top1" : (rank === 2 ? " top2" : (rank === 3 ? " top3" : ""));
      var btns = "";
      PLATFORMS.forEach(function (pp) {
        btns += '<a class="d-btn" href="' + esc(searchUrl(it.title, pp.key)) + '" target="_blank" rel="noopener">' +
          pp.emoji + " " + pp.portalName + "搜</a>";
      });
      html += '<div class="d-card">' +
        '<div class="d-rank' + rankCls + '">' + rank + "</div>" +
        '<div class="d-title" title="点击查看源页面">' + esc(it.title) + "</div>" +
        '<div class="d-hot">' + fmtHot(it.hot) + "</div>" +
        '<div class="d-portal">' + btns + "</div>" +
        "</div>";
    });
    listEl.innerHTML = html;
    listEl.querySelectorAll(".d-title").forEach(function (el, idx2) {
      el.addEventListener("click", function () {
        var u = items[idx2] && items[idx2].url;
        if (u) window.open(u, "_blank");
      });
    });
  }

  function renderMeta() {
    if (!DATA) {
      updEl.textContent = "⏳ 更新时间：--";
      srcEl.textContent = "数据源：--";
      return;
    }
    updEl.textContent = "🕐 更新时间：" + (DATA.updatedAt || DATA.date || "--");
    var s = DATA.sources || {};
    var parts = [];
    PLATFORMS.forEach(function (p) {
      var v = s[p.key];
      if (v) parts.push(p.emoji + p.name + ":" + v);
    });
    srcEl.textContent = "数据源：" + (parts.join("  ") || "--");
  }

  renderTabs();
  renderMeta();
  renderList();

})();
