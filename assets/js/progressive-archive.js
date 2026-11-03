/* 第零序列 · 分篇独立解锁（无后端，进度仅存此浏览器） */
(function(){
'use strict';
const BASE='/zero-sequence/';
const KEY='zs:part-progress:v1';
const MODE='zs:archive-view:v1';
const partNames={1:'轮回启幕'};
const entries=[
 {p:1,n:1,k:'人物',t:'顾长渊',d:'故事的主要视角人物。一次重返，让他重新思考什么才是最重要的。'},
 {p:1,n:1,k:'人物',t:'苏紫璃与旧日伙伴',d:'在故事的起点，他重新看见了那些重要之人。'},
 {p:1,n:3,k:'世界',t:'《神魔轮回》',d:'在全球开服前，围绕这款游戏的异常已经开始出现。'},
 {p:1,n:6,k:'地图',t:'晨星镇',d:'故事初期的探索区域。更多地点将在阅读推进后开放。'},
 {p:1,n:7,k:'人物',t:'马库斯·铁岩',d:'晨星镇铁匠，与一把旧剑有关。'},
 {p:1,n:11,k:'人物',t:'同行的伙伴',d:'正式开服后，众人的团队关系在行动中逐渐形成。'},
 {p:1,n:11,k:'职业',t:'职业成长',d:'普通职业的基础与实际成长开始体现；不提前显示人物底牌。'},
 {p:1,n:21,k:'地图',t:'维兰德城',d:'新的城市地图与相应的人物、事务逐渐出现。'},
 {p:1,n:21,k:'势力',t:'长渊工作室',d:'一个以合作和情报为基础的团队开始建立自己的路线。'},
 {p:1,n:21,k:'势力',t:'灰鸦与白烛',d:'情报、医疗与城市生活不再只是玩家任务的背景。'},
 {p:1,n:31,k:'地图',t:'北线第三路碑',d:'探索开始涉及被遗忘的道路和失踪事件。'},
 {p:1,n:41,k:'势力',t:'灰石盟约',d:'矿道、运输、守卫和工匠需要共同承担城市的安全。'},
 {p:1,n:51,k:'地图',t:'失落商道',d:'新的商路和不同旅行者的选择，让世界变得更广阔。'},
 {p:1,n:61,k:'地图',t:'白霜边境',d:'寒潮与边境防线带来新的生存挑战。'},
 {p:1,n:71,k:'势力',t:'百城之约',d:'商路、交易和各方协商开始交织。'},
 {p:1,n:81,k:'事件',t:'黑风试炼',d:'并非所有冒险都能全身而退。'},
 {p:1,n:91,k:'地图',t:'无名之门',d:'一处重要遗迹成为阶段性探索焦点。'}
];
function storeRead(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'?x:{};}catch(e){return {};}}
function storeWrite(obj){try{localStorage.setItem(KEY,JSON.stringify(obj));}catch(e){}}
function partOf(v){return Math.floor((v-1)/10)+1;}
function nameOf(p){return partNames[p]||'待公开';}
function get(p){const item=storeRead()['p'+String(p).padStart(2,'0')]||{};return {max:Math.max(0,Math.min(100,Number(item.max)||0)),prologue:!!item.prologue,updated:item.updated||0};}
function set(p,n,prologue){if(p<1||p>99)return;const all=storeRead(),key='p'+String(p).padStart(2,'0');const prev=get(p);all[key]={max:Math.max(prev.max,Math.max(0,Math.min(100,n))),prologue:prev.prologue||!!prologue,updated:Date.now()};storeWrite(all);document.dispatchEvent(new Event('zs:part-progress-changed')); }
function isAuthorPreview(){return sessionStorage.getItem(MODE)==='preview';}
function available(entry){return isAuthorPreview()||get(entry.p).max>=entry.n;}
function el(tag,cls,content){const node=document.createElement(tag);if(cls)node.className=cls;if(content!==undefined)node.textContent=content;return node;}
function aLink(href,text,cls){const a=el('a',cls,text);a.href=href;return a;}
function css(){if(document.getElementById('zs-unlock-style'))return;
const s=document.createElement('style');s.id='zs-unlock-style';s.textContent=
'.zs-unlock-panel{margin:25px 0;padding:24px;border:1px solid #dac38e75;border-radius:20px;background:linear-gradient(135deg,#32375cbf,#1b213eec);box-shadow:0 14px 42px #0a0d202c}.zs-unlock-panel h2,.zs-unlock-panel h3{margin:4px 0 14px;font-size:22px;letter-spacing:.04em}.zs-unlock-panel p,.zs-unlock-panel small{color:#d5d6e1;line-height:1.8}.zs-progress-meter{height:11px;background:#14182b;border-radius:20px;overflow:hidden;margin:12px 0}.zs-progress-meter>i{display:block;height:100%;background:linear-gradient(90deg,#9776e3,#f0d496);border-radius:20px}.zs-unlock-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.zs-unlock-actions a,.zs-unlock-actions button,.zs-unlock-button{display:inline-block;border:1px solid #e4c78799;padding:9px 14px;border-radius:10px;background:#2d3156;color:#fae7b6;font:inherit;font-size:13px;cursor:pointer}.zs-unlock-actions a:hover,.zs-unlock-actions button:hover,.zs-unlock-button:hover{background:#42476e}.zs-unlock-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:18px 0 35px}.zs-unlock-card{padding:18px;border-radius:15px;border:1px solid #e2d2a047;background:#313658aa;min-height:160px}.zs-unlock-card h3{font-size:18px;margin:10px 0}.zs-unlock-card small{font-size:11px;color:#f2d69b}.zs-unlock-card p{font-size:13px;line-height:1.8;color:#d6d5e1}.zs-unlock-card.locked{opacity:.7;border-style:dashed}.zs-chapter-complete{margin:26px 0 8px;padding:18px;border:1px solid #dac38e55;border-radius:14px;background:#30365b}.zs-chapter-complete p{font-size:13px;margin:7px 0;color:#d6d8e6}.zs-part-card{margin:16px 0}.zs-part-card .zs-progress-meter{max-width:500px}.zs-gated-main>:not(.crumb):not(.zs-spoiler-wall):not(.eyebrow):not(h1){display:none!important}.zs-spoiler-wall{display:block;margin:25px 0;padding:25px;border:1px solid #d4c18e88;border-radius:18px;background:#252a4b}.zs-spoiler-wall h2{font-size:25px;margin:2px 0 13px}.zs-spoiler-wall p{line-height:1.9}.zs-spoiler-wall a{color:#f2d7a0;text-decoration:underline}.zs-preview-note{color:#f0cb89;font-size:12px;margin:8px 0}.zs-next-lock{font-size:12px;color:#c9c3d6}.zs-part-locked{color:#c6c5d7}.zs-locked-summary{opacity:.7}.zs-locked-summary summary{cursor:not-allowed}.zs-footer-notice{font-size:12px;color:#ceccdc;margin-top:20px}@media(max-width:650px){.zs-unlock-panel{padding:18px}.zs-unlock-grid{grid-template-columns:1fr}}';
document.head.append(s);}
function summary(p){const state=get(p);return (state.prologue?'序章已读 · ':'')+'已解锁 '+state.max+'/100 章';}
function meter(p){const outer=el('div','zs-progress-meter');outer.setAttribute('role','progressbar');outer.setAttribute('aria-valuenow',String(get(p).max));outer.setAttribute('aria-valuemin','0');outer.setAttribute('aria-valuemax','100');outer.setAttribute('aria-label','第'+p+'篇已解锁章节');const fill=el('i');fill.style.width=get(p).max+'%';outer.append(fill);return outer;}
function articleUnlock(){const m=location.pathname.match(/\/chapters\/volume-(\d{2})\/(chapter-(\d{3})|prologue)\.html$/);if(!m)return;
const vol=Number(m[1]),local=Number(m[3]||0),p=partOf(vol),n=((vol-1)%10)*10+local,pro=!!(m[2]==='prologue');
const article=document.querySelector('.article');if(!article)return;
const card=el('div','zs-chapter-complete'),label=el('strong','', '分篇档案解锁'),status=el('p',''),btn=el('button','zs-unlock-button','✓ 标记本章已读');
card.append(label,status,btn);const pager=article.querySelector('.pager');if(pager)article.insertBefore(card,pager);else article.append(card);
function update(){const s=get(p);const done=pro?s.prologue:s.max>=n;status.textContent=done?'此章已计入第'+p+'篇进度 · '+summary(p):'读完本章后即可解锁对应的世界档案。';btn.disabled=done;btn.textContent=done?'✓ 已解锁':'✓ 标记本章已读';}
function mark(){set(p,n,pro);update();}
btn.addEventListener('click',mark);update();
let marked=false;const onScroll=()=>{if(marked)return;const rc=article.getBoundingClientRect();if(rc.bottom<=window.innerHeight+45&&rc.bottom>0){marked=true;mark();}};
window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll,{passive:true});
}
function partCard(p){const box=el('div','zs-unlock-panel zs-part-card');
const title=el('h2','', '第'+p+'篇 · '+nameOf(p));box.append(title,el('p','',summary(p)),meter(p));
const actions=el('div','zs-unlock-actions');
actions.append(aLink(BASE+'archive/unlocks.html?part='+p,'查看本篇已解锁档案'));
if(p===1)actions.append(aLink(BASE+'chapters/volume-01/prologue.html','从序章开始'));
actions.append(aLink(BASE+'parts/final-archive.html','查看总档案'));box.append(actions);return box;}
function homepage(){if(!document.body.classList.contains('home-page'))return;
const container=document.getElementById('volumes');if(!container)return;
const sec=el('section','');sec.id='zs-progress-home';sec.append(el('p','eyebrow','UNLOCK PROGRESS · 独立进度'),el('h2','','篇章解锁进度'));
sec.append(el('p','lead','第一篇与后续每一篇独立记录进度；总档案只汇总已经读到的剧情。'));
const grid=el('div','zs-unlock-grid');
[1,2].forEach(p=>{const card=el('div','zs-unlock-card');card.append(el('small','',p===1?'PART 01 · 现有正文':'PART 02 · 尚未发布'),el('h3','','第'+p+'篇 · '+nameOf(p)),el('p','',p===1?summary(1):'第二篇尚未发布；将来新增第11—20卷后自动单独记录。'));if(p===1)card.append(meter(1));card.append(aLink(BASE+'archive/unlocks.html?part='+p,'查看解锁状态 →'));grid.append(card);});
const total=el('div','zs-unlock-card');total.append(el('small','','ALL PARTS'),el('h3','','最终篇 · 全部总结'),el('p','','只整合目前已经解锁的信息；未公开的真相仍然封存。'),aLink(BASE+'parts/final-archive.html','打开总档案 →'));grid.append(total);sec.append(grid);container.insertAdjacentElement('afterend',sec);
}
function partPage(){if(!/\/parts\/part-0\d\.html$/.test(location.pathname))return;const p=Number((location.pathname.match(/part-(\d+)\.html/)||[])[1]||1);const hero=document.querySelector('.part-hero');if(hero)hero.insertAdjacentElement('afterend',partCard(p));
if(p!==1)return;
document.querySelectorAll('a[href*="/volumes/volume-"]').forEach(link=>{const found=link.getAttribute('href').match(/volume-(\d+)\.html/);if(!found)return;const vol=Number(found[1]);const need=(vol-1)*10;if(need<=get(1).max)return;const heading=link.querySelector('h3');if(heading)heading.textContent='🔒 第'+vol+'卷 · 尚未解锁';const detail=link.querySelector('p');if(detail)detail.textContent='本卷标题与简介将在阅读至前一卷结束后解锁。';});
const lead=hero&&hero.querySelector('.lead');if(lead&&get(1).max<90)lead.textContent='从重生的起点出发。随着阅读推进，第一篇的地图、人物、势力与谜团将逐步揭晓。';
}
function recapGate(){if(!/\/parts\/recap-01\.html$/.test(location.pathname))return;
document.querySelectorAll('.r-list details').forEach((node,i)=>{const need=(i+1)*10;if(get(1).max>=need)return;const title=node.querySelector('summary')?.textContent||'本卷';node.replaceChildren(el('summary','',title+' · 🔒 读完第'+(i+1)+'卷后解锁'));node.classList.add('zs-locked-summary');node.addEventListener('toggle',()=>{if(node.open)node.open=false;});});
const intro=document.querySelector('main>.lead');if(intro)intro.textContent='每卷回顾按阅读进度开放，未读卷的剧情继续封存。';
}
function archiveGate(){if(!/\/archive\//.test(location.pathname)||/\/archive\/unlocks\.html$/.test(location.pathname))return;
const main=document.querySelector('main');if(!main||get(1).max>=100||isAuthorPreview())return;
main.classList.add('zs-gated-main');const wall=el('div','zs-spoiler-wall');
wall.append(el('h2','','🔒 完整设定档案暂未解锁'),el('p','','此页可能包含第一篇后续章节的信息。为了避免剧透，先展示与你已读章节对应的渐进档案。完成第一篇100章后，可浏览现有的完整公开资料。'));
const actions=el('div','zs-unlock-actions');actions.append(aLink(BASE+'archive/unlocks.html','查看已解锁档案 →'),aLink(BASE+'parts/part-01.html','返回第一篇目录 →'));wall.append(actions);main.append(wall);
}
function catalogPage(){if(!/\/archive\/unlocks\.html$/.test(location.pathname))return;const host=document.getElementById('zs-dynamic-catalog');if(!host)return;const params=new URLSearchParams(location.search),sel=Number(params.get('part'))||1;
function render(){host.replaceChildren();const top=el('div','zs-unlock-panel');
top.append(el('h2','','分篇独立解锁'),el('p','','当前查看：第'+sel+'篇 · '+nameOf(sel)+' · '+summary(sel)),meter(sel));
const actions=el('div','zs-unlock-actions');[1,2].forEach(p=>actions.append(aLink('?part='+p,'第'+p+'篇')));actions.append(aLink(BASE+'parts/final-archive.html','全部总结'));top.append(actions);host.append(top);
if(sel!==1){host.append(el('p','zs-next-lock','第'+sel+'篇尚未发布正式章节。未来新增的篇章将使用各自独立的阅读进度，不会覆盖第一篇。'));return;}
const cats=['人物','职业','地图','势力','世界','事件'];cats.forEach(cat=>{const data=entries.filter(x=>x.p===sel&&x.k===cat);if(!data.length)return;host.append(el('h2','',cat+'档案'));const grid=el('div','zs-unlock-grid');data.forEach(item=>{const ok=available(item),cell=el('article','zs-unlock-card'+(ok?'':' locked'));cell.append(el('small','',ok?'✓ 已解锁 · 第'+item.n+'章':'🔒 第'+item.n+'章后解锁'),el('h3','',ok?item.t:'尚未揭晓'),el('p','',ok?item.d:'继续阅读本篇，达到对应章节后自动显示。'));grid.append(cell);});host.append(grid);});host.append(el('p','zs-footer-notice','本页只显示经过公开核对的阶段资料；未来剧情、人物终局和作者私密笔记不会预先上传。'));}
render();document.addEventListener('zs:part-progress-changed',render);
}
function finalPage(){if(!/\/parts\/final-archive\.html$/.test(location.pathname))return;const host=document.getElementById('zs-final-container');if(!host)return;
function render(){host.replaceChildren();const intro=el('div','zs-unlock-panel');intro.append(el('h2','','全篇进度总览'),el('p','','每篇分别计算，以下只汇总你目前已经解锁的内容。'));
[1,2].forEach(p=>{const line=el('div','zs-part-card');line.append(el('h3','','第'+p+'篇 · '+nameOf(p)),el('p','',p===1?summary(p):'待发布 · 暂无正式章节'),meter(p));intro.append(line);});host.append(intro);
const shown=entries.filter(available);
host.append(el('h2','','已解锁总档案 · '+shown.length+'条'));
if(!shown.length)host.append(el('p','lead','尚未解锁正文档案。阅读第一篇序章与第一章后，故事资料会陆续汇集到这里。'));
['人物','职业','地图','势力','世界','事件'].forEach(cat=>{const data=shown.filter(e=>e.k===cat);if(!data.length)return;host.append(el('h2','',cat));const grid=el('div','zs-unlock-grid');data.forEach(item=>{const card=el('article','zs-unlock-card');card.append(el('small','','第'+item.p+'篇 · 第'+item.n+'章'),el('h3','',item.t),el('p','',item.d));grid.append(card);});host.append(grid);});
host.append(el('p','zs-footer-notice','这里是当前阅读进度的阶段总结，并非全书已完结。最终真相只会在相应正文公开后进入档案。'));const acts=el('div','zs-unlock-actions');acts.append(aLink(BASE+'archive/unlocks.html','进入分篇档案'),aLink(BASE+'parts/part-01.html','返回第一篇'));host.append(acts);}
render();document.addEventListener('zs:part-progress-changed',render);
}
function init(){css();articleUnlock();homepage();partPage();recapGate();archiveGate();catalogPage();finalPage();}
window.ZSUnlock={get,set,entries,partOf};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
