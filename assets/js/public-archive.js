/* 公开读者版：只读按章节确认的里程碑，不含作者内部设定。 */
(()=>{'use strict';
const main=document.querySelector('[data-public-archive]');
if(!main)return;
const root='/zero-sequence/',scope=main.dataset.scope||'';
const entries=window.ZSUnlock?.entries||[];
const get=p=>{try{if(window.ZSUnlock?.get)return window.ZSUnlock.get(p).max;const x=JSON.parse(localStorage.getItem('zs:part-progress:v1')||'{}');return Math.max(0,Math.min(100,Number(x['p'+String(p).padStart(2,'0')]?.max)||0));}catch{return 0}};
const el=(tag,cls,txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x};
const url=e=>{const v=(e.p-1)*10+Math.ceil(e.n/10),c=(e.n-1)%10+1;return root+'chapters/volume-'+String(v).padStart(2,'0')+'/chapter-'+String(c).padStart(3,'0')+'.html';};
const input=document.getElementById('public-archive-search'),target=document.getElementById('public-archive-records'),status=document.getElementById('public-archive-status');
if(!target)return;
function render(){
 const p1=get(1),p2=get(2),q=(input?.value||'').trim().toLowerCase();
 const visible=entries.filter(e=>(!scope||scope.split(',').includes(e.k))&&(e.p===1?p1:p2)>=e.n&&(!q||[e.t,e.d,e.k].join(' ').toLowerCase().includes(q)));
 target.replaceChildren();
 for(const e of visible){
  const card=el('article','pa-item');
  card.append(el('small','','第'+e.p+'篇 · 第'+e.n+'章后 · '+e.k),el('h3','',e.t),el('p','',e.d));
  const a=el('a','','阅读对应章节 →');a.href=url(e);card.append(a);target.append(card);
 }
 if(!visible.length)target.append(el('p','pa-empty','当前尚无符合条件的已解锁资料。阅读对应章节后将自动显示。'));
 status.textContent='第一篇 '+p1+'/100章 · 第二篇 '+p2+'/100章 · 当前显示 '+visible.length+' 条';
}
input?.addEventListener('input',render);
document.addEventListener('zs:part-progress-changed',render);
window.addEventListener('pageshow',render);
render();
})();