/* 第零序列 · 武器与装备图鉴 / 章节事实逐步解锁 */
(()=>{'use strict';
const root=document.getElementById('gear-catalog'),final=document.getElementById('zs-gear-final');
if(!root&&!final)return;
const KEY='zs:part-progress:v1',source='../assets/data/equipment.json?v=3';
const iconFor={'武器':'⚔','盾与防具':'◇','机关构件':'⚙','工具与防护':'⌁','特殊辅助器具':'◈','特殊遗物':'✧','锻造材料':'◆','技术与制作':'✎'};
const by=(id)=>document.getElementById(id);
const em=(tag,cls,txt)=>{const a=document.createElement(tag);if(cls)a.className=cls;if(txt!==undefined)a.textContent=txt;return a;};
const link=(href,txt,cls)=>{const a=em('a',cls,txt);a.href=href;return a;};
let data=null;
function progress(p){try{const d=JSON.parse(localStorage.getItem(KEY)||'{}');return Math.max(0,Math.min(100,Number(d['p'+String(p).padStart(2,'0')]?.max)||0));}catch(e){return 0;}}
function getKnown(t){return t&&progress(t.part)>=t.chapter;}
function isKnown(e){return getKnown(e.discover);}
function src(ch){const v=String(ch.volume).padStart(2,'0'),n=String(ch.chapterInVolume).padStart(3,'0');return '../chapters/volume-'+v+'/chapter-'+n+'.html';}
function noteKnown(entry){return (entry.facts||[]).filter(getKnown);}
function makeCard(item){
 const card=em('article','gear-card');
 const row=em('div','gear-card-top'),badge=em('div','gear-glyph',iconFor[item.category]||'✧'),head=em('div','gear-card-head');
 badge.setAttribute('aria-hidden','true');
 head.append(em('small','gear-kind',item.category+' · '+item.route),em('h3','',item.name),em('p','gear-intro',item.summary));
 row.append(badge,head);card.append(row);
 const chips=em('div','gear-chips');
 chips.append(em('span','gear-chip','首次记录 · 第'+item.discover.volume+'卷第'+item.discover.chapterInVolume+'章'));
 chips.append(em('span','gear-chip',item.rarity?'品质：'+item.rarity:'品质：未明确'));
 card.append(chips);
 const detail=em('details','gear-info');
 detail.append(em('summary','', '查看属性状态、维护方式与剧情出处'));
 const inner=em('div','gear-info-inner');
 const fields=[['持有 / 相关人员',item.owner],['已知交易状态',item.trade],['成长路线',item.route]];
 for(const [label,value] of fields){const line=em('div','gear-entry');line.append(em('b','',label),em('span','',value));inner.append(line);}
 const facts=noteKnown(item);
 if(facts.length){inner.append(em('h4','','按阅读进度公开的观察记录'));const ul=em('ul','gear-observations');for(const fact of facts){const li=em('li');li.append(em('span','',fact.text),link(src(fact),'第'+fact.volume+'卷第'+fact.chapterInVolume+'章','gear-chapter-link'));ul.append(li);}inner.append(ul);}
 if(item.notes?.length){inner.append(em('h4','','档案备注'));for(const n of item.notes)inner.append(em('p','gear-caution',n));}
 detail.append(inner);card.append(detail);return card;
}
function makeLockedCard(i){const c=em('article','gear-card is-locked');c.append(em('div','gear-lock','⌑'),em('h3','','未解锁的装备档案'),em('p','gear-intro','对应章节尚未阅读。名称、属性与人物归属暂时隐藏。'));return c;}

function renderWeaponFramework(){
 const host=by('gear-framework');if(!host||!data.weaponFramework)return;
 const fw=data.weaponFramework;host.replaceChildren();
 const make=(tag,cls,txt)=>em(tag,cls,txt);
 const intro=make('p','gear-framework-intro',fw.introduction);host.append(intro);
 const tiers=make('div','gear-tier-grid');
 fw.tiers.forEach(t=>{const card=make('article','gear-tier');card.append(make('span','gear-tier-no',String(t.rank).padStart(2,'0')),make('h3','',t.name),make('p','',t.description));tiers.append(card);});
 host.append(tiers);
 const matrix=make('div','gear-framework-matrix');
 const sections=[['武器八项数据',fw.identity],['三种损坏指标',fw.durability],['损伤后的修理条件',fw.repair],['成长潜力',fw.potentials],['六种成长方式',fw.growth],['常见武备类型',fw.weaponForms],['材料来源',fw.materials],['武器变异',fw.mutations],['武器意识的四个阶段',fw.weaponConsciousness],['封印、碎片与遗物',fw.specialCases]];
 sections.forEach(([name,items])=>{const panel=make('section','gear-framework-panel');panel.append(make('h3','',name));const list=make('dl','');items.forEach(item=>{const row=make('div','gear-framework-row');row.append(make('dt','',item.name),make('dd','',item.detail));list.append(row);});panel.append(list);matrix.append(panel);});host.append(matrix);
 const footer=make('div','gear-framework-footer');footer.append(make('h3','','平衡与连续性规则'));const ul=make('ul','');fw.principles.forEach(s=>ul.append(make('li','',s)));footer.append(ul,make('p','',fw.example));host.append(footer);
 if(fw.enhancement){
  const guide=make('section','gear-framework-footer');guide.append(make('h3','','强化阶段 · 示例范围（未定案）'),make('p','',fw.enhancement.range));
  const band=make('div','gear-enhance-bands');for(const row of fw.enhancement.bands){const b=make('div','gear-enhance-band');b.append(make('b','',row.range),make('span','',row.name));band.append(b);}guide.append(band);
  const ul2=make('ul','');for(const line of fw.enhancement.warnings)ul2.append(make('li','',line));guide.append(ul2);host.append(guide);
 }
 if(Array.isArray(fw.characterDirections)){
  const wrap=make('section','gear-character-section'),title=make('h3','','七位核心人物 · 武器方向与连续性');
  wrap.append(title,make('p','gear-framework-intro','以下仅为创作适配方向，不是已获得装备或未来神器的正式名称。点击角色查看，已出现的武器和职业不会被覆盖。'));
  const grid=make('div','gear-character-grid');
  for(const item of fw.characterDirections){const detail=make('details','gear-character-dossier');const summary=make('summary','',item.name+' · '+item.publicProfession);
   detail.append(summary,make('p','',item.direction),make('p','gear-character-note',item.continuity));grid.append(detail);}
  wrap.append(grid);if(fw.continuityRules){const box=make('div','gear-framework-footer');box.append(make('h3','','正文一致性提醒'));const ul3=make('ul','');for(const line of fw.continuityRules)ul3.append(make('li','',line));box.append(ul3);wrap.append(box);}host.append(wrap);
 }
}

function renderSystem(){
 renderWeaponFramework();
 const rules=by('gear-rules');if(!rules)return;
 rules.replaceChildren();
 for(const r of data.principles){const card=em('article','gear-rule');card.append(em('h3','',r.title),em('p','',r.description));rules.append(card);}
 const steps=by('gear-life');steps.replaceChildren();
 for(const s of data.lifecycle){const wrap=em('article','gear-step');wrap.append(em('span','gear-stepno',String(s.order).padStart(2,'0')),em('h3','',s.title),em('small','',s.caption),em('p','',s.detail));steps.append(wrap);}
 const stages=by('gear-stages');stages.replaceChildren();
 for(let i=0;i<data.futureStages.length;i++){const s=data.futureStages[i],card=em('article','gear-stage');
 card.append(em('small','', 'PHASE '+String(i+1).padStart(2,'0')+' · '+s.release),em('h3','',s.stage),em('p','',s.detail));if(i>1)card.classList.add('future');
 stages.append(card);
 }
 const tier=by('gear-quality');tier.replaceChildren();
 const a=em('article','gear-quality-card');a.append(em('h3','','正文已确认'));for(const s of data.qualityScheme.confirmed)a.append(em('p','', '✓ '+s));
 const b=em('article','gear-quality-card');b.append(em('h3','','等待设定定案'));for(const s of data.qualityScheme.notFinalized)b.append(em('p','', '· '+s));
 tier.append(a,b);
 by('gear-quality-note').textContent=data.qualityScheme.policy;
}
function renderCatalog(){
 const known=data.entries.filter(isKnown),locked=data.entries.filter(e=>!isKnown(e)),list=by('gear-catalog');
 const category=by('gear-type').value,state=by('gear-status').value,query=String(by('gear-search').value||'').toLocaleLowerCase('zh-Hans').replace(/\s+/g,'');
 list.replaceChildren();
 const has=(item)=>[item.name,item.category,item.owner,item.route,item.summary,item.trade,...noteKnown(item).map(x=>x.text)].join(' ').toLocaleLowerCase('zh-Hans').replace(/\s+/g,'').includes(query);
 const shown=known.filter(e=>(category==='all'||e.category===category)&&has(e));
 by('gear-count').textContent='第一篇已解锁 '+known.length+' / '+data.entries.length+' 项 · 当前进度第 '+progress(1)+'/100 章';
 by('gear-progress').style.width=(known.length/data.entries.length*100)+'%';
 by('gear-progress-wrap').setAttribute('aria-valuenow',String(known.length));
 by('gear-progress-wrap').setAttribute('aria-valuemax',String(data.entries.length));
 if(state!=='locked'){for(const item of shown)list.append(makeCard(item));}
 if(state!=='unlocked'&&!query&&category==='all'&&locked.length){const title=em('div','gear-grid-head');title.append(em('h2','','尚未解锁'),em('p','','隐藏物品名称，避免提前剧透'));list.append(title);for(let i=0;i<locked.length;i++)list.append(makeLockedCard(i));}
 if(!list.children.length)list.append(em('p','gear-empty','没有符合条件的已公开物品。请更换筛选条件或继续阅读。'));
}
function renderFinal(){
 if(!final)return;final.replaceChildren();
 const num=data.entries.filter(isKnown).length;const b=em('div','gear-final-content');
 b.append(em('p','gear-final-count','已解锁 '+num+' / '+data.entries.length+' 项'),em('p','','武器、盾甲、材料、特殊物品和道具各自按章节开放；后期的规则接口会延续本体系，但尚未发布的装备不会提前出现。'),link('../archive/equipment.html','查看已解锁武器与装备图鉴 →','gear-mini-link'));
 final.append(b);
}
async function init(){
 try{const r=await fetch(source,{cache:'no-cache'});if(!r.ok)throw Error('missing');data=await r.json();if(!Array.isArray(data.entries)||!data.lifecycle)throw Error('schema');data.entries.sort((a,b)=>a.discover.part-b.discover.part||a.discover.chapter-b.discover.chapter||a.name.localeCompare(b.name,'zh-CN'));
 if(root){const types=by('gear-type');for(const cat of data.categories){const o=new Option(cat,cat);types.append(o);}
 const term=new URLSearchParams(location.search).get('q');if(term)by('gear-search').value=term.slice(0,70);
 by('gear-search').addEventListener('input',renderCatalog);types.addEventListener('change',renderCatalog);by('gear-status').addEventListener('change',renderCatalog);
 renderSystem();renderCatalog();}
 renderFinal();window.addEventListener('storage',(e)=>{if(e.key===KEY){if(root)renderCatalog();renderFinal();}});document.addEventListener('zs:part-progress-changed',()=>{if(root)renderCatalog();renderFinal();});
 }catch(e){if(root)root.replaceChildren(em('p','gear-empty','装备资料暂时无法读取，请检查网络或刷新页面。'));if(final)final.append(em('p','', '装备资料暂不可用。')); }
}
init();
})();