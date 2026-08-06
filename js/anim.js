/* ============================================================
 * 热梗档案馆 · Canvas 动画引擎
 * 6 种自制动画场景：textPop / dance / emojiRain / shake / fire / flower / ring
 * ============================================================ */

/* ---------- 工具函数 ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function easeOutBack(x) {
  var c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function drawTitle(ctx, text, w, h, color, sizeRatio) {
  var size = Math.min(w / (text.length * 0.62 + 6), h * 0.14, 96);
  if (sizeRatio) size *= sizeRatio;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(16,26,58,0.9)';
  ctx.lineWidth = Math.max(3, size * 0.09);
  ctx.font = '900 ' + size + 'px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = color;
  ctx.shadowBlur = 30;
  ctx.strokeText(text, w / 2, h * 0.5);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, w / 2, h * 0.5);
  ctx.restore();
}
function drawBg(ctx, w, h, color, t) {
  var g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, shade(color, 22));
  g.addColorStop(1, '#070a16');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // 星光
  for (var i = 0; i < 42; i++) {
    var rng = mulberry32(i * 131 + 7);
    var sx = rng() * w, sy = rng() * h;
    var tw = 0.25 + 0.75 * Math.abs(Math.sin(t * 1.2 + i * 1.7));
    ctx.globalAlpha = tw * 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sx, sy, 1 + rng() * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
/* ---------- MC 方块画风（站内原创像素风） ---------- */
var MC_PAL = {
  skyTop: '#6ba7ff', skyBot: '#c8e6ff',
  sun: '#ffe87a', sunEdge: '#ffc93c',
  cloud: '#ffffff', cloudShade: '#d8e8f8',
  grassTop: '#79c143', grassSide: '#8a6a45', grassLine: '#5d9c34',
  dirt: '#7a5540', dirtDark: '#654634',
  tntRed: '#d33b2b', tntDark: '#a92c1f', tntWhite: '#f4ead9',
  diamond: '#46e8d8', gold: '#ffd84d',
  charSkin: '#e8b98a', charShirt: '#3fa9f5', charPants: '#3b5bdb'
};

/* MC 方块粒子: mcParticle(ctx,x,y,s,rot,color) */
function mcParticle(ctx, x, y, s, rot, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.fillRect(-s / 2, -s / 2, s, s);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(-s / 2, -s / 2, s, s * 0.28);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(-s / 2, s * 0.2, s, s * 0.3);
  ctx.restore();
}

/* MC 风文字: 深色粗描边 + 白字（亮背景可读） */
function drawMcText(ctx, text, x, y, size, glowColor) {
  ctx.font = '900 ' + size + 'px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(16,26,58,0.9)';
  ctx.lineWidth = Math.max(3, size * 0.09);
  ctx.strokeText(text, x, y);
  if (glowColor) { ctx.shadowColor = glowColor; ctx.shadowBlur = 26; }
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
}

/* MC 方块人（Steve 风，原创像素小人） */
function drawSteve(ctx, x, y, s, p) {
  var bob = (p.bob || 0) * s;
  var headS = 26 * s, bodyS = 20 * s;
  var hipX = x, hipY = y + bodyS + bob;
  function limb(hx, hy, ang, len, wd, col) {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(ang);
    ctx.fillStyle = col;
    ctx.fillRect(-wd / 2, 0, wd, len);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(-wd / 2, len - wd * 0.45, wd, wd * 0.45);
    ctx.restore();
  }
  // 腿
  limb(hipX - 4 * s, hipY, p.legL, 34 * s, 9 * s, MC_PAL.charPants);
  limb(hipX + 4 * s, hipY, p.legR, 34 * s, 9 * s, MC_PAL.charPants);
  // 身体
  ctx.fillStyle = MC_PAL.charShirt;
  ctx.fillRect(hipX - bodyS / 2, hipY - bodyS, bodyS, bodyS);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(hipX - bodyS / 2, hipY - bodyS, bodyS, 4 * s);
  // 手臂
  var shY = hipY - bodyS;
  limb(hipX - bodyS / 2 - 2 * s, shY, p.armL, 30 * s, 8 * s, MC_PAL.charShirt);
  limb(hipX + bodyS / 2 + 2 * s, shY, p.armR, 30 * s, 8 * s, MC_PAL.charShirt);
  // 头（方块 + 像素脸）
  var hy2 = shY - headS + 2 * s;
  ctx.fillStyle = MC_PAL.charSkin;
  ctx.fillRect(hipX - headS / 2, hy2, headS, headS);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(hipX - headS / 2, hy2, headS, 5 * s);
  var ey = hy2 + headS * 0.38, ex = headS * 0.22;
  ctx.fillStyle = '#3b2b1a';
  ctx.fillRect(hipX - ex, ey, 4 * s, 5 * s);
  ctx.fillRect(hipX + ex - 4 * s, ey, 4 * s, 5 * s);
  ctx.fillRect(hipX - 3 * s, ey + 9 * s, 6 * s, 3 * s);
}

