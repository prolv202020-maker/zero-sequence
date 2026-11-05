
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
  const options=Object.assign({font:(window.matchMedia('(max-width:600px)').matches?17:18),leading:2.25,width:820,theme:'night'},get(OPT)||{});
  function loadCSS(){
    if($('link[data-zs-reader]'))return;
    const l=document.createElement('link');l.rel='stylesheet';l.href=ROOT+'assets/css/reader-experience.css?v=2';l.dataset.zsReader='1';document.head.appendChild(l);
  }
  function apply(){
    options.font=Math.min(24,Math.max(16,Number(options.font)||18));
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
    const nav=$('header nav');if(!nav||nav.classList.contains('zs-global-nav')||nav.querySelector('.zs-search-nav')||[...nav.querySelectorAll('a')].some(a=>a.getAttribute('href')?.endsWith('search.html')))return;
    const a=document.createElement('a');a.href=ROOT+'search.html';a.textContent='搜索';a.className='zs-search-nav';nav.appendChild(a);
  }
  function addContinue(){
    if(!document.body.classList.contains('home-page'))return;
    const last=get(LAST), box=$('#zs-home-resume');
    const valid=last&&typeof last.url==='string'&&last.url.startsWith(ROOT+'chapters/');
    if(box){
      const title=$('#zs-resume-title'),detail=$('#zs-resume-description');
      const link=$('#zs-resume-link'),bar=$('#zs-resume-bar');
      if(valid){
        if(title)title.textContent=last.title||'继续上次的章节';
        const percent=Math.max(0,Math.min(100,Math.round(Number(last.percent)||0)));
        if(detail)detail.textContent='上次阅读 · 已阅读约 '+percent+'% · 进度仅保存在当前设备';
        if(link){link.href=last.url;link.textContent='继续阅读 →';}
        if(bar)bar.style.width=percent+'%';
      }
      return;
    }
    const hero=$('.hero');if(!valid||!hero)return;
    const div=document.createElement('section');div.className='zs-continue';div.setAttribute('aria-label','继续阅读');
    const info=document.createElement('div');
    const eyebrow=document.createElement('small');eyebrow.textContent='上次阅读 · 仅此设备';
    const title=document.createElement('h2');title.textContent=last.title||'继续上次的章节';
    const detail=document.createElement('p');detail.textContent='已阅读约 '+Math.round(last.percent||0)+'% · 点击后可选择接着读';
    info.append(eyebrow,title,detail);
    const link=document.createElement('a');link.href=last.url;link.textContent='继续阅读 →';
    div.append(info,link);hero.insertAdjacentElement('afterend',div);
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
      reset.onclick=()=>{Object.assign(options,{font:(window.matchMedia('(max-width:600px)').matches?17:18),leading:2.25,width:820,theme:'night'});apply();size.textContent=options.font+'px';theme.value=options.theme;leading.value=String(options.leading);width.value=String(options.width);};
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
      const note=document.createElement('p');note.className='zs-help';note.textContent='字号、背景与阅读进度仅保存在当前设备浏览器。';panel.append(note);
      panel.id='zs-reader-options';open.setAttribute('aria-controls',panel.id);open.setAttribute('aria-label','打开阅读设置');
      open.onclick=()=>{panel.hidden=!panel.hidden;open.setAttribute('aria-expanded',String(!panel.hidden));open.setAttribute('aria-label',panel.hidden?'打开阅读设置':'关闭阅读设置');};
      document.addEventListener('click',e=>{if(!panel.hidden&&!panel.contains(e.target)&&e.target!==open){panel.hidden=true;open.setAttribute('aria-expanded','false');open.setAttribute('aria-label','打开阅读设置');}});
      document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){panel.hidden=true;open.setAttribute('aria-expanded','false');open.setAttribute('aria-label','打开阅读设置');open.focus();}});
      document.body.append(open,panel);
    }
    settingPanel();
    const tools=document.createElement('nav');tools.className='zs-chapter-tools';
    tools.setAttribute('aria-label','章节快速导航');
    const match=path.match(/\/chapters\/volume-(\d{2})\/(chapter-(\d{3})|prologue)\.html$/);
    const vol=match?Number(match[1]):1;
    const num=match&&match[3]?Number(match[3]):0;
    const volLink=v=>ROOT+'volumes/volume-'+String(v).padStart(2,'0')+'.html';
    const chapLink=(v,n)=>ROOT+'chapters/volume-'+String(v).padStart(2,'0')+'/chapter-'+String(n).padStart(3,'0')+'.html';
    const navLink=(href,label,cls)=>{const a=document.createElement('a');a.href=href;a.textContent=label;if(cls)a.className=cls;return a;};
    if(num>1)tools.append(navLink(chapLink(vol,num-1),'← 上一章'));
    else if(num===1&&vol===1)tools.append(navLink(ROOT+'chapters/volume-01/prologue.html','← 序章'));
    else if(num===1&&vol>1)tools.append(navLink(chapLink(vol-1,10),'← 上一章'));
    const part=Math.floor((vol-1)/10)+1;
    tools.append(navLink(volLink(vol),'本卷目录'),navLink(ROOT+'parts/part-0'+part+'.html','第'+part+'篇目录'));
    if(num===0)tools.append(navLink(chapLink(vol,1),'下一章 →'));
    else if(num<10)tools.append(navLink(chapLink(vol,num+1),'下一章 →'));
    else if(vol<20)tools.append(navLink(chapLink(vol+1,1),'下一章 →'));
    const crumb=$('.crumb');if(crumb)crumb.insertAdjacentElement('afterend',tools);
    requestAnimationFrame(save);
  }
  function init(){loadCSS();apply();addSearchNav();addContinue();if(chapter)setupChapter();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
