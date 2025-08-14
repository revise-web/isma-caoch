// ===== Data & Storage =====
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
    try {
      const data = JSON.parse(localStorage.getItem('mc.data'));
      if (data) return data;
    } catch {}
    return {
      plan: DEFAULT_PLAN,
      progress: {}, // key: yyyy-mm-dd -> { "exoName": completedSets, ... }
      stats: { sessionsDone: 0, streak: 0, lastDone: null },
      settings: { reminder: "18:00" }
    };
  },
  save(data) { localStorage.setItem('mc.data', JSON.stringify(data)); },
  export() { return JSON.stringify(appData, null, 2); },
  import(json) { appData = JSON.parse(json); store.save(appData); renderAll(); }
};

let appData = store.load();

// ===== Utils =====
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const weekday = d => ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"][d];
const todayKey = () => new Date().toISOString().slice(0,10);

// ===== Tabs =====
$$('.tabs button').forEach(btn=>btn.addEventListener('click', e=>{
  $$('.tabs button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const tab = btn.dataset.tab;
  $$('.tab').forEach(s=>s.classList.remove('active'));
  document.getElementById(tab).classList.add('active');
}));

// ===== Today view =====
function getTodayPlan() {
  const wd = new Date().getDay(); // 0=Dim
  return appData.plan.find(p=>p.day===wd);
}

function renderToday() {
  const today = getTodayPlan();
  const list = $('#todayList'); list.innerHTML = '';
  $('#todayTitle').textContent = `Séance du ${weekday(new Date().getDay())}`;
  $('#todaySummary').textContent = today ? today.title : 'Repos';

  const prog = appData.progress[todayKey()] || {};
  if (today) {
    today.items.forEach(exo => {
      const done = prog[exo.name] || 0;
      const li = document.createElement('li');
      const left = document.createElement('div');
      left.innerHTML = `<div class="checkbox"><input type="checkbox" ${done>=exo.sets?'checked':''} disabled><strong>${exo.name}</strong></div>
      <div class="muted small">${exo.sets} séries • ${exo.reps} • repos ${exo.rest}s</div>`;
      const right = document.createElement('div');
      const dec = document.createElement('button'); dec.className='btn small'; dec.textContent='-';
      const counter = document.createElement('span'); counter.textContent = `${done}/${exo.sets}`; counter.style.margin='0 6px';
      const inc = document.createElement('button'); inc.className='btn small'; inc.textContent='+';
      dec.onclick = ()=>updateSet(exo.name, -1);
      inc.onclick = ()=>{ updateSet(exo.name, +1); if (exo.rest>0) startRest(exo.rest); };
      right.append(dec, counter, inc);
      li.append(left, right);
      list.append(li);
    });
  } else {
    list.innerHTML = '<li>Aucune séance prévue.</li>';
  }
}

function updateSet(exoName, delta) {
  const key = todayKey();
  const today = getTodayPlan();
  if (!today) return;
  const exo = today.items.find(i=>i.name===exoName);
  appData.progress[key] = appData.progress[key] || {};
  const current = appData.progress[key][exoName] || 0;
  const next = Math.max(0, Math.min(exo.sets, current + delta));
  appData.progress[key][exoName] = next;
  store.save(appData);
  renderToday();
}

$('#resetToday').onclick = ()=>{ appData.progress[todayKey()] = {}; store.save(appData); renderToday(); };
$('#markDone').onclick = ()=>{
  // if all sets completed
  const today = getTodayPlan(); if (!today) return;
  const prog = appData.progress[todayKey()] || {};
  const allDone = today.items.every(x => (prog[x.name]||0) >= x.sets);
  if (allDone) {
    const d = new Date();
    const last = appData.stats.lastDone ? new Date(appData.stats.lastDone) : null;
    const diffDays = last ? Math.floor((d.setHours(0,0,0,0) - last.setHours(0,0,0,0))/(1000*60*60*24)) : null;
    appData.stats.streak = diffDays === 1 ? appData.stats.streak + 1 : (diffDays === 0 ? appData.stats.streak : 1);
    appData.stats.sessionsDone += 1;
    appData.stats.lastDone = new Date().toISOString();
    store.save(appData);
    renderStats();
    notify('Séance terminée', 'Bien joué !');
  } else {
    notify('Pas encore fini', 'Complète toutes les séries avant de valider.');
  }
};

// ===== Plan view =====
function renderPlan() {
  const cont = $('#planContainer'); cont.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'list';
  appData.plan.sort((a,b)=>a.day-b.day).forEach(day=>{
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.innerHTML = `<strong>${weekday(day.day)}</strong><div class="muted small">${day.title}</div>`;
    const right = document.createElement('div');
    const btn = document.createElement('button'); btn.className='btn small'; btn.textContent='Voir';
    btn.onclick = ()=>{
      alert(day.items.map(i=>`• ${i.name} — ${i.sets}x ${i.reps} (repos ${i.rest}s)`).join('\n'));
    };
    right.append(btn);
    li.append(left,right);
    grid.append(li);
  });
  cont.append(grid);
}

// ===== Stats view =====
function renderStats() {
  $('#sessionsDone').textContent = appData.stats.sessionsDone;
  $('#streakDays').textContent = appData.stats.streak;
  const hist = $('#historyList'); hist.innerHTML='';
  // Build basic history from progress keys
  Object.keys(appData.progress).sort().reverse().forEach(date=>{
    const totalSets = Object.values(appData.progress[date]).reduce((a,b)=>a+b,0);
    const li = document.createElement('li');
    li.textContent = `${date} — ${totalSets} séries réalisées`;
    hist.append(li);
  });
}

// ===== Stopwatch & Rest =====
let swInterval=null, swStartT=null, swElapsed=0;
function updateStopwatch(){ const t = Date.now() - swStartT + swElapsed; const m=Math.floor(t/60000), s=Math.floor((t%60000)/1000), d=Math.floor((t%1000)/100); $('#stopwatch').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${d}`; }
$('#swStart').onclick=()=>{ if(swInterval) return; swStartT=Date.now(); swInterval=setInterval(updateStopwatch,100); };
$('#swPause').onclick=()=>{ if(!swInterval) return; swElapsed += Date.now()-swStartT; clearInterval(swInterval); swInterval=null; };
$('#swReset').onclick=()=>{ swElapsed=0; swStartT=Date.now(); updateStopwatch(); };
let restInterval=null, restLeft=0;
function startRest(s){ clearInterval(restInterval); restLeft = s; $('#restCountdown').textContent = `Repos: ${restLeft}s`; restInterval=setInterval(()=>{ if(restLeft>0){restLeft--; $('#restCountdown').textContent=`Repos: ${restLeft}s`;} else { clearInterval(restInterval); notify('Repos terminé','Reprends la série !'); } },1000); }
$$('#timer .card [data-rest]').forEach(b=>b.addEventListener('click', ()=>startRest(parseInt(b.dataset.rest,10))));

// ===== Notifications & reminder =====
async function askPermission(){ try{ const res = await Notification.requestPermission(); alert(res==='granted'?'Notifications autorisées':'Notifications refusées'); } catch(e){ alert('Notifications non supportées'); } }
function notify(title, body){ if(Notification.permission==='granted'){ navigator.serviceWorker?.ready.then(r=>{ r.showNotification(title, { body }); }); } }
$('#askNotify').onclick = askPermission;
$('#testNotify').onclick = ()=> notify('Test', 'Ça marche !');

// simple local reminder check (fires when app est ouverte en arrière-plan)
function scheduleChecker(){
  const t = appData.settings.reminder || '18:00';
  const [h,m]=t.split(':').map(x=>parseInt(x,10));
  setInterval(()=>{
    const d=new Date();
    if(d.getHours()===h && d.getMinutes()===m && d.getSeconds()<5){
      notify('Séance du jour', 'C’est l’heure de t’entraîner 💪');
    }
  }, 3000);
}
$('#reminderTime').value = appData.settings.reminder || '18:00';
$('#reminderTime').addEventListener('change', e=>{ appData.settings.reminder = e.target.value; store.save(appData); });

// ===== Backup / restore / reset =====
$('#backupBtn').onclick = ()=>{
  const blob = new Blob([store.export()], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='muscu_backup.json'; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 500);
};
$('#restoreBtn').onclick = ()=> $('#restoreInput').click();
$('#restoreInput').addEventListener('change', async (e)=>{
  const file = e.target.files[0]; if(!file) return;
  const text = await file.text();
  store.import(text);
});

$('#resetAll').onclick = ()=>{
  if(confirm('Tout réinitialiser ?')){ localStorage.removeItem('mc.data'); appData = store.load(); renderAll(); }
};

// ===== Install prompt for Android/desktop (iOS uses Share > Add to Home) =====
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt = e; $('#installBtn').hidden=false; });
$('#installBtn').onclick=async()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; $('#installBtn').hidden=true; };

// ===== Service worker =====
if ('serviceWorker' in navigator) { navigator.serviceWorker.register('service-worker.js'); }

// ===== Render all =====
function renderAll(){ renderToday(); renderPlan(); renderStats(); }
renderAll(); scheduleChecker();
