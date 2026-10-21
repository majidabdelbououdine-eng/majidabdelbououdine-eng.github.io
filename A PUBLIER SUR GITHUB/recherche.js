/* Naruto card and card · barre « Carte » sous les rubriques (toutes les pages).
   Les cartes viennent de data/cartes.csv (à modifier à la main, voir data/COMMENT-AJOUTER-UNE-CARTE.txt). */
(function(){
"use strict";
var me=document.currentScript,pre=(me&&me.getAttribute('src')||'').replace(/recherche\.js.*$/,'');
var lang=window.NC_LANG||document.documentElement.lang||'fr';
var TX={fr:{l:'Carte',ph:'Rechercher une carte… (nom, numéro, version)',all:'Tous',fr:'France',us:'États-Unis',jp:'Japon',none:'Aucune carte trouvée',go:'Voir les ventes'},
        en:{l:'Card',ph:'Search for a card… (name, number, version)',all:'All',fr:'France',us:'United States',jp:'Japan',none:'No card found',go:'See sales'},
        ja:{l:'カード',ph:'カードを検索…（名前・番号・バージョン）',all:'すべて',fr:'フランス',us:'アメリカ',jp:'日本',none:'カードが見つかりません',go:'取引を見る'}}[lang]||null;
if(!TX)TX={l:'Carte'};
var PK=[['','all'],['France','fr'],['États-Unis','us'],['Japon','jp']];
var css='.cbar{background:#0B2230;border-top:1px solid rgba(255,255,255,.14)}'+
'.cbar .cin{max-width:1200px;margin:0 auto;padding:9px 24px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-family:Outfit,"Noto Sans JP",system-ui,sans-serif}'+
'.cbar label{font-family:"Playfair Display",Georgia,serif;font-weight:700;font-size:17px;color:#fff;white-space:nowrap}'+
'.cbar label::after{content:" :";color:#FC4C4D}'+
'.cbar .cbox{position:relative;flex:1 1 260px;max-width:520px}'+
'.cbar input{width:100%;box-sizing:border-box;font:inherit;font-size:15px;padding:7px 14px;border-radius:29px;border:1px solid rgba(255,255,255,.35);background:#fff;color:#0B2230;outline:none}'+
'.cbar input:focus{border-color:#FC4C4D;box-shadow:0 0 0 2px rgba(252,76,77,.35)}'+
'.cbar .cpays{display:flex;gap:4px;flex-wrap:wrap}'+
'.cbar .cpays button{font:inherit;font-size:13px;color:#fff;background:transparent;border:1px solid rgba(255,255,255,.35);border-radius:29px;padding:4px 11px;cursor:pointer}'+
'.cbar .cpays button.on{background:#FC4C4D;border-color:#FC4C4D}'+
'.cbar ul{position:absolute;left:0;right:0;top:calc(100% + 4px);list-style:none;margin:0;padding:4px 0;background:#fff;border:1px solid #d6e0e6;border-radius:10px;box-shadow:0 10px 30px rgba(11,34,48,.25);max-height:340px;overflow:auto;z-index:60;display:none}'+
'.cbar ul.open{display:block}'+
'.cbar li{display:flex;gap:10px;align-items:center;padding:7px 12px;cursor:pointer;color:#0B2230;font-size:14px}'+
'.cbar li:hover,.cbar li.sel{background:#ffebea}'+
'.cbar li img{width:30px;height:42px;object-fit:cover;border-radius:3px;background:#f2f7fa}'+
'.cbar li .ph{width:30px;height:42px;border-radius:3px;background:#f2f7fa;display:inline-block}'+
'.cbar li b{font-weight:600}.cbar li small{color:#4d6f80;display:block}.cbar li .pp{margin-left:auto;font-size:12px;color:#FC4C4D;white-space:nowrap}'+
'.cbar li.vide{cursor:default;color:#4d6f80}'+
'@media (max-width:600px){.cbar .cin{padding:8px 14px}.cbar .cbox{flex-basis:100%;max-width:none}}';
function parseCSV(t){var r=[],row=[],f='',q=false;t=t.replace(/^\uFEFF/,'');
  for(var i=0;i<t.length;i++){var c=t[i];
    if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}
    else if(c==='"')q=true;else if(c===','||c===';'){row.push(f);f=''}
    else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;row.push(f);f='';if(row.join('').trim())r.push(row);row=[]}
    else f+=c}
  row.push(f);if(row.join('').trim())r.push(row);
  if(!r.length)return [];var h=r[0].map(function(s){return s.trim().toLowerCase()});
  return r.slice(1).map(function(a){var o={};h.forEach(function(k,i){o[k]=(a[i]||'').trim()});return o}).filter(function(o){return o.nom||o.numero})}
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[-\s]+/g,' ').trim()}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function normPays(p){var n=norm(p);if(n.indexOf('fr')===0)return 'France';if(n.indexOf('etat')===0||n==='usa'||n==='us')return 'États-Unis';if(n.indexOf('jap')===0||n==='jp')return 'Japon';return p}
var CARTES=[],pays=(location.search.match(/[?&]pays=([^&#]*)/)||[])[1];pays=pays?decodeURIComponent(pays):'';
function build(){
  var header=document.querySelector('header');if(!header||document.querySelector('.cbar'))return;
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  var bar=document.createElement('div');bar.className='cbar';
  bar.innerHTML='<div class="cin"><label for="cbar-q">'+esc(TX.l)+'</label><div class="cbox"><input id="cbar-q" type="search" autocomplete="off" placeholder="'+esc(TX.ph)+'"><ul role="listbox"></ul></div><div class="cpays">'+
    PK.map(function(p){return '<button type="button" data-p="'+esc(p[0])+'"'+(p[0]===pays?' class="on"':'')+'>'+esc(TX[p[1]])+'</button>'}).join('')+'</div></div>';
  header.appendChild(bar);
  var inp=bar.querySelector('input'),ul=bar.querySelector('ul'),sel=-1,list=[];
  var q0=(location.search.match(/[?&]carte=([^&#]*)/)||[])[1];if(q0)inp.value=decodeURIComponent(q0.replace(/\+/g,' '));
  function go(c){var q=c.numero+' '+c.version,p=c.pays;
    var anc={'France':'#pays-fr','États-Unis':'#pays-us','Japon':'#pays-jp'}[p]||'';
    location.href=pre+'resultats.html?q='+encodeURIComponent(q.trim())+'&carte='+encodeURIComponent((c.nom+' '+c.version).trim())+(p?'&pays='+encodeURIComponent(p):'')+(window.NC_LANG&&window.NC_LANG!=='fr'?'&lang='+window.NC_LANG:'')+anc}
  function show(){var ws=norm(inp.value).split(' ').filter(Boolean);
    list=CARTES.filter(function(c){if(pays&&c.pays!==pays)return false;var h=norm(c.pays+' '+c.numero+' '+c.nom+' '+c.version);return ws.every(function(w){return h.indexOf(w)>=0})});
    if(!ws.length&&document.activeElement!==inp){ul.classList.remove('open');return}
    sel=-1;
    ul.innerHTML=list.length?list.slice(0,30).map(function(c,i){return '<li data-i="'+i+'">'+(c.image?'<img src="'+esc(/^https?:/.test(c.image)?c.image:pre+c.image)+'" alt="" loading="lazy" referrerpolicy="no-referrer">':'<span class="ph"></span>')+'<span><b translate="no">'+esc(c.nom)+' '+esc(c.numero)+'</b><small translate="no">'+esc(c.version)+'</small></span><span class="pp">'+esc(TX[{'France':'fr','États-Unis':'us','Japon':'jp'}[c.pays]]||c.pays)+'</span></li>'}).join(''):'<li class="vide">'+esc(TX.none)+'</li>';
    ul.classList.add('open')}
  function hl(){[].forEach.call(ul.children,function(li,i){li.classList.toggle('sel',i===sel)})}
  inp.addEventListener('input',show);inp.addEventListener('focus',show);
  inp.addEventListener('keydown',function(e){var n=Math.min(list.length,30);
    if(e.key==='ArrowDown'){sel=Math.min(n-1,sel+1);hl();e.preventDefault()}
    else if(e.key==='ArrowUp'){sel=Math.max(0,sel-1);hl();e.preventDefault()}
    else if(e.key==='Enter'){if(list.length)go(list[sel<0?0:sel])}
    else if(e.key==='Escape')ul.classList.remove('open')});
  ul.addEventListener('mousedown',function(e){var li=e.target.closest('li[data-i]');if(li){e.preventDefault();go(list[+li.getAttribute('data-i')])}});
  inp.addEventListener('blur',function(){setTimeout(function(){ul.classList.remove('open')},150)});
  bar.querySelector('.cpays').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
    pays=b.getAttribute('data-p');[].forEach.call(this.children,function(x){x.classList.toggle('on',x===b)});
    filtrePays();if(inp.value.trim()||document.activeElement===inp)show()});
  fetch(pre+'data/cartes.csv',{cache:'no-cache'}).then(function(r){return r.text()}).then(function(t){
    CARTES=parseCSV(t).map(function(c){c.pays=normPays(c.pays);return c})}).catch(function(){});
}
// resultats.html : n'affiche que le pays choisi
function filtrePays(){var box=document.getElementById('pays');if(!box||!document.getElementById('f-q'))return;
  var id={'France':'pays-fr','États-Unis':'pays-us','Japon':'pays-jp'}[pays];
  [].forEach.call(box.querySelectorAll('section.pays'),function(s){s.style.display=(!id||s.id===id)?'':'none'})}
function initRes(){var box=document.getElementById('pays');if(!box||!document.getElementById('f-q'))return;
  filtrePays();new MutationObserver(filtrePays).observe(box,{childList:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){build();initRes()});else{build();initRes()}
})();
