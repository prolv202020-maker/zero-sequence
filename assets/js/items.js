/* 第零序列 · 道具图鉴 — 来自统一 JSON 资料库 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const el=(tag,className,text)=>{const x=document.createElement(tag);if(className)x.className=className;if(text!==undefined)x.textContent=String(text);return x;};
const list=(items)=>{const ul=el('ul');for(const item of items)ul.append(el('li','',item));return ul;};
const color=['#aeb9cd','#97d5af','#73b8ec','#bd9dff','#e6b679','#ffd19b','#f0a7d9','#9be9e4','#e5b4fc','#f0d5a0'];
let data;
function renderTiers(){const host=$('items-tiers');const frag=document.createDocumentFragment();for(const tier of data.quality){const c=el('div','sa-tier'),n=el('span','',String(tier.rank).padStart(2,'0')),name=el('strong','',tier.name);c.style.setProperty('--tier',color[tier.rank-1]);c.append(n,name);frag.append(c);}host.replaceChildren(frag);}
function renderCategories(query=''){
 const host=$('items-categories');const found=data.categories.filter(c=>[c.name,c.en,c.brief,...c.examples,...c.rules].join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase()));
 const frag=document.createDocumentFragment();
 for(const cat of found){const card=el('article','sa-card');
  const ico=el('div','sa-icon',cat.icon),small=el('div','sa-label',cat.en),title=el('h3','',String(cat.no).padStart(2,'0')+' / '+cat.name),brief=el('p','',cat.brief);
  card.append(ico,small,title,brief,el('span','sa-chip','常见内容'));
  card.append(list(cat.examples));
  const details=el('details',''),summary=el('summary','','使用规则与限制'),wrap=el('div','');
  wrap.append(list(cat.rules));details.append(summary,wrap);details.style.cssText='margin-top:15px;border-top:1px solid #ffffff27;padding-top:12px;color:#f2d5a3;font-size:12px';
  card.append(details);frag.append(card);
 }
 host.replaceChildren(frag);$('items-counter').textContent='显示 '+found.length+' / '+data.categories.length+' 大类';
 if(!found.length)host.append(el('p','sa-empty','没有找到对应分类，请尝试搜索「药剂」「地图」「契约」等。'));
}
function renderData(){const host=$('items-data');const head=el('thead'),hr=el('tr');hr.append(el('th','','数据字段'),el('th','','用途'));head.append(hr);const tbody=el('tbody');
 for(const item of data.dataFields){const tr=el('tr');tr.append(el('td','',item.name),el('td','',item.detail));tbody.append(tr);}const table=el('table','sa-table');table.append(head,tbody);host.replaceChildren(table);}
function renderSmallCards(id,arr){const host=$(id),frag=document.createDocumentFragment();for(let i=0;i<arr.length;i++){const item=arr[i],card=el('article','sa-card');card.append(el('span','sa-num',String(i+1).padStart(2,'0')),el('h3','',item.name),el('p','',item.detail));frag.append(card);}host.replaceChildren(frag);}
function renderRows(id,arr){const host=$(id),table=el('table','sa-table'),thead=el('thead'),h=el('tr');h.append(el('th','','分类或状态'),el('th','','规则说明'));thead.append(h);const body=el('tbody');for(const x of arr){const row=el('tr');row.append(el('td','',x.name),el('td','',x.detail));body.append(row);}table.append(thead,body);host.replaceChildren(table);}
function renderEras(){const host=$('items-eras');const frag=document.createDocumentFragment();data.eras.forEach((o,i)=>{const a=el('article');a.append(el('span','sa-num','STAGE '+String(i+1).padStart(2,'0')),el('h3','',o.name),el('p','',o.detail));frag.append(a)});host.replaceChildren(frag);}
function renderCast(){const host=$('items-cast');const frag=document.createDocumentFragment();for(const o of data.characterDirections){const d=el('details');d.append(el('summary','',o.name+' · 可能的道具方向'),el('p','',o.items+'。'+o.warning));frag.append(d);}host.replaceChildren(frag);}
function renderRules(){const host=$('items-principles');const frag=document.createDocumentFragment();for(const line of data.rules)frag.append(el('div','sa-point',line));host.replaceChildren(frag);}
async function init(){try{const r=await fetch('../assets/data/items.json?v=1',{cache:'no-cache'});if(!r.ok)throw Error('HTTP '+r.status);data=await r.json();if(data.categories?.length!==12)throw Error('category data');
 renderTiers();renderData();renderCategories();renderSmallCards('items-growth',data.growth);renderSmallCards('items-potentials',data.potentials);renderRows('items-bindings',data.bindings);renderRows('items-acquisition',data.acquisitions);renderEras();renderCast();renderRules();
 const input=$('items-search');input.addEventListener('input',()=>renderCategories(input.value.trim().slice(0,80)));
 const q=new URLSearchParams(location.search).get('q');if(q){input.value=q.slice(0,80);renderCategories(input.value);}
 }catch(err){const host=$('items-categories');host.replaceChildren(el('p','sa-empty','道具数据库暂时无法加载，请稍后刷新重试。'));$('items-counter').textContent='资料读取失败';}}
init();
})();