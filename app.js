/* =========================
   IsmaCoach v2 – App logic
   ========================= */

// ---- THEME (auto sombre le soir) ----
const THEME = { autoDarkFromHour: 19, autoLightFromHour: 7 };
(function applyTheme() {
  const h = new Date().getHours();
  const night = h >= THEME.autoDarkFromHour || h < THEME.autoLightFromHour;
  document.documentElement.classList.toggle('light', !night);
})();
document.getElementById('toggleTheme')?.addEventListener('click', () => {
  document.documentElement.classList.toggle('light');
});

// ---- DATA MODEL ----
const DEFAULT_PLAN = [
  // 0=Dim, 1=Lun, ... 6=Sam
  { day: 1, title: "Haut du corps (Push)", items: [
    {name:"Échauffement corde", sets:1, reps:"3 min", rest:0},
    {name:"Pompes classiques", sets:4, reps:"12–15", rest:45},
    {name:"Dips sur chaise", sets:4, reps:"8–12", rest:45},
    {name:"Développé au sol haltères 3kg", sets:4, reps:"12", rest:45},
    {name:"Élévations latérales 3kg", sets:4, reps:"12–15", rest:45},
    {name:"Gainage", sets:1, reps:"60s", rest:0}
  ]},
  { day: 2, title: "Bas du corps + corde", items: [
    {name:"Échauffement corde", sets:1, reps:"3 min", rest:0},
    {name:"Squats poids du corps", sets:4, reps:"12–15", rest:60},
    {name:"Fentes alternées", sets:4, reps:"10–12/jambe", rest:60},
    {name:"Hip bridge", sets:3, reps:"12–15", rest:45},
    {name:"Corde à sauter (intervalles)", sets:3, reps:"45s on / 45s off", rest:0}
  ]},
  { day: 3, title: "Haut du corps (Pull) + abdos", items: [
    {name:"Rowing haltères 3kg", sets:4, reps:"12–15", rest:45},
    {name:"Curl biceps 3kg", sets:4, reps:"10–12", rest:45},
    {name:"Extension triceps", sets:3, reps:"10–12", rest:45},
    {name:"Gainage", sets:1, reps:"60s", rest:30},
    {name:"Crunchs", sets:3, reps:"15–20", rest:30},
    {name:"Relevés de jambes", sets:3, reps:"10–12", rest:30}
  ]},
  { day: 4, title: "Cardio léger + mobilité", items: [
    {name:"Corde facile", sets:8, reps:"30s on / 30s off", rest:0},
    {name:"Jumping jacks", sets:3, reps:"30–40", rest:30},
    {name:"Mobility bas du corps", sets:1, reps:"10 min", rest:0}
  ]},
  { day: 5, title: "Haut du corps (Full)", items: [
    {name:"Pompes déclinées", sets:4, reps:"8–12", rest:60},
    {name:"Rowing 3kg", sets:4, reps:"12–15", rest:45},
    {name:"Curl + Triceps (superset)", sets:3, reps:"10–12", rest:60},
    {name:"Élévations frontales 3kg", sets:3, reps:"12–15", rest:45}
  ]},
  { day: 6, title: "Bas du corps + abdos", items: [
    {name:"Squats", sets:4, reps:"12–15", rest:60},
    {name:"Fentes sautées (si ok)", sets:3, reps:"8–10/jambe", rest:60},
    {name:"Mollets debout", sets:3, reps:"15–20", rest:45},
    {name:"Circuit abdos", sets:3, reps:"1’/30s/15–20", rest:30}
  ]},
  { day: 0, title: "Repos actif", items: [
    {name:"Marche rapide", sets:1, reps:"20–30 min", rest:0},
    {name:"Étirements légers", sets:1, reps:"10 min", rest:0}
  ]}
];

