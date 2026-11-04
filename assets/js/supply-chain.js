/* 第零序列 · 产业链资料库视图 | 正文出处 / 设计样例双轨制 */
(()=>{'use strict';
const root=document.querySelector('[data-supply-view]');if(!root)return;
const view=root.dataset.supplyView,KEY='zs:part-progress:v1';
const $=id=>document.getElementById(id);
const node=(tag,cl,txt)=>{const x=document.createElement(tag);if(cl)x.className=cl;if(txt!==undefined)x.textContent=String(txt);return x};
const link=(href,txt,cl)=>{const a=node('a',cl,txt);a.href=href;return a};
const make=(tag,cl,arr)=>{const e=node(tag,cl);e.append(...arr);return e};
const P=(n)=>String(n).padStart(2,'0');
const esc=(value)=>encodeURIComponent(String(value));
function progress(){try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');return Math.max(0,Math.min(100,Number(v?.p01?.max)||0));}catch(e){return 0}}
function src(chapter){const vol=Math.floor((chapter-1)/10)+1,n=chapter-(vol-1)*10;return '../chapters/volume-'+P(vol)+'/chapter-'+String(n).padStart(3,'0')+'.html'}
let db,matBy,cityBy,recipeBy;
const frag=(arr)=>{const f=document.createDocumentFragment();for(const x of arr)f.append(x);return f};
const tag=(label,type)=>node('span','supply-status '+type,label);
const title=(s)=>node('h3','',s);
const para=(s)=>node('p','',s);
const group=(cl,...parts)=>make('div',cl,parts);
function card(){return node('article','sa-card supply-card')}
function moreSection(name,lines){const d=node('details','supply-details');d.append(node('summary','',name),make('ul','',lines.map(x=>node('li','',x))));return d}
function isUnlocked(chapter){return !chapter||progress()>=chapter}
function materialLabel(id){const m=matBy.get(id);if(!m)return '未知材料';if(m.origin&&!isUnlocked(m.origin.chapter))return '未解锁的正文材料';return m.name}
function recipeReady(r){return r.ingredients.every(q=>{const m=matBy.get(q.id);return !m?.origin||isUnlocked(m.origin.chapter);})}
function factLink(ch){return link(src(ch),'第'+ch+'章 · 正文出处','supply-read-link')}
function guardedLinks(arr){const ul=node('ul','supply-linked');for(const a of arr)ul.append(make('li','',[a]));return ul}
function metaBar(parts){return group('supply-meta',...parts)}
function statusEl(item){return item.status==='chapter'?tag('正文记录','fact'):tag('设计示例','draft')}
function applySearch(items,query,txt){const q=query.trim().toLowerCase();if(!q)return items;return items.filter(x=>txt(x).toLowerCase().includes(q))}
function showEmpty(host,text){host.append(node('p','sa-empty',text))}
function makeMaterials(query,mode,kind){
 const host=$('supply-list'),input=db.materials.filter(m=>(mode==='all'||m.status===mode)&&(kind==='all'||m.kind===kind));
 const hits=applySearch(input,query,m=>[m.id,m.name,m.kind,m.grade,m.source,m.usage].join(' ')),f=document.createDocumentFragment();
 let locked=0;
 for(const m of hits){
  if(m.origin&&!isUnlocked(m.origin.chapter)){locked++;continue}
  const c=card(),head=group('supply-card-head',node('span','sa-num',m.kind),statusEl(m));c.append(head,title(m.name));
  c.append(metaBar([tag('品质：'+m.grade,'neutral'),m.origin?tag('第'+m.origin.chapter+'章','neutral'):tag('作者端样例','neutral')]));
  c.append(group('supply-detail',node('b','','来源与取得'),para(m.source)));
  c.append(group('supply-detail',node('b','','用途或研究方向'),para(m.usage)));
  if(m.note)c.append(para('注意：'+m.note));
  const related=db.recipes.filter(r=>recipeReady(r)&&r.ingredients.some(i=>i.id===m.id));
  const links=[];if(m.origin)links.push(factLink(m.origin.chapter));if(m.link)links.push(link('equipment.html','已登场装备资料 ↗','supply-read-link'));
  if(related.length)links.push(link('recipes.html?material='+esc(m.id),'关联配方样例 '+related.length+' 项 ↗','supply-read-link'));
  if(links.length)c.append(group('supply-card-links',...links));f.append(c);
 }
 host.replaceChildren(f);if(locked){const box=node('div','supply-locked');box.append(node('b','','另有 '+locked+' 条正文材料记录待解锁'),para('按第一篇已读章节显示，暂不公开后续发现名称与实际用途。'));host.append(box)}
 if(!hits.length)showEmpty(host,'未找到材料记录，请换一个关键词或类别。');
 $('supply-count').textContent='找到 '+hits.length+' 条 · '+(hits.length-locked)+' 条可查看';
}
function makeDrops(query){
 const host=$('supply-list'),hits=applySearch(db.drops,query,x=>[x.monster,x.monsterId,x.region,x.notes].join(' '));
 const f=document.createDocumentFragment();let locked=0;
 for(const d of hits){if(!isUnlocked(d.first)){locked++;continue}
  const gated=d.evidenceGate&&!isUnlocked(d.evidenceGate);
  const c=card();c.append(group('supply-card-head',node('span','sa-num',d.region),tag('掉落率未公布','warning')),title(d.monster),para(gated?'此生物的后续材料与市场记录尚未达到阅读解锁章节。':d.notes));
  c.append(group('supply-detail',node('b','','正文核验'),para(gated?'当前章节暂无可确认的固定掉落。':d.evidence)));
  if(d.possibleMaterials.length){const ul=node('ul','supply-linked');for(const id of d.possibleMaterials){const m=matBy.get(id);if(!m||m.origin&&!isUnlocked(m.origin.chapter)){ul.append(node('li','','关联材料尚未解锁'));continue}
   ul.append(make('li','',[link('materials.html?focus='+esc(id),m.name,'supply-inline-link'),node('span','',' · 取材方向，不是固定掉落')]))}
   c.append(group('supply-detail',node('b','','可进一步调查的材料'),ul));
  }else{c.append(group('supply-detail',node('b','','建议'),para('暂不推演具体掉落。此类记录可能涉及救援、未知身份或生态观察。')))}
  c.append(group('supply-card-links',factLink(d.first),link('bestiary.html','查看章节解锁怪物图鉴 ↗','supply-read-link')));f.append(c);
 }
 host.replaceChildren(f);if(locked)host.append(group('supply-locked',node('b','','另外 '+locked+' 种魔物按第一篇阅读进度解锁'),para('目前没有正式的全怪物固定掉率表，不能把材料名称自动变成每只怪必掉。')));
 if(!hits.length)showEmpty(host,'没有匹配的魔物档案。');
 $('supply-count').textContent='魔物关联 '+hits.length+' 种 · 当前可查看 '+(hits.length-locked)+' 种';
}
function ingredientsBox(recipe){const d=node('div','supply-detail'),b=node('b','','示范材料用量（非游戏已定配方）'),ul=node('ul','supply-linked');for(const q of recipe.ingredients){ul.append(make('li','',[link('materials.html?focus='+esc(q.id),materialLabel(q.id),'supply-inline-link'),node('span','', ' ×'+q.qty)]))}d.append(b,ul);return d}
function makeRecipes(query,profession,material){
 const host=$('supply-list');
 const matched=db.recipes.filter(r=>(profession==='all'||r.career===profession)&&(!material||r.ingredients.some(i=>i.id===material)));
 const hidden=matched.filter(r=>!recipeReady(r)).length;
 const hits=applySearch(matched.filter(recipeReady),query,r=>r.name+' '+r.career+' '+r.output+' '+r.ingredients.map(i=>materialLabel(i.id)).join(' '));
 const f=document.createDocumentFragment();
 for(const r of hits){const c=card();c.append(group('supply-card-head',node('span','sa-num',r.kind),tag('未在正文确证','draft')),title(r.name),metaBar([tag(r.career+' Lv.'+r.lv,'neutral'),tag('设施 Lv.'+r.facility,'neutral')]));c.append(ingredientsBox(r));c.append(group('supply-detail',node('b','','拟达到的制作效果'),para(r.output)),para('制作限制：'+r.limits));
  const matched=db.orders.filter(o=>o.recipeId===r.id);if(matched.length)c.append(group('supply-card-links',link('orders.html?recipe='+esc(r.id),'订单模板 '+matched.length+' 项 ↗','supply-read-link')));f.append(c);
 }
 host.replaceChildren(f);if(hidden)host.append(group('supply-locked',node('b','','另有 '+hidden+' 项配方涉及后续尚未公开的材料'),para('配方名称、材料与工艺内容将随第一篇阅读进度开放。')));
 if(!hits.length&&!hidden)showEmpty(host,'没有匹配的配方样例。');
 $('supply-count').textContent='显示 '+hits.length+' / '+db.recipes.length+' 项配方草案';
}
function makeOrders(query,region,recipe){
 const host=$('supply-list'),hits=applySearch(db.orders.filter(o=>(region==='all'||o.cityId===region)&&(!recipe||o.recipeId===recipe)),query,o=>o.name+' '+o.client+' '+(cityBy.get(o.cityId)?.name||'')+' '+(recipeBy.get(o.recipeId)?.name||''));
 const f=document.createDocumentFragment();let locked=0;
 for(const o of hits){const city=cityBy.get(o.cityId),r=recipeBy.get(o.recipeId);if((city&&!isUnlocked(city.first))||(r&&!recipeReady(r))){locked++;continue}
  const c=card();
  c.append(group('supply-card-head',node('span','sa-num',city?.name||'区域待考'),tag('示例委托 · 非实际任务','draft')),title(o.name));
  c.append(metaBar([tag('委托方类型：'+o.client,'neutral'),tag('期限：'+o.deadline,'neutral')]));
  c.append(group('supply-detail',node('b','','委托内容'),para((r?.name||'工艺服务')+' · '+o.qty+' 件 / 组（样例需求）')));
  c.append(group('supply-detail',node('b','','验收与合同'),para(o.contract)));
  c.append(group('supply-detail',node('b','','报酬与成本'),para(o.trade)));
  c.append(moreSection('风险与剧情冲突',[o.conflict,'价格不预填统一数值，最终以采购成本、工时、运输与当地市场议价为准。']));
  c.append(group('supply-card-links',link('recipes.html?q='+esc(r?.name||''),'查看关联配方 ↗','supply-read-link'),link('city-economy.html?focus='+esc(o.cityId),'区域供需资料 ↗','supply-read-link')));
  f.append(c);
 }
 host.replaceChildren(f);if(locked)host.append(group('supply-locked',node('b','','还有 '+locked+' 份后续区域订单模板暂不显示'),para('这些只是工坊运营范例，不代表任何已登场NPC已发出该委托。')));
 if(!hits.length)showEmpty(host,'没有符合条件的订单模板。');
 $('supply-count').textContent='订单模板 '+hits.length+' 份 · 当前可查看 '+(hits.length-locked)+' 份';
}
function makeCities(query,kind,focus){
 const host=$('supply-list'),hits=applySearch(db.cities.filter(c=>(kind==='all'||c.type===kind)&&(!focus||c.id===focus)),query,c=>[c.id,c.name,c.type,c.production,...c.imports,...c.exports,...c.risks,...c.signals].join(' '));
 const f=document.createDocumentFragment();let locked=0;
 for(const c of hits){if(!isUnlocked(c.first)){locked++;continue}
  const a=card();a.append(group('supply-card-head',node('span','sa-num',c.type),tag('供需推演 · 非固定行情','model')),title(c.name),para(c.description),group('supply-detail',node('b','','产业与服务'),para(c.production)));
  const detail=make('div','supply-city-sides',[group('supply-detail',node('b','','主要输入需求'),make('ul','',c.imports.map(x=>node('li','',x)))),group('supply-detail',node('b','','可能输出供给'),make('ul','',c.exports.map(x=>node('li','',x))))]);a.append(detail);
  a.append(moreSection('价格推动因素、产业瓶颈与邻区联系',[...c.risks.map(x=>'瓶颈：'+x),...c.signals.filter((x,i)=>isUnlocked(c.signalReleases?.[i]||c.first)).map(x=>'因果：'+x),'联系区域：'+c.connections.join('、')]));
  const n=db.orders.filter(o=>o.cityId===c.id).length;
  a.append(group('supply-card-links',factLink(c.first),link('orders.html?region='+esc(c.id),'区域订单草案 '+n+' 份 ↗','supply-read-link')));
  f.append(a)
 }
 host.replaceChildren(f);if(locked)host.append(group('supply-locked',node('b','','另有 '+locked+' 个已建模地区随阅读进度逐步开放'),para('地区模型与物价属于推演，不是已发布小说中的官方经济统计。')));
 if(!hits.length)showEmpty(host,'没有对应的区域经济模型。');
 $('supply-count').textContent='区域模型 '+hits.length+' 项 · 当前可见 '+(hits.length-locked)+' 项';
 const cases=$('supply-events');if(cases){const f2=document.createDocumentFragment();let all=0;for(const e of db.exchanges){const city=cityBy.get(e.source);if((city&&!isUnlocked(city.first))||(e.minChapter&&!isUnlocked(e.minChapter)))continue;all++;const c=card();c.append(tag(e.quality,'model'),title(e.trigger),make('ol','supply-linked',e.impacts.map(x=>node('li','',x))),para(e.not));f2.append(c)}cases.replaceChildren(f2);if(!all)showEmpty(cases,'经济变化案例会按故事地区的阅读进度开放。');}
}
function setupSelectors(){const form=$('supply-filters');if(!form)return;
 const sel=$('supply-type');let options=[];
 if(view==='materials')options=[...new Set(db.materials.map(m=>m.kind))];
 if(view==='recipes')options=[...new Set(db.recipes.map(r=>r.career))];
 if(view==='orders')options=db.cities.map(c=>({value:c.id,label:c.name}));
 if(view==='cities')options=[...new Set(db.cities.map(c=>c.type))];
 for(const opt of options){const value=typeof opt==='string'?opt:opt.value,label=typeof opt==='string'?opt:opt.label;sel.add(new Option(label,value))}
 const q=$('supply-search'),mode=$('supply-mode'),p=new URLSearchParams(location.search),material=p.get('material')||'',recipe=p.get('recipe')||'',region=p.get('region')||'',focus=p.get('focus')||'';
 if(p.has('q'))q.value=(p.get('q')||'').slice(0,80);
 if(view==='materials'&&focus){q.value=focus}
 if(view==='orders'&&region&&options.some(x=>x.value===region))sel.value=region;
 function render(){const text=q.value.trim().slice(0,80),v=sel.value;
  if(view==='materials')makeMaterials(text,mode?.value||'all',v);
  if(view==='drops')makeDrops(text);
  if(view==='recipes')makeRecipes(text,v,material);
  if(view==='orders')makeOrders(text,v,recipe);
  if(view==='cities')makeCities(text,v,focus);
 }
 q.addEventListener('input',render);sel.addEventListener('change',render);mode?.addEventListener('change',render);window.addEventListener('storage',e=>{if(e.key===KEY)render()});document.addEventListener('zs:part-progress-changed',render);
 render();
}
async function init(){try{const r=await fetch('../assets/data/supply-chain.json?v=2',{cache:'no-cache'});if(!r.ok)throw Error('HTTP '+r.status);db=await r.json();if(!Array.isArray(db.materials)||!Array.isArray(db.cities)||!db.recipes.length)throw Error('schema');
 matBy=new Map(db.materials.map(x=>[x.id,x]));cityBy=new Map(db.cities.map(x=>[x.id,x]));recipeBy=new Map(db.recipes.map(x=>[x.id,x]));setupSelectors();
 }catch(e){root.replaceChildren(node('p','sa-empty','产业链资料库暂时无法读取，请检查网络后刷新。'));const c=$('supply-count');if(c)c.textContent='读取失败';}}
init();
})();