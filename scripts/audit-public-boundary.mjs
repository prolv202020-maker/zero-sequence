#!/usr/bin/env node
/**
 * 第零序列：公开站点发布边界检查。
 * This is a guardrail, NOT a security boundary. Public git history is still public.
 * Run: node scripts/audit-public-boundary.mjs
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const privateRoots=['author-private','private','drafts','unpublished','internal','notes-private'];
const ignored=new Set(['.git','node_modules','.github']);
const hard=[];
const review=[];
const list=[];
function walk(dir){
  for(const d of readdirSync(dir,{withFileTypes:true})){
    if(ignored.has(d.name))continue;
    const path=join(dir,d.name),rel=relative(root,path).replaceAll('\\','/');
    if(privateRoots.some(p=>rel===p||rel.startsWith(p+'/'))){hard.push(rel+' : private author source in public repository');continue;}
    if(d.isDirectory())walk(path);
    else if(d.isFile())list.push(rel);
  }
}
walk(root);
const checks=[
  ['draft or internal editorial notation',/(?:作者内部|内部设定|创作草案|未确认设定|作者私密|剧情备选|作者专用)/g],
  ['potential forward-looking spoiler',/(?:未来结局|终局秘密|尚未揭晓的真相|后期隐藏能力|隐藏终局)/g]
];
const reviewFiles=/^(?:archive\/|assets\/data\/|parts\/|WRITING_STANDARD\.md$)/;
for(const rel of list){
  if(/\.(?:private|internal)\.(?:md|json|txt)$/i.test(rel)||/\.author-only\.md$/i.test(rel))
    hard.push(rel+' : private-file naming pattern in public repository');
  if(!reviewFiles.test(rel)||!/\.(?:html|js|json|md)$/.test(rel))continue;
  const text=readFileSync(join(root,rel),'utf8');
  const findings=checks.filter(([,rx])=>{rx.lastIndex=0;return rx.test(text)}).map(x=>x[0]);
  if(findings.length)review.push({file:rel,reason:findings.join(', ')});
}
console.log('[PUBLIC BOUNDARY] Inspected '+list.length+' files');
console.log('[PUBLIC BOUNDARY] Hard violations: '+hard.length);
hard.forEach(x=>console.error('ERROR '+x));
console.log('[PUBLIC BOUNDARY] Manual review candidates: '+review.length);
review.forEach(x=>console.warn('REVIEW '+x.file+' : '+x.reason));
console.log('Reminder: CSS locks, localStorage and JavaScript cannot protect information in a public git repository.');
console.log('An author-only private repository and cleanup of public history are required for full separation.');
process.exitCode=hard.length?1:0;