const store = {
  load() {
    try { const d = JSON.parse(localStorage.getItem('ic.data')); if (d) return d; } catch {}
    return {
      plan: DEFAULT_PLAN,
      progress: {}, // 'yyyy-mm-dd': { exoName: completedSets }
      stats: { sessionsDone: 0, streak: 0, lastDone: null },
      settings: { reminder: "18:00", weeklyGoal: 5 }
    };
  },
  save(data) { localStorage.setItem('ic.data', JSON.stringify(data)); },
  export() { return JSON.stringify(appData, null, 2); },
  import(json) { appData = JSON.parse(json); store.save(appData); renderAll(); },
};

let appData = store.load();

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const weekdayName = i => ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"][i];
const fullWeekday = i => ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"][i];
const todayISO = () => new Date().toISOString().slice(0, 10);

// ---- TABS ----
$$('.tabs .tab').forEach(b => b.addEventListener('click', () => {
  $$('.tabs .tab').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  $$('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById(b.dataset.tab).classList.add('active');
}));

// ---- TODAY ----
function getPlanByWeekday(idx) {
  return appData.plan.find(p => p.day === idx);
}
function getTodayPlan() {
  return getPlanByWeekday(new Date().getDay());
}

function renderToday() {
  const plan = getTodayPlan();
  const wd = new Date().getDay();
  $('#todayTitle').textContent = `Séance du ${fullWeekday(wd)}`;
  $('#todaySubtitle').textContent = plan ? plan.title : 'Repos';

  const ul = $('#todayList'); ul.innerHTML = '';
  let totalSets = 0, doneSets = 0;
  const key = todayISO();
  const prog = appData.progress[key] || {};

  if (plan) {
    plan.items.forEach(exo => {
      totalSets += exo.sets;
      const done = prog[exo.name] || 0;
      doneSets += done;

      const li = document.createElement('li');
      const left = document.createElement('div');
      left.innerHTML = `<strong>${exo.name}</strong><div class="sub">${exo.sets} séries • ${exo.reps} • repos ${exo.rest}s</div>`;
      const right = document.createElement('div');
      const dec = document.createElement('button'); dec.className='btn small ghost'; dec.textContent='-';
      const c = document.createElement('span'); c.style.margin='0 8px'; c.textContent = `${done}/${exo.sets}`;
      const inc = document.createElement('button'); inc.className='btn small'; inc.textContent='+';

      dec.onclick = () => updateSet(exo.name, -1);
      inc.onclick = () => { updateSet(exo.name, +1); if (exo.rest>0) startRest(exo.rest); };

      right.append(dec,c,inc);
      li.append(left,right);
      ul.append(li);
    });
  } else {
    ul.innerHTML = '<li>Repos aujourd’hui. Marche, mobilité, hydratation 💧</li>';
  }

  const pct = totalSets ? Math.round(doneSets*100/totalSets) : 100;
  $('#todayProgress').style.width = pct + '%';
  $('#todayPct').textContent = pct + '%';
}
function updateSet(exoName, delta) {
  const plan = getTodayPlan(); if (!plan) return;
  const key = todayISO();
  appData.progress[key] = appData.progress[key] || {};
  const exo = plan.items.find(i => i.name === exoName);
  const cur = appData.progress[key][exoName] || 0;
  const next = Math.max(0, Math.min(exo.sets, cur + delta));
  appData.progress[key][exoName] = next;
  store.save(appData);
  renderToday();
}
$('#resetToday').addEventListener('click', () => {
  appData.progress[todayISO()] = {};
  store.save(appData);
  renderToday();
});
$('#markDone').addEventListener('click', () => {
  const plan = getTodayPlan(); if (!plan) return;
  const key = todayISO();
  const prog = appData.progress[key] || {};
  const all = plan.items.every(x => (prog[x.name] || 0) >= x.sets);
  if (!all) { notify('Pas encore fini', 'Complète toutes les séries.'); return; }

  const now = new Date();
  const last = appData.stats.lastDone ? new Date(appData.stats.lastDone) : null;
  const diffDays = last ? Math.floor((now.setHours(0,0,0,0) - last.setHours(0,0,0,0)) / 86400000) : null;
  appData.stats.streak = diffDays === 1 ? appData.stats.streak + 1 : (diffDays === 0 ? appData.stats.streak : 1);
  appData.stats.sessionsDone += 1;
  appData.stats.lastDone = new Date().toISOString();
  store.save(appData);
  renderStats();
  notify('Séance terminée', 'Bien joué 💥');
});

// ---- CALENDAR + EDITOR ----
let selectedDay = new Date().getDay(); // 0..6
function renderDayPicker() {
  const dp = $('#dayPicker'); dp.innerHTML = '';
  for (let i=0;i<7;i++){
    const btn = document.createElement('button');
    btn.textContent = weekdayName(i);
    btn.className = i===selectedDay ? 'active' : '';
    btn.addEventListener('click', ()=>{ selectedDay = i; renderCalendarList(); renderDayPicker(); });
    dp.append(btn);
  }
}
function renderCalendarList() {
  const plan = getPlanByWeekday(selectedDay);
  const ul = $('#dayPlanList'); ul.innerHTML='';
  const title = plan ? plan.title : 'Repos';
  const head = document.createElement('li');
  head.innerHTML = `<div><strong>${fullWeekday(selectedDay)}</strong><div class="sub">${title}</div></div>`;
  ul.append(head);

  if (!plan) return;

  plan.items.forEach((exo, idx) => {
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.innerHTML = `<strong>${exo.name}</strong><div class="sub">${exo.sets} séries • ${exo.reps} • repos ${exo.rest}s</div>`;
    const right = document.createElement('div');
    const edit = document.createElement('button'); edit.className='btn small'; edit.textContent='✏️';
    const del = document.createElement('button'); del.className='btn small ghost'; del.textContent='🗑️';
    edit.onclick = ()=> openModal(exo, idx);
    del.onclick = ()=> { if (confirm('Supprimer cet exercice ?')) { plan.items.splice(idx,1); store.save(appData); renderCalendarList(); if (selectedDay===new Date().getDay()) renderToday(); } };
    right.append(edit, del);
    li.append(left,right);
    ul.append(li);
  });
}
$('#addExerciseBtn').addEventListener('click', ()=> openModal());
$('#resetSelectedDay').addEventListener('click', ()=>{
  if (selectedDay === new Date().getDay()) {
    // reset progress for today only
    appData.progress[todayISO()] = {};
  }
  // reset plan of the selected day to default
  const def = DEFAULT_PLAN.find(p=>p.day===selectedDay);
  const idx = appData.plan.findIndex(p=>p.day===selectedDay);
  if (def) {
    if (idx>=0) appData.plan[idx] = JSON.parse(JSON.stringify(def));
    else appData.plan.push(JSON.parse(JSON.stringify(def)));
  } else {
    if (idx>=0) appData.plan.splice(idx,1);
  }
  store.save(appData);
  renderCalendarList();
  if (selectedDay === new Date().getDay()) renderToday();
});

const modal = $('#exerciseModal');
const exoName = $('#exoName'), exoSets = $('#exoSets'), exoReps = $('#exoReps'), exoRest = $('#exoRest');
let editIndex = null;
function openModal(exo=null, index=null){
  $('#modalTitle').textContent = exo ? 'Modifier exercice' : 'Nouvel exercice';
  exoName.value = exo?.name || '';
  exoSets.value = exo?.sets ?? 3;
  exoReps.value = exo?.reps || '';
  exoRest.value = exo?.rest ?? 45;
  editIndex = index;
  modal.showModal();
}
$('#saveExercise').addEventListener('click', (e)=>{
  e.preventDefault();
  const plan = getPlanByWeekday(selectedDay);
  if (!plan) {
    // créer un nouveau jour si c'était vide
    appData.plan.push({ day: selectedDay, title: "Personnalisé", items: [] });
  }
  const target = getPlanByWeekday(selectedDay);
  const newExo = { name: exoName.value.trim(), sets: Math.max(1, parseInt(exoSets.value||'1',10)), reps: exoReps.value.trim(), rest: Math.max(0, parseInt(exoRest.value||'0',10)) };
  if (!newExo.name) return;
  if (editIndex==null) target.items.push(newExo);
  else target.items[editIndex] = newExo;

  store.save(appData);
  modal.close();
  renderCalendarList();
  if (selectedDay === new Date().getDay()) renderToday();
});

// ---- STATS ----
function renderStats() {
  $('#kpiSessions').textContent = appData.stats.sessionsDone;
  $('#kpiStreak').textContent = appData.stats.streak;

  // Objectif hebdo
  const goal = appData.settings.weeklyGoal || 5;
  const doneThisWeek = countSessionsThisWeek();
  const pct = Math.min(100, Math.round(doneThisWeek*100/goal));
  $('#goalFill').style.width = pct + '%';
  $('#goalText').textContent = `${doneThisWeek}/${goal}`;

  // Historique
  const hist = $('#historyList'); hist.innerHTML = '';
  Object.keys(appData.progress).sort().reverse().forEach(date=>{
    const total = Object.values(appData.progress[date]).reduce((a,b)=>a+b,0);
    const li = document.createElement('li'); li.textContent = `${date} — ${total} séries`;
    hist.append(li);
  });

  drawWeeklyChart();
}
function startOfWeek(d=new Date()){ const n=new Date(d); const day=(n.getDay()+6)%7; n.setHours(0,0,0,0); n.setDate(n.getDate()-day); return n; }
function countSessionsThisWeek(){
  const start = startOfWeek().toISOString().slice(0,10);
  return Object.keys(appData.progress).filter(k=>k>=start).length;
}
function drawWeeklyChart(){
  const c = document.getElementById('chartWeekly');
  const ctx = c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);

  // last 7 days bars
  const today = new Date();
  const labels = [];
  const values = [];
  for(let i=6;i>=0;i--){
    const d = new Date(today); d.setDate(d.getDate()-i);
    const key = d.toISOString().slice(0,10);
    const v = appData.progress[key] ? 1 : 0; // 1 si séance faite
    labels.push(weekdayName(d.getDay()));
    values.push(v);
  }

  const w = c.width, h = c.height, pad=20;
  // axes
  ctx.strokeStyle = '#4b5563'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(pad, h-pad); ctx.lineTo(w-pad, h-pad); ctx.stroke();

  const barW = (w-2*pad)/7*0.6;
  values.forEach((v,i)=>{
    const x = pad + (i+0.2)*((w-2*pad)/7);
    const barH = v*(h-2*pad);
    // background bar
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(x, h-pad-(h-2*pad), barW, (h-2*pad));
    // value bar
    const grad = ctx.createLinearGradient(0,0,w,0);
    grad.addColorStop(0, '#fb923c'); grad.addColorStop(1,'#3b82f6');
    ctx.fillStyle = grad;
    ctx.fillRect(x, h-pad-barH, barW, barH);
    // label
    ctx.fillStyle = '#9fb0d6'; ctx.font='12px system-ui';
    ctx.textAlign='center';
    ctx.fillText(labels[i], x+barW/2, h-4);
  });
}

