(()=>{'use strict';
const ROOT='/zero-sequence/';
const records=[
[1,1,'起点','重返与未来偏离','主要人物重新面对熟悉却可能变化的未来。','顾长渊:characters/gu-changyuan.html','职业:classes.html'],
[1,6,'探索','晨星镇初期探索','早期地图与原住民构成旅程起点。','世界地图:world.html','人物图鉴:characters.html'],
[1,21,'城市','维兰德城的合作与生活','城市、医疗、商业与工作室逐渐建立联系。','势力:factions.html','地图:world.html'],
[1,31,'探索','北线旧路与路碑','探索者重新核对地图与旧道路。','地图:world.html','势力:factions.html'],
[1,41,'协作','灰石山路与共同守护','运输、守卫和工匠共同维护安全。','地图:world.html','工坊:production.html'],
[1,51,'商路','失落商道的选择','商队与旅行者的行动让世界更加广阔。','城市贸易:city-economy.html','产业:industry.html'],
[1,61,'防线','白霜边境','寒潮与边境防线带来新的生存挑战。','戴玄岳:characters/dai-xuanyue.html','地图:world.html'],
[1,81,'试炼','黑风试炼','冒险逐渐显露行动代价。','职业:classes.html','剧情解锁:unlocks.html'],
[1,91,'遗迹','无名之门','遗迹与旧城线索进入新的阶段。','地图:world.html','人物:characters.html'],
[2,1,'合作','独立玩家的选择','不同玩家与原住民拥有各自的价值判断。','人物:characters.html','势力:factions.html'],
[2,11,'商路','西境商路与职业玩家','商路竞争与职业玩家的行动逐渐进入视野。','经济:city-economy.html','势力:factions.html'],
[2,31,'救援','联合医疗与救援研究','医疗需要证据、资源与团队协作。','苏紫璃:characters/su-zili.html','职业:classes.html'],
[2,51,'防线','北境共同防线','伙伴分别承担防守与行动责任。','林烈:characters/lin-lie.html','戴玄岳:characters/dai-xuanyue.html'],
[2,71,'现实','现实应急基地建设','后勤、物资储备与管理成为重要环节。','工坊订单模板:orders.html','产业:industry.html'],
[2,81,'情报','被改写的情报','可疑信息需要交叉核验与独立判断。','罗烬:characters/luo-jin.html','势力:factions.html'],
[2,91,'救援','跨城联合行动','不同队伍在高风险事件中协作。','势力:factions.html','职业:classes.html']
];
const progress=p=>{try{if(window.ZSUnlock?.get)return window.ZSUnlock.get(p).max;const x=JSON.parse(localStorage.getItem('zs:part-progress:v1')||'{}');return Math.max(0,Math.min(100,Number(x['p'+String(p).padStart(2,'0')]?.max)||0));}catch{return 0;}};
const el=(tag,cls,content)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(content!==undefined)x.textContent=content;return x};
const link=(path,title)=>{const a=el('a','',title);a.href=ROOT+path;return a;};
const chapter=(p,n)=>{const vol=(p-1)*10+Math.ceil(n/10),local=(n-1)%10+1;return 'chapters/volume-'+String(vol).padStart(2,'0')+'/chapter-'+String(local).padStart(3,'0')+'.html';};
function start(){const host=document.getElementById('zq-results');if(!host)return;
 const search=document.getElementById('zq-search'),part=document.getElementById('zq-part'),cat=document.getElementById('zq-category'),status=document.getElementById('zq-status'),locked=document.getElementById('zq-locked');
 function render(){const one=progress(1),two=progress(2),query=search.value.trim().toLowerCase(),p=Number(part.value||0),category=cat.value;let count=0;host.replaceChildren();
 for(const [arc,n,k,name,description,...refs] of records){
  if((arc===1?one:two)<n||(p&&arc!==p)||(category&&category!==k))continue;
  if(query&&![name,description,k,...refs].join(' ').toLowerCase().includes(query))continue;
  const card=el('article','zq-card');card.append(el('small','',('第'+arc+'篇 · 第'+n+'章后 · '+k)),el('h2','',name),el('p','',description));
  const links=el('div','zq-links');links.append(link(chapter(arc,n),'阅读相关章节 →'));
  refs.forEach(ref=>{const cut=ref.indexOf(':');links.append(link('archive/'+ref.slice(cut+1),ref.slice(0,cut)));});
  card.append(links);host.append(card);count++;
 }
 if(!count)host.append(el('p','zq-empty','没有符合筛选条件的已解锁剧情线索。'));
 const hidden=records.filter(x=>(x[0]===1?one:two)<x[1]).length;
 status.textContent='第一篇 '+one+'/100章 · 第二篇 '+two+'/100章 · 已显示 '+count+' 条';
 locked.textContent='另有 '+hidden+' 条未解锁记录；名称与关联资料暂不展示。';
 }
 [search,part,cat].forEach(x=>x.addEventListener(x===search?'input':'change',render));document.addEventListener('zs:part-progress-changed',render);window.addEventListener('pageshow',render);render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();