const $ = (s) => document.querySelector(s);
const img = (index) => `assets/img-${String(index).padStart(2,'0')}.webp`;
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const data = window.MURIM;

const menuButton = $('.menu-toggle');
const menu = $('#mobile-menu');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.hidden = !open;
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu.hidden = true;
  menuButton.setAttribute('aria-expanded','false');
  menuButton.setAttribute('aria-label','Open menu');
}));

$('#gods-grid').innerHTML = data.gods.map((g,i) => `<article class="god-card"><img src="${img(g.image)}" alt="Portrait of ${esc(g.name)}" loading="lazy"><div class="god-content"><span class="god-tag">0${i+1} / ${esc(g.title)}</span><h3>${esc(g.name)}</h3><p>${esc(g.line)}</p></div></article>`).join('');

const realmList = $('#realm-list');
const realmDisplay = $('#realm-display');
realmList.innerHTML = data.realms.map((r,i) => `<button class="realm-item${i===0?' active':''}" data-realm="${i}" role="listitem" aria-pressed="${i===0}"><span>${String(i+1).padStart(2,'0')}</span><strong>${esc(r[0])}</strong></button>`).join('');
function showRealm(index){
  const [name,description] = data.realms[index];
  realmDisplay.innerHTML = `<span class="realm-number">${String(index+1).padStart(2,'0')}</span><h3>${esc(name)}</h3><p>${esc(description)}</p><small>Early · Middle · Late</small>`;
  realmList.querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-pressed',String(i===index));});
}
realmList.addEventListener('click', e=>{const b=e.target.closest('button[data-realm]');if(b)showRealm(Number(b.dataset.realm));});
showRealm(0);

$('#faction-grid').innerHTML = data.factions.map((f,i)=>`<button class="faction-card" data-faction="${esc(f[0])}" aria-label="View ${esc(f[0])} characters"><span class="faction-index">${String(i+1).padStart(2,'0')}</span><h3>${esc(f[0])}</h3><p>${esc(f[1])}</p><span class="faction-open" aria-hidden="true">↗</span></button>`).join('');
$('#faction-grid').addEventListener('click',e=>{
  const card=e.target.closest('[data-faction]');
  if(!card)return;
  $('#faction-filter').value=card.dataset.faction;
  $('#character-search').value='';
  renderCharacters();
  $('#characters').scrollIntoView({behavior:'smooth'});
});

const factions = [...new Set(data.characters.map(c=>c[1]))];
$('#faction-filter').innerHTML += factions.map(f=>`<option value="${esc(f)}">${esc(f)}</option>`).join('');
const grid = $('#character-grid');
function renderCharacters(){
  const term = $('#character-search').value.trim().toLocaleLowerCase();
  const faction = $('#faction-filter').value;
  const matches = data.characters.filter(c => (faction==='all'||c[1]===faction) && (!term || [c[0],c[1],c[2],c[4]].some(v=>v.toLocaleLowerCase().includes(term))));
  grid.innerHTML = matches.map(c=>`<button class="character-card" data-image="${c[3]}" data-title="${esc(c[0])}" data-subtitle="${esc(c[1])}" aria-label="View portrait of ${esc(c[0])}"><img src="${img(c[3])}" alt="" loading="lazy"><div class="character-content"><small>${esc(c[1])}</small><h3>${esc(c[0])}</h3><p>${esc(c[2])}</p></div></button>`).join('');
  $('#result-count').textContent = `${matches.length} ${matches.length===1?'character':'characters'}`;
  $('#character-empty').hidden = !!matches.length;
}
$('#character-search').addEventListener('input',renderCharacters);
$('#faction-filter').addEventListener('change',renderCharacters);
renderCharacters();

$('#places-grid').innerHTML = data.places.map(p=>`<button class="place-card" data-image="${p[2]}" data-title="${esc(p[0])}" data-subtitle="${esc(p[1])}" aria-label="View ${esc(p[0])}"><img src="${img(p[2])}" alt="" loading="lazy"><div class="place-info"><small>${esc(p[3])}</small><h3>${esc(p[0])}</h3><p>${esc(p[1])}</p></div></button>`).join('');
$('#moments-grid').innerHTML = data.moments.map(m=>`<button class="moment-card" data-image="${m[1]}" data-title="${esc(m[0])}" data-subtitle="MURIM WORLD ARTBOOK" aria-label="View ${esc(m[0])}"><img src="${img(m[1])}" alt="" loading="lazy"><span>${esc(m[0])}</span></button>`).join('');

const dialog = $('#image-dialog');
document.addEventListener('click', e=>{
  const card=e.target.closest('[data-image]');
  if(!card)return;
  $('#dialog-image').src=img(Number(card.dataset.image));
  $('#dialog-image').alt=card.dataset.title;
  $('#dialog-title').textContent=card.dataset.title;
  $('#dialog-subtitle').textContent=card.dataset.subtitle||'';
  dialog.showModal();
});
$('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});

const characterTemplate = `⚔️ MURIM WORLD — CHARACTER NOTES\n👤 Name & appearance: \n📜 Background: \n✨ Realm & stage: \n⚔️ Abilities: \n🏯 Affiliation: \n🎒 Starting possessions: \n🎯 Goal: \n📍 Starting location: `;
$('#copy-template').addEventListener('click',async()=>{
  try { await navigator.clipboard.writeText(characterTemplate); $('#copy-feedback').textContent='Copied — paste into User Notes.'; }
  catch { $('#copy-feedback').textContent='Clipboard unavailable. Select the character fields above to make your own notes.'; }
});

const audio=$('#soundtrack'),toggle=$('#audio-toggle'),icon=$('#audio-icon'),progress=$('#progress-track'),fill=$('#progress-fill'),time=$('#audio-time');
const formatTime=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
function updateAudio(){
  const pct=audio.duration ? Math.min(100,100*audio.currentTime/audio.duration) : 0;
  fill.style.width=`${pct}%`;progress.setAttribute('aria-valuenow',String(Math.round(pct)));
  time.textContent=formatTime(audio.currentTime||0);
  icon.textContent=audio.paused?'▶':'Ⅱ';toggle.setAttribute('aria-label',`${audio.paused?'Play':'Pause'} Beneath the Murim Sky`);
}
toggle.addEventListener('click',async()=>{if(audio.paused){try{await audio.play();}catch{$('#copy-feedback').textContent='Audio could not play.';}}else audio.pause();updateAudio();});
audio.addEventListener('timeupdate',updateAudio);audio.addEventListener('play',updateAudio);audio.addEventListener('pause',updateAudio);
audio.addEventListener('error',()=>{toggle.disabled=true;toggle.title='Soundtrack unavailable';time.textContent='Unavailable';});
function seek(pct){if(audio.duration)audio.currentTime=Math.max(0,Math.min(1,pct))*audio.duration;}
progress.addEventListener('click',e=>seek((e.clientX-progress.getBoundingClientRect().left)/progress.clientWidth));
progress.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();seek((audio.currentTime+(e.key==='ArrowRight'?5:-5))/audio.duration);}});