// ---- STOPWATCH ----
let swInterval=null, swStartT=null, swElapsed=0;
function fmtStopwatch(ms){ const m=Math.floor(ms/60000), s=Math.floor((ms%60000)/1000), d=Math.floor((ms%1000)/100); return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${d}`; }
function updateStopwatch(){ const t = Date.now() - swStartT + swElapsed; $('#stopwatch').textContent = fmtStopwatch(t); }
$('#swStart').addEventListener('click', ()=>{ if(swInterval) return; swStartT=Date.now(); swInterval=setInterval(updateStopwatch,100); });
$('#swPause').addEventListener('click', ()=>{ if(!swInterval) return; swElapsed += Date.now()-swStartT; clearInterval(swInterval); swInterval=null; });
$('#swReset').addEventListener('click', ()=>{ swElapsed=0; swStartT=Date.now(); $('#stopwatch').textContent='00:00.0'; });

// ---- REST COUNTDOWN with ring + beep ----
let restTimer=null, restLeft=0, restTotal=0;
function setArcProgress(p){ // p: 0..1
  const CIRC=339.292; const off = CIRC*(1-p);
  $('#restArc').style.strokeDashoffset = off;
}
function beep(){
  try{
    const a = new (window.AudioContext||window.webkitAudioContext)();
    const o = a.createOscillator(); const g = a.createGain();
    o.type='sine'; o.frequency.setValueAtTime(880,a.currentTime);
    g.gain.setValueAtTime(0.0001,a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3,a.currentTime+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,a.currentTime+0.25);
    o.connect(g).connect(a.destination);
    o.start(); o.stop(a.currentTime+0.26);
  } catch(e){}
}
function startRest(s){
  clearInterval(restTimer);
  restLeft = restTotal = s;
  $('#restDisplay').textContent = `${restLeft}s`;
  setArcProgress(0);
  restTimer = setInterval(()=>{
    restLeft--;
    const p = (restTotal-restLeft)/restTotal;
    setArcProgress(p);
    $('#restDisplay').textContent = `${Math.max(0,restLeft)}s`;
    if (restLeft<=0){ clearInterval(restTimer); setArcProgress(1); beep(); notify('Repos terminé','Reprends la série !'); }
  },1000);
}
$$('#timer [data-rest]').forEach(b=> b.addEventListener('click', ()=> startRest(parseInt(b.dataset.rest,10)) ));

// ---- NOTIFICATIONS ----
async function askPermission(){
  try{
    const res = await Notification.requestPermission();
    alert(res==='granted'?'Notifications autorisées':'Notifications refusées');
  } catch { alert('Notifications non supportées'); }
}
function notify(title, body){
  if (Notification?.permission === 'granted') {
    if (navigator.serviceWorker?.ready) {
      navigator.serviceWorker.ready.then(r=> r.showNotification(title,{ body }) );
    }
  }
}
$('#askNotify').addEventListener('click', askPermission);
$('#testNotify').addEventListener('click', ()=> notify('Test', 'Ça marche !'));

function scheduleChecker(){
  const t = appData.settings.reminder || '18:00';
  const [h,m]=t.split(':').map(n=>parseInt(n,10));
  setInterval(()=>{
    const d=new Date();
    if(d.getHours()===h && d.getMinutes()===m && d.getSeconds()<5){
      notify('Séance du jour', 'C’est l’heure de t’entraîner 💪');
    }
  }, 3000);
}
$('#reminderTime').value = appData.settings.reminder || '18:00';
$('#reminderTime').addEventListener('change', e=>{ appData.settings.reminder = e.target.value; store.save(appData); });

// ---- BACKUP / RESTORE / RESET ----
$('#backupBtn').addEventListener('click', ()=>{
  const blob = new Blob([store.export()], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='ismacoach_backup.json'; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 500);
});
$('#restoreBtn').addEventListener('click', ()=> $('#restoreInput').click());
$('#restoreInput').addEventListener('change', async (e)=>{
  const file = e.target.files[0]; if(!file) return;
  const text = await file.text();
  store.import(text);
});
$('#resetAll').addEventListener('click', ()=>{
  if (confirm('Tout réinitialiser ?')) {
    localStorage.removeItem('ic.data'); appData = store.load(); renderAll();
  }
});

// ---- INSTALL PROMPT (Android/desktop) ----
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt=e; $('#installBtn').hidden=false; });
$('#installBtn').addEventListener('click', async ()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; $('#installBtn').hidden=true; });

// ---- SERVICE WORKER ----
if ('serviceWorker' in navigator) { navigator.serviceWorker.register('service-worker.js'); }

// ---- RENDER ----
function renderAll(){ renderToday(); renderDayPicker(); renderCalendarList(); renderStats(); }
renderAll(); scheduleChecker();
