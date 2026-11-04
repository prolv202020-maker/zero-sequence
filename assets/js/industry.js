/* 第零序列 · 产业链数据库公开浏览器：不对候选设定作正文事实声明 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const mk=(tag,cls,value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=String(value);return e};
const tx=(label,value)=>{const p=mk('p','industry-detail');p.append(mk('b','',label+'：'),document.createTextNode(String(value||'尚未明确')));return p};
const tag=(value)=>mk('span','sa-chip',value);
let DB,filter='',q='';
const titleMap={materials:'材料',drops:'魔物取材',recipes:'锻造与生产配方',orders:'工坊订单',cities:'城市经济'};
const types=['materials','drops','recipes','orders','cities'];
const map={};
function lineCard(item,type){
 const box=mk('article','sa-card industry-entry'),name=mk('h3','',item.name),kind=mk('span','sa-label',type==='materials'?item.group:type==='drops'?item.kind:type==='recipes'?item.facility:type==='orders'?item.city:item.stage);
 box.append(kind,name);
 if(type==='materials'){
  box.append(tag(item.status),tx('区域',item.region),tx('来源',item.origin),tx('用途',item.role),tx('限制',item.notes),tx('品质',item.quality));
  if(item.chapter)box.append(tx('正文索引','第一篇第'+item.chapter+'章（仅确认材料的存在或提及，具体掉落与配方未必确认）'));
 } else if(type==='drops'){
  const monster=map.monsters[item.monsterId];const material=map.materials[item.materialId];
  box.append(tag(item.status),tx('相关生物',monster?.name||item.monsterId),tx('取材方式',item.method),tx('材料关系',material?.name||'未知／研究样本'),tx('谨慎说明',item.detail),tx('掉落概率','未设定；不能推断为必掉'));
  if(item.source)box.append(tx('证据边界','关联材料见第一篇第'+item.source+'章；不是每次击杀必掉'));
 } else if(type==='recipes'){
  box.append(tag(item.status),tx('成品',item.product),tx('使用工具',item.tools),tx('设施',item.facility+' Lv.'+item.minLevel+'（示例要求）'),tx('前提',item.prereq));
  const h=mk('h4','','材料清单');box.append(h);
  const ul=mk('ul','');for(const [id,amount] of item.required)ul.append(mk('li','',(map.materials[id]?.name||id)+' × '+amount+' 份（配方示例用量）'));box.append(ul);
  const d=mk('details');d.append(mk('summary','','查看制作工序、质量检验与失败代价'));
  const inside=mk('div','');inside.append(mk('h4','','制作工序'));const steps=mk('ol','');for(const st of item.steps)steps.append(mk('li','',st));inside.append(steps,tx('质量要求',item.checks),tx('失败代价',item.loss));d.append(inside);box.append(d);
 } else if(type==='orders'){
  const recipe=map.recipes[item.recipe];
  box.append(tag(item.status),tx('委托者',item.issuer),tx('所需工艺',recipe?.name||item.recipe),tx('目标数量',item.qty+' 份／件（示例）'),tx('交付期限',item.deadline),tx('结算方式',item.reward),tx('风险',item.risk),tx('触发原因',item.trigger));
 } else {
  box.append(tag(item.status),tx('地区',item.region),tx('产业',item.industry.join('、')),tx('输入资源',item.imports.join('、')),tx('输出服务／货物',item.exports.join('、')),tx('经营风险',item.hazards.join('、')),tx('联系区域',item.links.join('、')),tx('可能事件',item.event));
 }
 return box;
}
function show(type){filter=type;for(const b of document.querySelectorAll('[data-industrial-type]'))b.setAttribute('aria-pressed',String(b.dataset.industrialType===type));render()}
function render(){if(!DB)return;const result=$('industry-results');const arr=DB[filter].filter(it=>{const s=filter==='recipes'?JSON.stringify(it)+' '+it.required.map(([id])=>map.materials[id]?.name).join(' '):filter==='drops'?JSON.stringify(it)+' '+(map.monsters[it.monsterId]?.name||''):filter==='orders'?JSON.stringify(it)+' '+(map.recipes[it.recipe]?.name||''):JSON.stringify(it);return s.toLowerCase().includes(q.toLowerCase())});const frag=document.createDocumentFragment();for(const a of arr)frag.append(lineCard(a,filter));if(!arr.length)frag.append(mk('p','sa-empty','未找到匹配记录。试试「矿」「狼」「盾」「商路」等关键词。'));result.replaceChildren(frag);$('industry-result-count').textContent=titleMap[filter]+' · '+arr.length+' / '+DB[filter].length+' 条';}
function renderStats(){const c=DB.meta;$('industry-overview').replaceChildren(...[["材料",c.materialCount],["魔物取材",c.dropCount],["工艺配方",c.recipeCount],["工坊订单",c.orderCount],["地区经济",c.cityCount]].map(([name,n])=>{const box=mk('div','industry-stat');box.append(mk('strong','',n),mk('small','',name));return box}));}
function renderPrinciples(){const ul=mk('ol','industry-rules');for(const p of DB.economyRules)ul.append(mk('li','',p));$('industry-rules').replaceChildren(ul);}
async function init(){try{
 const [r,b]=await Promise.all([fetch('../assets/data/industry.json?v=1',{cache:'no-cache'}),fetch('../assets/data/bestiary.json?v=1',{cache:'no-cache'})]);if(!r.ok||!b.ok)throw Error('load');
 DB=await r.json();const beasts=await b.json();
 if(types.some(t=>!Array.isArray(DB[t])))throw Error('schema');
 map.materials=Object.fromEntries(DB.materials.map(i=>[i.id,i]));map.recipes=Object.fromEntries(DB.recipes.map(i=>[i.id,i]));map.monsters=Object.fromEntries(beasts.entries.map(i=>[i.id,i]));
 renderStats();renderPrinciples();document.querySelectorAll('[data-industrial-type]').forEach(el=>el.addEventListener('click',()=>show(el.dataset.industrialType)));
 $('industry-search').addEventListener('input',e=>{q=e.target.value.trim().slice(0,80);render()});
 const params=new URLSearchParams(location.search),t=params.get('tab');if(types.includes(t))filter=t;else filter='materials';const qry=params.get('q');if(qry){q=qry.slice(0,80);$('industry-search').value=q;}show(filter);
 }catch(err){$('industry-results').replaceChildren(mk('p','sa-empty','产业链数据库读取失败，请稍后刷新。'));$('industry-result-count').textContent='读取失败';}}
init();
})();