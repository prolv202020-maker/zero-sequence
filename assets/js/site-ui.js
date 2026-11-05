/* 第零序列：全站导航、轻量互动和阅读无障碍。 */
(() => {
  'use strict';
  const ROOT='/zero-sequence/';
  const groups=[
    {label:'首页',url:ROOT+'index.html'},
    {label:'篇章书库',url:ROOT+'index.html#volumes',children:[
      ['第一篇 · 轮回启幕','parts/part-01.html'],
      ['第二篇 · 百城星火','parts/part-02.html'],
      ['全部章节与搜索','search.html']
    ]},
    {label:'概念插画',url:ROOT+'parts/illustrations-01.html',children:[
      ['第一篇 · 概念画廊','parts/illustrations-01.html'],
      ['第二篇 · 待解锁画廊','parts/part-02.html'],
      ['人物图鉴与立绘','archive/characters.html']
    ]},
    {label:'万界档案',url:ROOT+'archive/unlocks.html',children:[
      ['逐章解锁档案','archive/unlocks.html'],
      ['剧情任务与事件','archive/quests.html'],
      ['人物与势力','archive/characters.html'],
      ['职业与技能','archive/classes.html'],
      ['武器装备','archive/equipment.html'],
      ['怪物图鉴','archive/bestiary.html'],
      ['万界地图','archive/world.html'],
      ['生产与经济','archive/industry.html']
    ]},
    {label:'我的阅读',url:ROOT+'archive/unlocks.html',children:[
      ['阅读进度与解锁','archive/unlocks.html'],
      ['继续阅读','index.html#reading'],
      ['搜索章节','search.html']
    ]}
  ];
  function mount(){
    const header=document.querySelector('body > header');
    if(!header||header.classList.contains('zs-header'))return;
    header.classList.add('zs-header');
    const old=header.querySelector('nav');
    if(!old)return;
    const nav=document.createElement('nav');
    nav.className='zs-global-nav';nav.id='zs-primary-navigation';nav.setAttribute('aria-label','主导航');
    for(const group of groups){
      if(!group.children){
        const a=document.createElement('a');a.href=group.url;a.textContent=group.label;
        nav.appendChild(a);continue;
      }
      const details=document.createElement('details');details.className='zs-nav-group';
      const summary=document.createElement('summary');summary.textContent=group.label;details.appendChild(summary);
      const items=document.createElement('div');items.className='zs-nav-items';
      const main=document.createElement('a');main.href=group.url;main.textContent='进入'+group.label;items.appendChild(main);
      for(const [name,path] of group.children){
        const a=document.createElement('a');a.href=ROOT+path;a.textContent=name;
        items.appendChild(a);
      }
      details.appendChild(items);nav.appendChild(details);
      details.addEventListener('toggle',()=>{
        if(details.open)nav.querySelectorAll('details').forEach(d=>{if(d!==details)d.open=false;});
      });
    }
    const tools=document.createElement('div');tools.className='zs-header-tools';
    const search=document.createElement('a');search.href=ROOT+'search.html';search.className='zs-header-search';
    search.textContent='⌕';search.title='搜索章节';search.setAttribute('aria-label','搜索章节');
    const menu=document.createElement('button');menu.type='button';menu.className='zs-mobile-toggle';
    menu.setAttribute('aria-controls',nav.id);menu.setAttribute('aria-expanded','false');
    menu.setAttribute('aria-label','展开导航菜单');menu.textContent='☰';
    tools.append(search,menu);
    old.replaceWith(nav);header.appendChild(tools);
    function closeMenu(){
      nav.classList.remove('zs-open');menu.setAttribute('aria-expanded','false');
      menu.setAttribute('aria-label','展开导航菜单');menu.textContent='☰';
      nav.querySelectorAll('details').forEach(d=>d.open=false);
    }
    menu.addEventListener('click',()=>{
      const open=!nav.classList.contains('zs-open');
      if(open){nav.classList.add('zs-open');menu.setAttribute('aria-expanded','true');menu.setAttribute('aria-label','关闭导航菜单');menu.textContent='✕';}
      else closeMenu();
    });
    nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
    document.addEventListener('click',e=>{
      if(!header.contains(e.target)){
        nav.querySelectorAll('details').forEach(d=>d.open=false);
        if(nav.classList.contains('zs-open'))closeMenu();
      }
    });
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'){closeMenu();menu.blur();}
    });
    const update=()=>header.classList.toggle('zs-scrolled',window.scrollY>24);
    window.addEventListener('scroll',update,{passive:true});update();
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!reduce&&'IntersectionObserver'in window){
      document.body.classList.add('zs-animations-ready');
      const observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('zs-visible');observer.unobserve(entry.target);}});
      },{rootMargin:'0px 0px 40px 0px',threshold:0.06});
      document.querySelectorAll('.home-page .zs-reveal').forEach(el=>observer.observe(el));
    }else{
      document.querySelectorAll('.zs-reveal').forEach(el=>el.classList.add('zs-visible'));
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);
  else mount();
})();