
/* 第零序列 · 阅读设置、书签、阅读进度。仅储存于当前设备浏览器。 */
(() => {
  'use strict';
  const ROOT='/zero-sequence/';
  const LAST='zs:reader:last:v1', OPT='zs:reader:options:v1';
  const path=location.pathname, chapter=/\/chapters\/volume-\d\d\/(?:chapter-\d{3}|prologue)\.html$/.test(path);
  const $=s=>document.querySelector(s);
  const get=k=>{try{return JSON.parse(localStorage.getItem(k)||'null');}catch{return null;}};
  const put=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}};
  const clean=s=>(s||'').replace(/\s+/g,' ').trim();
  const options=Object.assign({font:18,leading:2.25,width:820,theme:'night'},get(OPT)||{});
  function loadCSS(){
    if($('link[data-zs-reader]'))return;
    const l=document.createElement('link');l.rel='stylesheet';l.href=ROOT+'assets/css/reader-experience.css?v=1';l.dataset.zsReader='1';document.head.appendChild(l);
  }
  function apply(){
    options.font=Math.min(24,Math.max(15,Number(options.font)||18));
    options.leading=Math.min(2.7,Math.max(1.7,Number(options.leading)||2.25));
    options.width=Math.min(1000,Math.max(660,Number(options.width)||820));
    if(!['night','paper','light'].includes(options.theme))options.theme='night';
    document.documentElement.style.setProperty('--zs-reader-font',options.font+'px');
    document.documentElement.style.setProperty('--zs-reader-leading',options.leading);
    document.documentElement.style.setProperty('--zs-reader-width',options.width+'px');
    document.body.dataset.zsReaderTheme=options.theme;
    put(OPT,options);
  }
  function addSearchNav(){
    const nav=$('header nav');if(!nav||nav.querySelector('.zs-search-nav'))return;
    const a=document.createElement('a');a.href=ROOT+'search.html';a.textContent='搜索';a.className='zs-search-nav';nav.appendChild(a);
  }
  function addContinue(){
    if(!document.body.classList.contains('home-page'))return;
    const last=get(LAST), hero=$('.hero');
    if(!last||!hero||!last.url||!last.url.startsWith(ROOT+'chapters/'))return;
    const div=document.createElement('section');div.className='zs-continue';div.setAttribute('aria-label','继续阅读');
    const info=document.createElement('div');
    const eyebrow=document.createElement('small');eyebrow.textContent='上次阅读 · 仅此设备';
    const title=document.createElement('h2');title.textContent=last.title||'继续上次的章节';
    const detail=document.createElement('p');detail.textContent='已阅读约 '+Math.round(last.percent||0)+'% · 点击后可选择接着读';
    info.append(eyebrow,title,detail);
    const a=document.createElement('a');a.href=last.url;a.textContent='继续阅读 →';
    div.append(info,a);hero.insertAdjacentElement('afterend',div);
  }
  function setupChapter(){
    const article=$('.article');if(!article)return;
    const paras=[...article.querySelectorAll(':scope > p')];
    const bar=document.createElement('div');bar.className='zs-progress';bar.setAttribute('aria-hidden','true');document.body.appendChild(bar);
    const last=get(LAST);
    let oldProgress=last&&last.url===path?last:null;
    const entryTitle=clean($('h1')?.textContent||document.title);
    function calc(){
      const rect=article.getBoundingClientRect(),start=window.scrollY+rect.top,end=start+article.offsetHeight-window.innerHeight*.75;
      const pct=Math.max(0,Math.min(100,(window.scrollY-start)/Math.max(1,end-start)*100));
      let index=0;for(let i=0;i<paras.length;i++){if(paras[i].getBoundingClientRect().top<=window.innerHeight*.45)index=i;}
      return {percent:Math.round(pct),index};
    }
    let userMoved=false,raf=0;
    function save(){raf=0;const d=calc();bar.style.width=d.percent+'%';
      if(!userMoved)return;
      put(LAST,{url:path,title:entryTitle,index:d.index,percent:d.percent,date:Date.now()});
    }
    window.addEventListener('scroll',()=>{userMoved=true;if(!raf)raf=requestAnimationFrame(save)},{passive:true});
    window.addEventListener('pagehide',()=>{if(userMoved)save();});
    if(oldProgress&&oldProgress.index>0&&oldProgress.percent<99){
      const area=document.createElement('div');area.className='zs-resume';
      const hint=document.createElement('span');hint.textContent='上次阅读到约 '+oldProgress.percent+'%，是否接着阅读？';
      const btn=document.createElement('button');btn.type='button';btn.textContent='回到上次位置';
      btn.onclick=()=>{const target=paras[Math.min(paras.length-1,oldProgress.index)];if(target){userMoved=true;target.scrollIntoView({behavior:'smooth',block:'center'});}area.remove();};
      area.append(hint,btn);article.parentNode.insertBefore(area,article);
    }else if(!last||last.url!==path){put(LAST,{url:path,title:entryTitle,index:0,percent:0,date:Date.now()});}
    function settingPanel(){
      const open=document.createElement('button');open.className='zs-reader-fab';open.type='button';open.textContent='Aa 阅读设置';open.setAttribute('aria-expanded','false');
      const panel=document.createElement('aside');panel.className='zs-reader-panel';panel.hidden=true;panel.setAttribute('aria-label','阅读设置');
      const h=document.createElement('h2');h.textContent='阅读设置';panel.appendChild(h);
      const label1=document.createElement('label');label1.textContent='正文字号';panel.append(label1);
      const row1=document.createElement('div');row1.className='zs-controls';
      const shrink=document.createElement('button'),grow=document.createElement('button'),reset=document.createElement('button');
      shrink.type=grow.type=reset.type='button';shrink.textContent='A−';grow.textContent='A+';reset.textContent='恢复默认';
      shrink.onclick=()=>{options.font-=1;apply();size.textContent=options.font+'px';};
      grow.onclick=()=>{options.font+=1;apply();size.textContent=options.font+'px';};
      reset.onclick=()=>{Object.assign(options,{font:18,leading:2.25,width:820,theme:'night'});apply();size.textContent=options.font+'px';theme.value=options.theme;leading.value=String(options.leading);width.value=String(options.width);};
      const size=document.createElement('span');size.style.alignSelf='center';size.textContent=options.font+'px';row1.append(shrink,grow,size,reset);panel.append(row1);
      const themeLabel=document.createElement('label');themeLabel.textContent='阅读背景';panel.append(themeLabel);
      const theme=document.createElement('select');theme.setAttribute('aria-label','阅读背景');
      [['night','深色'],['paper','米黄护眼'],['light','浅色']].forEach(([value,text])=>theme.add(new Option(text,value)));theme.value=options.theme;
      theme.onchange=()=>{options.theme=theme.value;apply();};panel.append(theme);
      const lineLabel=document.createElement('label');lineLabel.textContent='行距';panel.append(lineLabel);
      const leading=document.createElement('select');leading.setAttribute('aria-label','行距');
      [['1.8','紧凑'],['2.25','舒适'],['2.6','宽松']].forEach(([value,text])=>leading.add(new Option(text,value)));leading.value=String(options.leading);
      leading.onchange=()=>{options.leading=Number(leading.value);apply();};panel.append(leading);
      const widthLabel=document.createElement('label');widthLabel.textContent='阅读版心';panel.append(widthLabel);
      const width=document.createElement('select');width.setAttribute('aria-label','阅读版心');
      [['660','窄'],['820','标准'],['1000','宽']].forEach(([value,text])=>width.add(new Option(text,value)));width.value=String(options.width);
      width.onchange=()=>{options.width=Number(width.value);apply();};panel.append(width);
      const note=document.createElement('p');note.className='zs-help';note.textContent='字号、背景与进度保存在此设备浏览器；朗读可使用正文上方的听书功能。';panel.append(note);
      open.onclick=()=>{panel.hidden=!panel.hidden;open.setAttribute('aria-expanded',String(!panel.hidden));};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){panel.hidden=true;open.setAttribute('aria-expanded','false');}});
      document.body.append(open,panel);
    }
    settingPanel();
    const tools=document.createElement('div');tools.className='zs-chapter-tools';
    const back=document.createElement('a');back.href=ROOT+'search.html';back.textContent='⌕ 搜索章节';
    const index=document.createElement('a');index.href=ROOT+'parts/part-01.html';index.textContent='第一篇目录';tools.append(back,index);
    const crumb=$('.crumb');if(crumb)crumb.insertAdjacentElement('afterend',tools);
    requestAnimationFrame(save);
  }
  function init(){loadCSS();apply();addSearchNav();addContinue();if(chapter)setupChapter();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
