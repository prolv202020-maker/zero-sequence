/* 第零序列 · 人物独立档案：章节公开进度、成长、职业、关系与相关章节。只读已有本地记录。 */
(()=>{'use strict';
const ROOT='/zero-sequence/';
const profiles=[
 {id:'gu-changyuan',name:'顾长渊',role:'剑士',first:1,art:'f948ca5d-b2ab-4754-9cc7-72ed6df61f7c.png',bio:'故事的主要视角人物。经历重返后，他重新审视记忆、选择与伙伴。',ability:'以剑士的常规战斗方式、战术判断和团队配合应对危机。',bond:'与苏紫璃及多年相识的伙伴有重要联系。',later:'成长细节请以你已经阅读的正式正文为准。'},
 {id:'su-zili',name:'苏紫璃',role:'治疗师',first:11,art:'586162d7-874d-4bf5-99a8-18fd31b2164e.png',bio:'在队伍中负责治疗和支援，同样有自己的行动判断。',ability:'治疗、伤势判断与战场支援；恢复效果并非没有消耗。',bond:'与顾长渊及伙伴们并肩经历行动，是队伍的独立成员。',later:'成长细节请以你已经阅读的正式正文为准。'},
 {id:'lin-lie',name:'林烈',role:'狂战士',first:11,art:'linlie.png',bio:'直率而重情义，擅长在正面战斗中承担压力。',ability:'以近身突破与战意推动正面战斗，仍然需要谨慎判断风险。',bond:'与顾长渊等伙伴有深厚的兄弟情谊。',later:'成长细节请以你已经阅读的正式正文为准。'},
 {id:'luo-jin',name:'罗烬',role:'刺客',first:11,art:'luojin.png',bio:'在团队里承担机动、情报与行动配合。',ability:'依靠观察、时机与刺客职业的机动优势进行战斗。',bond:'与顾长渊及团队保持紧密协作，也拥有自己的判断。',later:'成长细节请以你已经阅读的正式正文为准。'},
 {id:'ling-tianyao',name:'凌天曜',role:'雷电术士',first:11,art:'ling%20tianyao.png',bio:'活跃且善于调节气氛的旧友，也在危机中学习承担责任。',ability:'以雷系法术进行远程攻击、范围压制与战场配合。',bond:'与顾长渊有旧日交情，重新同行后逐渐建立新的信任。',later:'成长细节请以你已经阅读的正式正文为准。'},
 {id:'dai-xuanyue',name:'戴玄岳',role:'盾卫',first:11,art:'DAI%20XUANYUE.png',bio:'稳重可靠，在团队中承担盾牌、阵线与同伴保护。',ability:'以盾牌格挡、保护队友和稳定阵线为基础。',bond:'与顾长渊等伙伴并肩，同时尊重团队成员的独立决定。',later:'成长细节请以你已经阅读的正式正文为准。'},
 {id:'gu-yanche',name:'古言澈',role:'重要探索者',first:21,art:'GU%20YANCHE.png',bio:'在维兰德阶段逐步进入故事，有自己的探索目标和复杂经历。',ability:'具体职业与特殊能力以读者已经阅读的正式正文为准。',bond:'与长渊工作室建立合作，但拥有独立的行动与选择。',later:'成长细节请以你已经阅读的正式正文为准。'}
];
const current=document.body.dataset.zsProfile;
const info=profiles.find(p=>p.id===current);
if(!info)return;
const host=document.querySelector('.zs-profile-summary');
if(!host)return;
const progress=part=>{
 try{if(window.ZSUnlock?.get)return window.ZSUnlock.get(part).max;
 const x=JSON.parse(localStorage.getItem('zs:part-progress:v1')||'{}');
 return Math.max(0,Math.min(100,Number(x['p'+String(part).padStart(2,'0')]?.max)||0));
 }catch(e){return 0;}
};
const node=(tag,cls,txt)=>{const v=document.createElement(tag);if(cls)v.className=cls;if(txt!==undefined)v.textContent=txt;return v};
const a=(url,label)=>{const e=node('a','',label);e.href=url;return e};
const chapterUrl=(vol,n)=>ROOT+'chapters/volume-'+String(vol).padStart(2,'0')+'/chapter-'+String(n).padStart(3,'0')+'.html';
const tabs=['已知资料','职业能力','成长记录','人物关系','相关章节'];
const tabEls=[],sections=[];
function card(label,title,desc,locked=false){
 const wrap=node('article','zs-profile-card'+(locked?' zs-profile-locked':''));
 wrap.append(node('small','',label),node('h3','',title),node('p','',desc));return wrap;
}
function init(){
 host.replaceChildren();
 host.append(node('div','zs-profile-kicker','CHARACTER DOSSIER · 逐章公开'));
 const art=node('img','zs-profile-profile-art');art.src=ROOT+'assets/css/%60images/characters/'+info.art;art.alt=info.name+'官方立绘';art.loading='lazy';
 const heading=node('h1','',info.name);host.append(heading);
 const intro=node('p','zs-profile-opening','人物资料随正文推进开放，不以作者内部未来设定代替已经公开的剧情。');
 host.append(intro);
 const stats=node('div','zs-profile-progress'),p1=node('span'),p2=node('span'),phase=node('span'),meter=node('span','zs-profile-meter'),fill=node('i');
 meter.append(fill);stats.append(p1,p2,phase,meter);host.append(stats);
 const bar=node('div','zs-profile-tabs');bar.setAttribute('role','tablist');bar.setAttribute('aria-label','档案分类');
 tabs.forEach((label,i)=>{const b=node('button','',label);b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-selected',i===0?'true':'false');b.addEventListener('click',()=>setTab(i));bar.append(b);tabEls.push(b);});
 host.append(bar);
 tabs.forEach((label,i)=>{const sec=node('section','zs-profile-section');sec.setAttribute('role','tabpanel');sec.setAttribute('aria-label',label);sec.hidden=i!==0;host.append(sec);sections.push(sec)});
 const links=node('div','zs-profile-links');
 links.append(a(ROOT+'archive/characters.html','← 返回人物图鉴'),a(ROOT+'archive/classes.html','职业图鉴'),a(ROOT+'archive/unlocks.html','阶段解锁总览'));
 const ix=profiles.indexOf(info);
 if(ix>0)links.append(a(profiles[ix-1].id+'.html','← 上一位人物'));
 if(ix<profiles.length-1)links.append(a(profiles[ix+1].id+'.html','下一位人物 →'));
 host.append(links,node('p','zs-profile-footnote','该页面使用当前设备的第一、二篇已读记录。未读阶段不显示秘密职业、隐藏能力、未来情节与结局；全部已发布章节仍可自由阅读。'));
 function refresh(){
 const x=progress(1),y=progress(2),read=x>=info.first,complete=x>=100&&y>=100;
 document.body.classList.toggle('zs-profile-full',complete);
 p1.textContent='第一篇 '+x+'/100 章';p2.textContent='第二篇 '+y+'/100 章';
 phase.textContent=complete?'两篇阅读进度已完成':read?'当前人物已公开资料可阅读':'人物资料尚未解锁';
 fill.style.width=((x+y)/2)+'%';
 art.remove();
 if(read)heading.insertAdjacentElement('beforebegin',art);
 intro.textContent=read?info.bio:'继续阅读第一篇，人物身份和经历会在相应章节逐步公开。';
 const stage2=x>=Math.max(21,info.first),stage3=x>=61,stage4=y>=51;
 const base=read?info.role:'职业待揭晓';
 const states=[
  [card('人物身份',read?'人物资料已公开':'🔒 人物尚未揭晓',read?info.bio:'阅读至第一篇第'+info.first+'章后开放。',!read)],
  [card('初始职业',read?base:'🔒 职业未公开',read?info.ability:'该职业信息仍处于未读阶段。',!read),
   card('进阶能力',stage3?'成长方向已展开':'🔒 后续能力仍封存',stage3?info.later:'成长细节请以你已经阅读的正式正文为准。',!stage3)],
  [card('首次阶段',read?'初期同行与探索':'🔒 待出场',read?'在读者已接触的章节里，人物展现了最初的性格和行动选择。':'本阶段尚未阅读。',!read),
   card('成长阶段',stage2?'逐步建立独立判断':'🔒 后续经历封存',stage2?info.later:'成长细节请以你已经阅读的正式正文为准。',!stage2),
   card('第二篇阶段',stage4?'独立行动与团队协作':'🔒 百城星火阶段',stage4?'在新的冒险和合作中继续承担自己的责任。':'继续阅读第二篇后开放。',!stage4)],
  [card('已知关系',read?'团队与伙伴':'🔒 关系待揭晓',read?info.bond:'尚未解锁的人物关系不提前公布。',!read),
   card('后续关系变化',stage4?'信任与独立选择':'🔒 关系发展封存',stage4?'人物之间的合作会随具体经历不断变化，而非固定在最初的标签里。':'阅读第二篇的相关章节后开放。',!stage4)]
 ];
 sections.slice(0,4).forEach((sec,i)=>{sec.replaceChildren(...states[i]);});
 const sec=sections[4];sec.replaceChildren();
 if(!read)sec.append(card('关联章节','🔒 章节索引待解锁','人物资料达到公开阶段后，才显示相应的故事入口。',true));
 else{
  const c=card('已公开故事起点','本篇首次阶段','这些链接指向已经发布的正文，可由读者自行选择阅读。');
  c.append(a(chapterUrl(info.first<=10?1:info.first<=20?2:3,info.first<=10?info.first:info.first<=20?info.first-10:info.first-20),'阅读对应章节 →'));sec.append(c);
  if(stage2){const v=card('已读阶段','第一篇 · 卷目目录','返回卷目目录查看人物在不同阶段的行动。');v.append(a(ROOT+'parts/part-01.html','打开第一篇目录 →'));sec.append(v);}
  if(stage4){const v=card('百城星火','第二篇 · 伙伴各自的道路','已读阶段包含更多独立行动与团队关系。');v.append(a(ROOT+'parts/part-02.html','打开第二篇目录 →'));sec.append(v);}
 }
 }
 document.addEventListener('zs:part-progress-changed',refresh);
 window.addEventListener('pageshow',refresh);
 refresh();
}
function setTab(index){tabEls.forEach((t,i)=>t.setAttribute('aria-selected',i===index?'true':'false'));sections.forEach((s,i)=>s.hidden=i!==index);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