/* MC 方块世界背景 */
function drawMcBg(ctx, w, h, t) {
  var g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, MC_PAL.skyTop);
  g.addColorStop(1, MC_PAL.skyBot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // 方块太阳
  var sx = w * 0.82, sy = h * 0.13, ss = 32;
  ctx.fillStyle = 'rgba(255,232,122,0.35)';
  ctx.fillRect(sx - ss * 0.7, sy - ss * 0.7, ss * 2.4, ss * 2.4);
  ctx.fillStyle = MC_PAL.sun;
  ctx.fillRect(sx, sy, ss, ss);
  ctx.fillStyle = MC_PAL.sunEdge;
  ctx.fillRect(sx + ss * 0.5, sy, ss * 0.5, ss);
  ctx.fillRect(sx, sy + ss * 0.5, ss, ss * 0.5);
  // 像素云
  for (var i = 0; i < 3; i++) {
    var rng = mulberry32(i * 77 + 3);
    var cx = ((t * (8 + i * 5) + rng() * (w + 220)) % (w + 220)) - 110;
    var cy = h * (0.06 + rng() * 0.2);
    var cs = 15 + rng() * 13;
    ctx.fillStyle = MC_PAL.cloud;
    ctx.fillRect(cx, cy, cs * 3, cs);
    ctx.fillRect(cx + cs, cy - cs, cs * 2, cs);
    ctx.fillStyle = MC_PAL.cloudShade;
    ctx.fillRect(cx, cy + cs * 0.55, cs * 3, cs * 0.45);
  }
  // 草方块地面
  var gy = h * 0.78;
  ctx.fillStyle = MC_PAL.grassTop;
  ctx.fillRect(0, gy, w, h - gy);
  ctx.fillStyle = MC_PAL.grassLine;
  ctx.fillRect(0, gy, w, 8);
  ctx.fillStyle = MC_PAL.grassSide;
  ctx.fillRect(0, gy + 8, w, 14);
  ctx.fillStyle = MC_PAL.dirt;
  ctx.fillRect(0, gy + 22, w, h - gy - 22);
  ctx.fillStyle = MC_PAL.dirtDark;
  for (var j = 0; j < 14; j++) {
    var r2 = mulberry32(j * 13 + 5);
    ctx.fillRect(r2() * w, gy + 28 + r2() * (h - gy - 46), 6 + r2() * 10, 4 + r2() * 6);
  }
}

