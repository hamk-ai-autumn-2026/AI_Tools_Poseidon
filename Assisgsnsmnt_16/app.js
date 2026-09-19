(function(){
"use strict";

const stage   = document.getElementById('stage');
const base    = document.getElementById('base');
const preview = document.getElementById('preview');
const bctx = base.getContext('2d', {willReadFrequently:true});
const pctx = preview.getContext('2d');
const hint = document.getElementById('hint');
const toastEl = document.getElementById('toast');

let dpr = Math.min(window.devicePixelRatio || 1, 2);
let W = 0, H = 0;                       // CSS pixel size of the canvas
let tool = 'brush';
let color = '#d4432a';
let size = 8;
let alpha = 1;
let sym = 'none';
let paper = '#ffffff';

const undoStack = [];
const redoStack = [];
const MAX_HISTORY = 30;

/* ---------- toast ---------- */
let toastTimer;
function toast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toastEl.classList.remove('show'), 2200);
}

/* ---------- sizing ---------- */
function setupCanvas(cv, ctx){
  cv.width  = Math.max(1, Math.round(W * dpr));
  cv.height = Math.max(1, Math.round(H * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function resize(){
  const r = stage.getBoundingClientRect();
  const nw = Math.max(1, Math.round(r.width));
  const nh = Math.max(1, Math.round(r.height));
  if (nw === W && nh === H) return;

  let snapshot = null;
  if (W && H && base.width && base.height){
    snapshot = document.createElement('canvas');
    snapshot.width = base.width;
    snapshot.height = base.height;
    snapshot.getContext('2d').drawImage(base, 0, 0);
  }
  W = nw; H = nh;
  setupCanvas(base, bctx);
  setupCanvas(preview, pctx);
  if (snapshot) bctx.drawImage(snapshot, 0, 0, W, H);
}

const ro = new ResizeObserver(resize);
ro.observe(stage);

/* ---------- history ---------- */
function pushHistory(){
  try{
    const c = document.createElement('canvas');
    c.width = base.width; c.height = base.height;
    c.getContext('2d').drawImage(base, 0, 0);
    undoStack.push(c);
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack.length = 0;
  }catch(e){ /* history is a nicety, never fatal */ }
  refreshHistoryButtons();
}
function restore(cv){
  bctx.save();
  bctx.setTransform(1,0,0,1,0,0);
  bctx.clearRect(0,0,base.width,base.height);
  bctx.drawImage(cv, 0, 0, base.width, base.height);
  bctx.restore();
}
function snapshotNow(){
  const c = document.createElement('canvas');
  c.width = base.width; c.height = base.height;
  c.getContext('2d').drawImage(base, 0, 0);
  return c;
}
function undo(){
  if (!undoStack.length) return;
  redoStack.push(snapshotNow());
  restore(undoStack.pop());
  refreshHistoryButtons();
}
function redo(){
  if (!redoStack.length) return;
  undoStack.push(snapshotNow());
  restore(redoStack.pop());
  refreshHistoryButtons();
}
function refreshHistoryButtons(){
  document.getElementById('undo').disabled = undoStack.length === 0;
  document.getElementById('redo').disabled = redoStack.length === 0;
}

/* ---------- symmetry ---------- */
function mirrored(pt){
  const cx = W/2, cy = H/2;
  if (sym === 'none') return [pt];
  if (sym === 'v')    return [pt, {x: W - pt.x, y: pt.y}];
  if (sym === 'h')    return [pt, {x: pt.x, y: H - pt.y}];
  if (sym === 'quad') return [pt, {x: W-pt.x, y: pt.y}, {x: pt.x, y: H-pt.y}, {x: W-pt.x, y: H-pt.y}];
  const n = parseInt(sym, 10);
  const out = [];
  const dx = pt.x - cx, dy = pt.y - cy;
  for (let i = 0; i < n; i++){
    const a = (Math.PI * 2 * i) / n;
    const c = Math.cos(a), s = Math.sin(a);
    out.push({x: cx + dx*c - dy*s, y: cy + dx*s + dy*c});
  }
  return out;
}

/* ---------- drawing ---------- */
function styleCtx(ctx, erasing){
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = erasing ? 1 : alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
}

function segment(a, b){
  const erasing = tool === 'eraser';
  styleCtx(bctx, erasing);
  const A = mirrored(a), B = mirrored(b);
  for (let i = 0; i < A.length; i++){
    bctx.beginPath();
    bctx.moveTo(A[i].x, A[i].y);
    bctx.lineTo(B[i].x, B[i].y);
    bctx.stroke();
  }
  bctx.globalCompositeOperation = 'source-over';
  bctx.globalAlpha = 1;
}

function drawShape(ctx, a, b){
  styleCtx(ctx, false);
  ctx.beginPath();
  if (tool === 'line'){
    ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
  } else if (tool === 'rect'){
    ctx.rect(Math.min(a.x,b.x), Math.min(a.y,b.y), Math.abs(b.x-a.x), Math.abs(b.y-a.y));
  } else if (tool === 'ellipse'){
    ctx.ellipse((a.x+b.x)/2, (a.y+b.y)/2, Math.abs(b.x-a.x)/2, Math.abs(b.y-a.y)/2, 0, 0, Math.PI*2);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/* ---------- flood fill ---------- */
function hexToRgb(hex){
  const h = hex.replace('#','');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
function floodFill(pt){
  const w = base.width, h = base.height;
  const x0 = Math.round(pt.x * dpr), y0 = Math.round(pt.y * dpr);
  if (x0 < 0 || y0 < 0 || x0 >= w || y0 >= h) return;
  const img = bctx.getImageData(0, 0, w, h);
  const d = img.data;
  const at = (x,y) => (y*w + x) * 4;
  const start = at(x0,y0);
  const tr=d[start], tg=d[start+1], tb=d[start+2], ta=d[start+3];
  const [nr,ng,nb] = hexToRgb(color);
  const na = Math.round(alpha * 255);
  if (tr===nr && tg===ng && tb===nb && ta===na) return;

  const tol = 32;
  const match = (i) =>
    Math.abs(d[i]-tr) <= tol && Math.abs(d[i+1]-tg) <= tol &&
    Math.abs(d[i+2]-tb) <= tol && Math.abs(d[i+3]-ta) <= tol;

  const stack = [[x0,y0]];
  const seen = new Uint8Array(w*h);
  while (stack.length){
    const [x,y] = stack.pop();
    const idx = y*w + x;
    if (seen[idx]) continue;
    const i = idx*4;
    if (!match(i)) continue;
    seen[idx] = 1;
    d[i]=nr; d[i+1]=ng; d[i+2]=nb; d[i+3]=na;
    if (x > 0)     stack.push([x-1,y]);
    if (x < w-1)   stack.push([x+1,y]);
    if (y > 0)     stack.push([x,y-1]);
    if (y < h-1)   stack.push([x,y+1]);
  }
  bctx.save();
  bctx.setTransform(1,0,0,1,0,0);
  bctx.putImageData(img, 0, 0);
  bctx.restore();
}

/* ---------- pointer handling ---------- */
let drawing = false, startPt = null, lastPt = null, activeId = null;

function posOf(e){
  const r = stage.getBoundingClientRect();
  return {x: e.clientX - r.left, y: e.clientY - r.top};
}

stage.addEventListener('pointerdown', (e) => {
  if (activeId !== null) return;
  activeId = e.pointerId;
  try { stage.setPointerCapture(e.pointerId); } catch(_){}
  hint.style.opacity = '0';
  pushHistory();

  const p = posOf(e);
  if (tool === 'fill'){ floodFill(p); activeId = null; return; }

  drawing = true;
  startPt = lastPt = p;
  if (tool === 'brush' || tool === 'eraser') segment(p, p);
});

stage.addEventListener('pointermove', (e) => {
  if (!drawing || e.pointerId !== activeId) return;
  const p = posOf(e);
  if (tool === 'brush' || tool === 'eraser'){
    const pts = (typeof e.getCoalescedEvents === 'function') ? e.getCoalescedEvents() : [e];
    for (const ev of pts){
      const q = posOf(ev);
      segment(lastPt, q);
      lastPt = q;
    }
  } else {
    pctx.clearRect(0, 0, W, H);
    drawShape(pctx, startPt, p);
    lastPt = p;
  }
});

function endStroke(e){
  if (!drawing || (e && e.pointerId !== activeId)) { activeId = null; return; }
  drawing = false;
  activeId = null;
  if (tool === 'line' || tool === 'rect' || tool === 'ellipse'){
    pctx.clearRect(0, 0, W, H);
    drawShape(bctx, startPt, lastPt);
  }
}
stage.addEventListener('pointerup', endStroke);
stage.addEventListener('pointercancel', endStroke);
stage.addEventListener('pointerleave', (e)=>{ if(drawing) endStroke(e); });

/* ---------- controls ---------- */
const PALETTE = ['#171512','#ffffff','#d4432a','#e8912a','#f2cb3d','#3f9e5a','#2f7fd1','#7a4bc4','#d95fa0','#8a6a4f'];
const swWrap = document.getElementById('swatches');
PALETTE.forEach((c, i) => {
  const b = document.createElement('button');
  b.className = 'sw' + (i === 2 ? ' on' : '');
  b.style.background = c;
  b.title = c;
  b.addEventListener('click', () => {
    color = c;
    document.getElementById('custom').value = c;
    swWrap.querySelectorAll('.sw').forEach(s => s.classList.remove('on'));
    b.classList.add('on');
  });
  swWrap.appendChild(b);
});

document.getElementById('custom').addEventListener('input', (e) => {
  color = e.target.value;
  swWrap.querySelectorAll('.sw').forEach(s => s.classList.remove('on'));
});

document.getElementById('tools').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-tool]');
  if (!b) return;
  tool = b.dataset.tool;
  document.querySelectorAll('#tools button').forEach(x => x.classList.toggle('on', x === b));
});

const sizeEl = document.getElementById('size'), sizeVal = document.getElementById('sizeVal');
sizeEl.addEventListener('input', () => { size = +sizeEl.value; sizeVal.textContent = size; });

const alphaEl = document.getElementById('alpha'), alphaVal = document.getElementById('alphaVal');
alphaEl.addEventListener('input', () => { alpha = alphaEl.value/100; alphaVal.textContent = alphaEl.value + '%'; });

document.getElementById('sym').addEventListener('change', (e) => { sym = e.target.value; });

document.getElementById('paper').addEventListener('input', (e) => {
  paper = e.target.value;
  stage.style.background = paper;
});

document.getElementById('undo').addEventListener('click', undo);
document.getElementById('redo').addEventListener('click', redo);
document.getElementById('clear').addEventListener('click', () => {
  pushHistory();
  bctx.save();
  bctx.setTransform(1,0,0,1,0,0);
  bctx.clearRect(0,0,base.width,base.height);
  bctx.restore();
  hint.style.opacity = '1';
});

/* theme toggle */
const themeBtn = document.getElementById('theme');
themeBtn.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme');
  let next;
  if (cur === 'dark') next = 'light';
  else if (cur === 'light') next = 'dark';
  else next = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('kaleido-theme', next); } catch(_){}
});
try {
  const saved = localStorage.getItem('kaleido-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
} catch(_){}

/* keyboard shortcuts */
const KEYS = {b:'brush', e:'eraser', l:'line', r:'rect', o:'ellipse', f:'fill'};
window.addEventListener('keydown', (e) => {
  if (e.target.matches('input, select, textarea')) return;
  const k = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && k === 'z'){
    e.preventDefault();
    e.shiftKey ? redo() : undo();
    return;
  }
  if (KEYS[k]){
    const btn = document.querySelector('#tools button[data-tool="' + KEYS[k] + '"]');
    if (btn) btn.click();
  }
});

/* ---------- export (plain browser download, works on any static host) ---------- */
function flatten(){
  const out = document.createElement('canvas');
  out.width = base.width; out.height = base.height;
  const o = out.getContext('2d');
  o.fillStyle = paper;
  o.fillRect(0, 0, out.width, out.height);
  o.drawImage(base, 0, 0);
  return out;
}

document.getElementById('save').addEventListener('click', () => {
  flatten().toBlob((blob) => {
    if (!blob) { toast('Could not render the image.'); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sketch-' + Date.now() + '.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Saved.');
  }, 'image/png');
});

/* ---------- go ---------- */
resize();
stage.style.background = paper;
refreshHistoryButtons();
})();
