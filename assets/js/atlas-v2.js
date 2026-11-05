/* 第零序列：阶段档案与职业基础索引。只读取既有进度，不写入。 */
(()=>{
'use strict';
const body=document.body,kind=body.dataset.zsAtlas;
if(!['characters','classes'].includes(kind))return;
const main=document.querySelector('main.page'),h1=main?.querySelector('h1');
if(!main||!h1)return;
const ROOT='/zero-sequence/';
const characters=[
 {name:'顾长渊',role:'剑士',p:1,n:1,type:'主角团',note:'重返故事起点的主要视角人物；以剑士职业参与冒险。'},
 {name:'苏紫璃',role:'治疗师',p:1,n:11,type:'主角团',note:'与伙伴同行，以治疗和守护参与团队行动。'},
 {name:'林烈',role:'狂战士',p:1,n:11,type:'主角团',note:'在团队正面战斗中承担重要责任。'},
 {name:'罗烬',role:'刺客',p:1,n:11,type:'主角团',note:'参与行动、情报与团队协作。'},
 {name:'凌天曜',role:'雷电术士',p:1,n:11,type:'主角团',note:'依靠雷系法术和自身的判断参与战斗。'},
 {name:'戴玄岳',role:'盾卫',p:1,n:11,type:'主角团',note:'擅长防御与阵线保护。'},
 {name:'古言澈',role:'职业资料待正文揭露',p:1,n:21,type:'重要人物',note:'在故事推进中逐渐加入的独立人物。'},
 {name:'马库斯·铁岩',role:'晨星镇铁匠',p:1,n:7,type:'世界人物',note:'晨星镇的铁匠，与早期的一把旧剑有关。'},
 {name:'诺克斯·灰鸦',role:'情报相关人物',p:1,n:21,type:'世界人物',note:'维兰德地区情报体系中的人物。'},
 {name:'诺安·白烛',role:'医疗相关人物',p:1,n:21,type:'世界人物',note:'与白烛医疗体系相关的人物。'},
 {name:'陈陆与独立玩家小队',role:'独立冒险者',p:2,n:1,type:'第二篇',note:'普通玩家也有自己的选择和责任。'},
];
const professionGroups=[
 {name:'近战与格斗',id:'fighter',entries:['剑士','狂战士','枪斗士','武斗家'],desc:'以武器、身法或近身战斗为基础。'},
 {name:'法术与元素',id:'caster',entries:['元素术士','雷电术士','冰霜术士','奥术师'],desc:'通过法术、元素和施法判断参与战斗。'},
 {name:'侦察与游击',id:'ranger',entries:['刺客','弓猎者','斥候','陷阱师'],desc:'重视观察、机动、远程和战术准备。'},
 {name:'防御与守护',id:'guardian',entries:['盾卫','重装战士','壁垒守卫','守城者'],desc:'承担防护、阻挡和阵线控制。'},
 {name:'治疗与支援',id:'support',entries:['治疗师','祝福者','净化师','结界术士'],desc:'通过恢复、强化、净化或保护协助团队。'}
];
const professions=professionGroups.flatMap(g=>g.entries.map(name=>({name,role:g.name,type:g.name,p:1,n:11,note:g.desc,group:g.id})));
const data=kind==='characters'?characters:professions;
function progress(p){
  if(window.ZSUnlock?.get)return window.ZSUnlock.get(p).max;
  try{const x=JSON.parse(localStorage.getItem('zs:part-progress:v1')||'{}');return Math.max(0,Math.min(100,Number(x['p'+String(p).padStart(2,'0')]?.max)||0));}
  catch{return 0;}
}
function make(tag,cls,content){const n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=content;return n;}
function link(url,label){const a=make('a','',label);a.href=url;return a;}
const host=make('section','zs-atlas-public');
host.setAttribute('aria-label',kind==='characters'?'渐进人物档案':'渐进职业档案');
const kicker=make('div','zs-atlas-kicker',kind==='characters'?'CHARACTER FILES · VERIFIED STORY':'CLASS INDEX · PUBLIC BASICS');
host.append(kicker,make('h2','',kind==='characters'?'已揭晓的人物档案':'五大体系 · 基础职业索引'));
host.append(make('p','zs-atlas-intro',kind==='characters'?'按照本设备已读的章节，逐步显示人物姓名、已公开职业与阶段资料。人物最终命运、底牌和未确认档案不提前公布。':'以现有网站的五大职业体系与20个基础分支为准。普通基础职业也可以成长；隐藏职业、个人能力终局和未确认扩展资料不在初期公开。'));
const status=make('div','zs-atlas-status'),meter=make('div','zs-atlas-progress'),fill=make('i');
meter.append(fill);host.append(status,meter);
const actions=make('div','zs-atlas-actions');
actions.append(link(ROOT+'parts/part-01.html','第一篇 · 轮回启幕'),link(ROOT+'parts/part-02.html','第二篇 · 百城星火'),link(ROOT+'archive/unlocks.html','查看逐章解锁记录'),link(ROOT+(kind==='characters'?'archive/classes.html':'archive/characters.html'),kind==='characters'?'进入职业图鉴':'进入人物图鉴'));
host.append(actions);
const controls=make('div','zs-atlas-controls');
const input=make('input');input.type='search';input.placeholder=kind==='characters'?'搜索已解锁的人物或职业':'搜索已解锁的基础职业';input.setAttribute('aria-label','搜索已解锁图鉴');
const select=make('select');select.setAttribute('aria-label','选择图鉴分类');
const options=kind==='characters'?['全部分类','主角团','重要人物','世界人物','第二篇']:['全部分类',...professionGroups.map(x=>x.name)];
options.forEach((v,i)=>{const o=document.createElement('option');o.value=i===0?'':v;o.textContent=v;select.append(o);});
const count=make('span','zs-atlas-count');
controls.append(input,select,count);host.append(controls);
const grid=make('div','zs-atlas-grid'),empty=make('p','zs-atlas-empty','当前筛选没有符合条件的已解锁档案。');empty.hidden=true;
host.append(grid,empty);
const notice=make('p','zs-atlas-notice','阅读进度仅存于当前浏览器。未解锁的档案不会显示姓名、能力或剧情简介；小说章节本身仍可自由阅读。');
host.append(notice);
const legacy=make('div','zs-atlas-legacy-notice');
host.append(legacy);
h1.insertAdjacentElement('afterend',host);
const oldNodes=[...main.children].filter(n=>n!==host&&!n.classList.contains('crumb')&&!n.classList.contains('eyebrow')&&n!==h1);
oldNodes.forEach(n=>n.classList.add('zs-atlas-protected'));
function render(){
 const p1=progress(1),p2=progress(2),full=p1>=100&&p2>=100;
 body.classList.toggle('zs-atlas-full',full);
 status.replaceChildren(make('span','','第一篇 '+p1+'/100 章'),make('span','','第二篇 '+p2+'/100 章'),make('span','',full?'完整典藏档案已开放':'详细后期档案继续封存'));
 fill.style.width=((p1+p2)/2)+'%';
 legacy.textContent=full?'两篇均完成阅读，页面下方已经开放原有的完整人物／职业图鉴。':'完整立绘、进阶路线及后期人物资料在两篇均完成后开放；当前可先探索已读章节对应的基础档案。';
 const query=input.value.trim().toLowerCase(),filter=select.value;
 grid.replaceChildren();let total=0;
 data.forEach(entry=>{
   const ok=(entry.p===1?p1:p2)>=entry.n;
   if(!ok)return;
   if(filter&&filter!==entry.type)return;
   if(query&&![entry.name,entry.role,entry.note].join(' ').toLowerCase().includes(query))return;
   total++;
   const card=make('article','zs-atlas-entry');
   card.append(make('small','',entry.type+' · 第'+entry.p+'篇已揭晓'),make('h3','',entry.name),make('span','zs-atlas-tag',entry.role),make('p','',entry.note));
   if(full&&kind==='classes')card.append(link('#'+entry.group,'前往职业详细介绍'));
   grid.append(card);
 });
 count.textContent='目前显示 '+total+' 条档案';
 empty.hidden=total!==0;
}
input.addEventListener('input',render);select.addEventListener('change',render);
document.addEventListener('zs:part-progress-changed',render);
render();
})();