/* 颜色变亮/变暗: shade('#4fc3f7', 22) 加深22% */
function shade(hex, amt) {
  var c = hex.replace('#', '');
  var r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
  r = clamp(Math.round(r - amt), 0, 255);
  g = clamp(Math.round(g - amt), 0, 255);
  b = clamp(Math.round(b - amt), 0, 255);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

/* ---------- 火柴人 ---------- */
function stickEnd(x, y, ang, len) {
  return { x: x + Math.sin(ang) * len, y: y + Math.cos(ang) * len };
}
function drawStick(ctx, x, y, s, p, color) {
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(3, 4.5 * s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  var bob = (p.bob || 0) * s;
  var hipX = x, hipY = y + 30 * s + bob;
  var footL = stickEnd(hipX, hipY, p.legL, 42 * s);
  var footR = stickEnd(hipX, hipY, p.legR, 42 * s);
  ctx.beginPath();
  ctx.moveTo(hipX, hipY); ctx.lineTo(footL.x, footL.y);
  ctx.moveTo(hipX, hipY); ctx.lineTo(footR.x, footR.y);
  ctx.stroke();
  var shX = hipX + Math.sin(p.lean) * 22 * s, shY = hipY - 46 * s;
  ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.lineTo(shX, shY); ctx.stroke();
  var handL = stickEnd(shX, shY, p.armL, 40 * s);
  var handR = stickEnd(shX, shY, p.armR, 40 * s);
  ctx.beginPath();
  ctx.moveTo(shX, shY); ctx.lineTo(handL.x, handL.y);
  ctx.moveTo(shX, shY); ctx.lineTo(handR.x, handR.y);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(shX, shY - 15 * s, 12.5 * s, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

/* ---------- 场景：文字弹跳 ---------- */
function sceneTextPop(ctx, w, h, t, meme) {
  var text = meme.animText || meme.name;
  var grow = easeOutBack(clamp(t / 0.65, 0, 1));
  var wob = t > 0.65 ? Math.sin((t - 0.65) * 3.2) * 0.025 * Math.max(0, 1 - (t - 0.65) / 3) : 0;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(grow + wob, grow - wob * 0.6);
  var size = Math.min(w / (text.length * 0.62 + 4), h * 0.16, 92);
  drawMcText(ctx, text, 0, 0, size, meme.color);
  ctx.restore();
  for (var i = 0; i < 26; i++) {
    var a = (i / 26) * Math.PI * 2 + t * 0.6;
    var rr = Math.min(w, h) * 0.32 + 42 * Math.sin(t * 2.1 + i * 2.4);
    var px = w / 2 + Math.cos(a) * rr, py = h / 2 + Math.sin(a) * rr;
    ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t * 2.6 + i));
    mcParticle(ctx, px, py, 6 + (i % 3) * 3, t * 1.4 + i, meme.color);
  }
  ctx.globalAlpha = 1;
}

/* ---------- 场景：MC 方块人跳舞（科目三） ---------- */
function sceneDance(ctx, w, h, t, meme) {
  var groundY = h * 0.72;
  // MC 方块节拍柱
  for (var i = 0; i < 9; i++) {
    var beat = Math.abs(Math.sin(t * 5.4 + i * 0.75));
    var bw = w / 9 - 8, bx = i * (w / 9) + 4;
    var bh = 26 + beat * 110;
    ctx.fillStyle = meme.color + 'aa';
    ctx.fillRect(bx, groundY + 6, bw, -bh);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(bx, groundY + 6, bw, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(bx + bw - 6, groundY + 6, 6, -bh);
  }
  var s = Math.min(w, h) / 300;
  var x = w / 2, y = groundY - 108 * s;
  var f = t * 5.6;
  var pose = {
    lean: Math.sin(f) * 0.14,
    armL: Math.sin(f) * 1.25 + 0.5,
    armR: Math.sin(f + Math.PI) * 1.25 + 0.5,
    legL: Math.sin(f) * 0.55,
    legR: Math.sin(f + Math.PI) * 0.55,
    bob: Math.abs(Math.sin(f)) * 9
  };
  drawSteve(ctx, x, y, s, pose);
  // 动作名称
  drawMcText(ctx, (meme.animText || meme.name) + ' 💃', w / 2, h * 0.88, Math.min(w * 0.05, 34), meme.color);
}

/* ---------- 场景：表情雨 ---------- */
function sceneEmojiRain(ctx, w, h, t, meme) {
  var emojis = meme.emojis || ['✨'];
  for (var i = 0; i < 34; i++) {
    var rng = mulberry32(i * 991 + 31);
    var emo = emojis[i % emojis.length];
    var size = 16 + rng() * 30;
    var vy = 70 + rng() * 150;
    var span = h + 160;
    var yOff = ((t * vy + rng() * span) % span) - 80;
    var x = rng() * w + Math.sin(t + i) * 12;
    var rot = rng() * Math.PI * 2 + t * (rng() * 2 - 1) * 1.6;
    ctx.save();
    ctx.translate(x, yOff);
    ctx.rotate(rot);
    ctx.globalAlpha = clamp(1 - Math.abs(yOff - h / 2) / (h / 1.4), 0.15, 1);
    ctx.font = size + 'px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(emo, 0, 0);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  // 底部涟漪
  for (var j = 0; j < 6; j++) {
    var ph = (t * 0.8 + j / 6) % 1;
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.4 * (1 - ph)) + ')';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(w / 2 + (j - 3) * 40, h * 0.86, 18 + ph * 90, (18 + ph * 90) * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  drawTitle(ctx, meme.animText || meme.name, w, h, meme.color, 0.8);
}

/* ---------- 场景：剧烈抖动 ---------- */
function sceneShake(ctx, w, h, t, meme) {
  var amp = 10 + 4 * Math.sin(t * 7);
  ctx.save();
  ctx.translate((Math.random() * 2 - 1) * amp, (Math.random() * 2 - 1) * amp);
  var pulse = 0.06 + 0.05 * Math.sin(t * 11);
  ctx.fillStyle = 'rgba(255, 60, 60, ' + pulse.toFixed(3) + ')';
  ctx.fillRect(-30, -30, w + 60, h + 60);
  var text = meme.animText || meme.name;
  var size = Math.min(w / (text.length * 0.68 + 4), h * 0.15, 88);
  var jx = (Math.random() * 2 - 1) * 9, jy = (Math.random() * 2 - 1) * 9;
  drawMcText(ctx, text, w / 2 + jx, h / 2 + jy, size, '#ff1744');
  ctx.restore();
  // 感叹号
  for (var i = 0; i < 3; i++) {
    var ex = w * (0.22 + 0.28 * i) + Math.sin(t * 6 + i) * 14;
    var ey = h * 0.3 + Math.sin(t * 8 + i * 2) * 10;
    ctx.font = '900 ' + Math.min(w * 0.09, 60) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(t * 4 + i));
    ctx.fillStyle = '#ff5252';
    ctx.fillText('❗', ex, ey);
  }
  ctx.globalAlpha = 1;
}

/* ---------- 场景：方块火焰（MC 火苗） ---------- */
function sceneFire(ctx, w, h, t, meme) {
  for (var i = 0; i < 90; i++) {
    var rng = mulberry32(i * 613 + 13);
    var cycle = (t * 0.55 + rng()) % 1;
    var x = w * (0.12 + 0.76 * rng()) + Math.sin(t * 2.4 + i * 0.9) * 24;
    var y = h - cycle * h * 0.82;
    var size = (7 + rng() * 26) * (1 - cycle * 0.75);
    var hue = rng() > 0.55 ? 16 : 42;
    ctx.globalAlpha = (1 - cycle) * 0.85;
    mcParticle(ctx, x, y, size * 1.5, t * 3 + i * 0.7, 'hsl(' + hue + ', 100%, ' + (52 + cycle * 22) + '%)');
  }
  ctx.globalAlpha = 1;
  // 火星（小方块）
  for (var j = 0; j < 26; j++) {
    var r2 = mulberry32(j * 317 + 5);
    var cy2 = (t * 0.9 + r2()) % 1;
    var x2 = w * (0.1 + 0.8 * r2());
    var y2 = h - cy2 * h * 0.9;
    ctx.globalAlpha = (1 - cy2) * 0.9;
    mcParticle(ctx, x2, y2, (2.5 * (1 - cy2) + 0.5) * 2, t * 5 + j, '#ffd740');
  }
  ctx.globalAlpha = 1;
  var text = meme.animText || meme.name;
  var size = Math.min(w / (text.length * 0.6 + 4), h * 0.13, 80);
  drawMcText(ctx, text, w / 2 + Math.sin(t * 2) * 4, h / 2 + Math.cos(t * 3) * 4, size, '#ff6d00');
}

/* ---------- 场景：MC TNT 爆炸 ---------- */
function sceneMcTnt(ctx, w, h, t, meme) {
  var cx = w / 2, cy = h * 0.4;
  var text = meme.animText || meme.name;
  if (t < 2.0) {
    // TNT 闪烁阶段
    var flash = Math.abs(Math.sin(t * 14)) > 0.55;
    var bs = Math.min(w, h) * 0.17;
    ctx.fillStyle = flash ? MC_PAL.tntWhite : MC_PAL.tntRed;
    ctx.fillRect(cx - bs / 2, cy - bs / 2, bs, bs);
    ctx.fillStyle = flash ? '#ffffff' : MC_PAL.tntDark;
    ctx.fillRect(cx - bs / 2, cy - bs / 2, bs, bs * 0.14);
    ctx.fillStyle = flash ? MC_PAL.tntRed : '#24160f';
    ctx.font = '900 ' + bs * 0.36 + 'px "Courier New", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('TNT', cx, cy + bs * 0.06);
    drawMcText(ctx, text, cx, cy - bs * 1.0, Math.min(w * 0.06, 40), meme.color);
  } else {
    // 爆炸阶段
    var et = t - 2.0;
    var colors = ['#ff6d00', '#ff3d00', '#ffd54f', '#ff9800', '#f4ead9'];
    for (var i = 0; i < 46; i++) {
      var rng = mulberry32(i * 911 + 17);
      var a = rng() * Math.PI * 2;
      var spd = 60 + rng() * 320;
      var dist = spd * et;
      var px = cx + Math.cos(a) * dist;
      var py = cy + Math.sin(a) * dist * 0.75 + et * et * 40;
      var ps = (7 + rng() * 20) * clamp(1 - et / 2.4, 0.15, 1);
      ctx.globalAlpha = clamp(1 - et / 2.6, 0, 1);
      mcParticle(ctx, px, py, ps, a + et * 6, colors[i % colors.length]);
    }
    ctx.globalAlpha = 1;
    // 方块冲击波环
    var ring = clamp(et * 1.6, 0, 1);
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.6 * (1 - ring)) + ')';
    ctx.lineWidth = 6 + ring * 8;
    ctx.strokeRect(cx - 90 * ring, cy - 90 * ring, 180 * ring, 180 * ring);
    // BOOM 文字
    var bsize = Math.min(w * 0.2, 88) * clamp(1 - et * 1.5, 0.35, 1);
    ctx.fillStyle = 'rgba(255,255,255,' + (0.9 * clamp(1 - et * 2.0, 0, 1)) + ')';
    ctx.font = '900 ' + bsize + 'px "Courier New", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('BOOM!', cx, cy);
    drawMcText(ctx, text, cx, cy + bsize * 1.3, Math.min(w * 0.055, 34), meme.color);
  }
}

/* ---------- 场景：MC 方块雨 ---------- */
function sceneMcRain(ctx, w, h, t, meme) {
  var blocks = [
    { top: MC_PAL.grassTop, side: MC_PAL.dirt },
    { top: MC_PAL.diamond, side: '#2ea8a0' },
    { top: MC_PAL.tntRed, side: MC_PAL.tntDark },
    { top: MC_PAL.gold, side: '#c9972e' },
    { top: '#a8c4e8', side: '#7d97b8' }
  ];
  for (var i = 0; i < 30; i++) {
    var rng = mulberry32(i * 331 + 9);
    var b = blocks[i % blocks.length];
    var size = 18 + rng() * 26;
    var vy = 90 + rng() * 120;
    var span = h + 220;
    var yOff = ((t * vy + rng() * span) % span) - 110;
    var x = rng() * w;
    var rot = rng() * 0.4 * Math.sin(t + i);
    ctx.save();
    ctx.translate(x, yOff);
    ctx.rotate(rot);
    ctx.fillStyle = b.top;
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.fillStyle = b.side;
    ctx.fillRect(-size / 2, size * 0.18, size, size * 0.32);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(-size / 2, size / 2 - 4, size, 4);
    ctx.restore();
  }
  drawTitle(ctx, meme.animText || meme.name, w, h, meme.color, 0.8);
}

/* ---------- 场景：开花 ---------- */
function sceneFlower(ctx, w, h, t, meme) {
  var flowers = [meme.color, '#ffd54f', '#f48fb1'];
  for (var f = 0; f < 3; f++) {
    var fx = w * (0.2 + 0.3 * f);
    var fy = h * 0.8;
    var grow = easeOutBack(clamp(t * 0.42 - f * 0.14, 0, 1));
    if (grow <= 0.01) continue;
    var stemH = 130 * grow;
    ctx.strokeStyle = '#66bb6a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.quadraticCurveTo(fx + Math.sin(t * 1.4 + f) * 10, fy - stemH / 2, fx, fy - stemH);
    ctx.stroke();
    // 叶子
    ctx.strokeStyle = '#81c784';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fx, fy - stemH * 0.45);
    ctx.quadraticCurveTo(fx + 26, fy - stemH * 0.4, fx + 30, fy - stemH * 0.52);
    ctx.moveTo(fx, fy - stemH * 0.7);
    ctx.quadraticCurveTo(fx - 24, fy - stemH * 0.66, fx - 28, fy - stemH * 0.78);
    ctx.stroke();
    // 花瓣
    var pc = flowers[f % 3];
    for (var p = 0; p < 6; p++) {
      var a = (p / 6) * Math.PI * 2 + t * 0.5 + f;
      var px = fx + Math.cos(a) * 13 * grow;
      var py = fy - stemH + Math.sin(a) * 13 * grow;
      ctx.fillStyle = pc;
      ctx.beginPath();
      ctx.ellipse(px, py, 8 * grow, 13 * grow, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.arc(fx, fy - stemH, 6.5 * grow, 0, Math.PI * 2);
    ctx.fill();
  }
  drawTitle(ctx, meme.animText || meme.name, w, h, meme.color, 0.72);
}

/* ---------- 场景：光环扩散 ---------- */
function sceneRing(ctx, w, h, t, meme) {
  var cx = w / 2, cy = h / 2;
  for (var i = 0; i < 4; i++) {
    var phase = (t * 0.42 + i / 4) % 1;
    var r = phase * Math.max(w, h) * 0.68;
    ctx.strokeStyle = meme.color;
    ctx.globalAlpha = (1 - phase) * 0.55;
    ctx.lineWidth = 3 + phase * 8;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  for (var j = 0; j < 22; j++) {
    var a = (j / 22) * Math.PI * 2;
    var len = 26 + Math.sin(t * 4 + j) * 18;
    var r0 = Math.min(w, h) * 0.26 + len;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a) * (r0 + 36), cy + Math.sin(a) * (r0 + 36));
    ctx.stroke();
  }
  var pulse = 1 + Math.sin(t * 3.2) * 0.035;
  var text = meme.animText || meme.name;
  var size = Math.min(w / (text.length * 0.62 + 4), h * 0.15, 88);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(pulse, pulse);
  drawMcText(ctx, text, 0, 0, size, meme.color);
  ctx.restore();
}

/* ---------- 引擎 ---------- */
var MemeAnim = {
  raf: null,
  resizeHandler: null,
  scenes: {
    textPop: sceneTextPop,
    dance: sceneDance,
    emojiRain: sceneEmojiRain,
    shake: sceneShake,
    fire: sceneFire,
    flower: sceneFlower,
    ring: sceneRing,
    mcTnt: sceneMcTnt,
    mcRain: sceneMcRain
  },
  start: function (canvas, meme, opts) {
    this.stop();
    var self = this;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    function fit() {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    fit();
    this.resizeHandler = function () { fit(); };
    window.addEventListener('resize', this.resizeHandler);
    var scene = this.scenes[meme.animation] || sceneTextPop;
    var duration = (opts && opts.duration) || 6.5;
    var start = performance.now();
    function loop(now) {
      var t = (now - start) / 1000;
      var w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      drawMcBg(ctx, w, h, t);
      scene(ctx, w, h, t, meme);
      if (t < duration) {
        self.raf = requestAnimationFrame(loop);
      } else if (opts && opts.onDone) {
        opts.onDone();
      }
    }
    self.raf = requestAnimationFrame(loop);
  },
  stop: function () {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
  }
};