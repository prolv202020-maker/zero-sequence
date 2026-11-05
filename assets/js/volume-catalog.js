/* 第零序列 · 两篇卷目统一视图。此脚本只渲染状态，不改变已读数据。 */
(() => {
  'use strict';
  const grid=document.querySelector('.zs-cover-grid');
  const part=Number(document.body.dataset.zsPart||0);
  if(!grid||![1,2].includes(part))return;
  const pkey='p'+String(part).padStart(2,'0');
  const root=part===1?1:11;
  const items=[...grid.querySelectorAll(':scope > a.zs-cover-card')];
  function progress(){
    if(window.ZSUnlock?.get)return window.ZSUnlock.get(part).max;
    try{return Math.max(0,Math.min(100,Number(JSON.parse(localStorage.getItem('zs:part-progress:v1')||'{}')[pkey]?.max)||0));}
    catch{return 0;}
  }
  function mount(){
    items.forEach((a,i)=>{
      const found=a.getAttribute('href')?.match(/volume-(\d+)\.html/);
      if(!found)return;
      const vol=Number(found[1]),ord=vol-root;
      if(!a.querySelector('.zs-cover-media')){
        const media=document.createElement('span');media.className='zs-cover-media';
        const volumeCover=a.querySelector(':scope > .zs-volume-cover');
        const img=a.querySelector(':scope > .zs-cover-thumb');
        if(volumeCover)media.appendChild(volumeCover);
        else if(img)media.appendChild(img);
        const number=document.createElement('span');number.className='zs-cover-number';
        number.textContent='VOL '+String(vol).padStart(2,'0');media.appendChild(number);
        const badge=document.createElement('span');badge.className='zs-volume-state';
        badge.setAttribute('aria-label','卷目阅读状态');media.appendChild(badge);
        a.insertBefore(media,a.firstChild);
        const copy=document.createElement('span');copy.className='zs-cover-copy';
        const small=a.querySelector(':scope > small');
        const heading=a.querySelector(':scope > h3');
        const desc=a.querySelector(':scope > p');
        for(const n of [small,heading,desc])if(n)copy.appendChild(n);
        const link=document.createElement('span');link.className='zs-card-link';link.textContent='打开本卷章节目录 →';
        copy.appendChild(link);a.appendChild(copy);
      }
      a.dataset.volume=String(vol);
    });
    update();
  }
  function update(){
    const max=progress();
    let complete=0;
    items.forEach(a=>{
      const vol=Number(a.dataset.volume),index=vol-root;
      if(!Number.isFinite(vol)||index<0)return;
      const start=index*10,finished=(index+1)*10;
      const unlocked=max>=start;
      const readDone=max>=finished;
      const reading=unlocked&&!readDone;
      a.classList.toggle('zs-cover-unlocked',unlocked);
      a.classList.toggle('zs-volume-complete',readDone);
      a.classList.toggle('zs-volume-current',reading);
      const badge=a.querySelector('.zs-volume-state');
      if(badge)badge.textContent=readDone?'✓ 本卷已读':unlocked?(max===start?'可开始阅读':'继续本卷'):'🔒 尚未解锁';
      const thumb=a.querySelector('.zs-cover-thumb');
      if(thumb&&unlocked)thumb.alt='第'+vol+'卷正式封面';
      const label=a.querySelector('.zs-cover-copy h3')?.textContent||'第'+vol+'卷';
      a.setAttribute('aria-label',unlocked?label+'，打开章节目录':'第'+vol+'卷资料尚未解锁；可打开章节目录阅读');
      if(readDone)complete++;
    });
    const counter=document.getElementById('zs-directory-counter');
    if(counter)counter.textContent='已读完 '+complete+' / 10 卷 · 本篇 '+max+' / 100 章';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);
  else mount();
  document.addEventListener('zs:part-progress-changed',update);
})();
