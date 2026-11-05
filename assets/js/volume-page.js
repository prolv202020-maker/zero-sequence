/* 第零序列 · 通用单卷章节目录。只读取进度，不写入或重置任何阅读数据。 */
(() => {
  'use strict';
  const m=location.pathname.match(/\/volumes\/volume-(\d{2})\.html$/);
  if(!m)return;
  const vol=Number(m[1]),part=Math.floor((vol-1)/10)+1;
  if(vol<1||vol>20)return;
  const partName=part===1?'轮回启幕':'百城星火';
  const ROOT='/zero-sequence/';
  const main=document.querySelector('main.page'), chapters=main?.querySelector('.list');
  if(!main||!chapters||document.querySelector('.zs-volume-hero'))return;
  document.body.classList.add('zs-volume-page');
  document.body.dataset.zsPart=String(part);
  const title=main.querySelector('h1'),intro=main.querySelector('p.lead'),eyebrow=main.querySelector('p.eyebrow');
  const existingFigure=main.querySelector('figure');
  const existingComplete=main.querySelector('.complete');
  const heading=main.querySelector('.crumb');
  if(!title||!intro||!eyebrow)return;
  const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
  const hero=el('section','zs-volume-hero');
  let figure=existingFigure;
  if(!figure){
    figure=el('figure');
    const cover=el('img','zs-volume-official-cover');
    cover.src=ROOT+'assets/images/covers/volume-'+String(vol).padStart(2,'0')+'.webp';
    cover.alt='第'+vol+'卷独立正式封面';
    cover.width=750;cover.height=1080;
    figure.append(cover);
    figure.append(el('figcaption','', '第'+part+'篇《'+partName+'》 · 独立卷封面'));
  } else {
    const image=figure.querySelector('img');
    if(image)image.loading='eager';
  }
  const info=el('div','zs-volume-info');
  info.append(eyebrow,title);
  const tags=el('div','zs-volume-tags');
  tags.append(el('span','', '第'+part+'篇 · '+partName),el('span','', '第'+vol+'卷'),el('span','', '本卷10章 · 已发布'));
  info.append(tags,intro);
  if(existingComplete)existingComplete.remove();
  const actions=el('div','zs-volume-actions');
  const links=[...chapters.querySelectorAll('a[href*="/chapters/"]')];
  const first=links.find(a=>/chapter-001\.html$/.test(a.getAttribute('href')||''))||links[0];
  const begin=links.find(a=>/prologue\.html$/.test(a.getAttribute('href')||''))||first;
  const startHref=begin?.getAttribute('href')||'';
  const start=el('a','zs-start-reading','开始本卷阅读');
  start.href=startHref;
  const resume=el('a','zs-resume-volume','继续阅读');
  resume.href=first?.getAttribute('href')||startHref;
  const back=el('a','zs-return-part','返回本篇目录');
  back.href=ROOT+'parts/part-0'+part+'.html';
  actions.append(start,resume,back);
  info.append(actions);
  const progress=el('div','zs-volume-progress');
  const progressLabel=el('label','','本卷阅读进度 0 / 10 章');
  const meter=el('div','zs-volume-meter');
  meter.setAttribute('role','progressbar');meter.setAttribute('aria-label','本卷已读章节');meter.setAttribute('aria-valuemin','0');meter.setAttribute('aria-valuemax','10');
  const meterFill=el('i');
  meter.append(meterFill);progress.append(progressLabel,meter);info.append(progress);
  hero.append(figure,info);
  if(heading)heading.insertAdjacentElement('afterend',hero);
  else main.insertBefore(hero,chapters);
  const chapterHeading=el('div','zs-volume-chapter-head');
  const chapTitle=el('h2','','本卷章节目录');
  const chapCount=el('span','',String(links.filter(a=>/chapter-\d{3}\.html$/.test(a.href)).length)+'章 · 章节均可直接阅读');
  chapterHeading.append(chapTitle,chapCount);
  chapters.parentNode.insertBefore(chapterHeading,chapters);
  chapters.classList.add('zs-volume-chapters');
  const globalFirst=(vol-1)*10+1, localStart=((vol-1)%10)*10;
  for(const [i,a] of links.entries()){
    const href=a.getAttribute('href')||'';
    const n=Number(href.match(/chapter-(\d{3})\.html$/)?.[1]||0);
    const prologue=/prologue\.html$/.test(href);
    const mainTitle=a.querySelector('span')||a;
    if(!mainTitle.classList.contains('zs-chapter-name')){
      let raw=mainTitle.textContent.trim();
      raw=raw.replace(/^【正式正文】/,'').replace(/\s*·\s*正式正文\s*$/,'').trim();
      mainTitle.textContent=raw;
      mainTitle.classList.add('zs-chapter-name');
      const serial=el('span','zs-chapter-index',prologue?'PROLOGUE · 序章':'CHAPTER '+String(globalFirst+n-1).padStart(3,'0'));
      mainTitle.insertBefore(serial,mainTitle.firstChild);
    }
    const oldState=a.querySelector(':scope > span:not(.zs-chapter-name)');
    if(oldState)oldState.remove();
    let status=a.querySelector('.zs-chapter-state');
    if(!status){status=el('span','zs-chapter-state','未读');a.append(status);}
    a.dataset.chapterIndex=String(n);
    if(prologue)a.dataset.prologue='1';
  }
  // Add a consistent footer while leaving every original chapter and volume link in place.
  const pager=main.querySelector('.pager');
  if(pager)pager.classList.add('zs-volume-bottom');
  if(pager&&!pager.querySelector('a[href*="parts/part-"]')){
    const link=el('a','', '返回第'+part+'篇目录');
    link.href=ROOT+'parts/part-0'+part+'.html';pager.append(link);
  }
  const hint=el('p','zs-volume-hint','阅读状态依据当前浏览器保存的记录显示。访问未解锁的卷目录不会影响进度；点击章节仍可直接阅读。');
  chapters.insertAdjacentElement('afterend',hint);
  function loadProgress(){
    if(window.ZSUnlock?.get)return window.ZSUnlock.get(part);
    try{
      const v=JSON.parse(localStorage.getItem('zs:part-progress:v1')||'{}');
      return v['p'+String(part).padStart(2,'0')]||{};
    }catch{return {};}
  }
  function loadLast(){
    try{return JSON.parse(localStorage.getItem('zs:reader:last:v1')||'null');}
    catch{return null;}
  }
  function update(){
    const data=loadProgress();
    const max=Math.max(0,Math.min(100,Number(data.max)||0));
    const read=Math.min(10,Math.max(0,max-localStart));
    const prologueDone=!!data.prologue;
    const last=loadLast();
    const currentHref=last?.url;
    let currentLink=null,nextUnread=null;
    for(const a of links){
      const number=Number(a.dataset.chapterIndex||0);
      const isPrologue=a.dataset.prologue==='1';
      const done=isPrologue?prologueDone:(number>0&&max>=localStart+number);
      const current=typeof currentHref==='string'&&currentHref.endsWith(a.getAttribute('href')?.replace('..','')||'____')||
        (typeof currentHref==='string'&&currentHref===new URL(a.href).pathname);
      a.classList.toggle('zs-chapter-read',done);
      a.classList.toggle('zs-chapter-current',!!current);
      const state=a.querySelector('.zs-chapter-state');
      if(state)state.textContent=current&&!done?'上次阅读':done?'✓ 已读':'阅读 →';
      if(current)currentLink=a;
      if(!done&&!nextUnread)nextUnread=a;
    }
    let target=currentLink||nextUnread||links.at(-1)||begin;
    if(target){resume.href=target.getAttribute('href');resume.textContent=currentLink?'继续上次阅读':'阅读下一章 →';}
    progressLabel.textContent='本卷已读 '+read+' / 10 章'+(vol===1&&prologueDone?' · 序章已读':'');
    meterFill.style.width=(read*10)+'%';
    meter.setAttribute('aria-valuenow',String(read));
    if(read===10)resume.textContent='重温本卷章节 →';
  }
  update();
  document.addEventListener('zs:part-progress-changed',update);
  window.addEventListener('pageshow',update);
})();