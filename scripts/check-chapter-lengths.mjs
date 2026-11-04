#!/usr/bin/env node
// 《第零序列》正文验收：3000—3500中文汉字/章。
// 用法：node scripts/check-chapter-lengths.mjs chapters/volume-11
import fs from 'node:fs';
import path from 'node:path';

const roots=process.argv.slice(2);
if(!roots.length){console.error('用法：node scripts/check-chapter-lengths.mjs chapters/volume-11');process.exit(2);}
const inputs=[];
for(const target of roots){
 if(!fs.existsSync(target)){console.error('路径不存在：'+target);process.exitCode=2;continue;}
 const st=fs.statSync(target);
 if(st.isDirectory()){
  for(const name of fs.readdirSync(target)){
   if(/^chapter-\d{3}\.html$/.test(name))inputs.push(path.join(target,name));
  }
 }else if(target.endsWith('.html'))inputs.push(target);
}
let failed=0;
for(const file of inputs){
 const html=fs.readFileSync(file,'utf8');
 const found=html.match(/<div class="article">([\s\S]*?)<div class="pager">/);
 if(!found){console.error('不合格：找不到正文 '+file);failed++;continue;}
 const plain=found[1]
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')
  .replace(/<[^>]*>/g,'')
  .replace(/&(?:amp|lt|gt|nbsp|quot|#\d+);/gi,' ');
 const n=(plain.match(/\p{Script=Han}/gu)||[]).length;
 const good=n>=3000&&n<=3500;
 console.log((good?'合格 ':'不合格 ')+n+'字 '+file);
 if(!good)failed++;
}
console.log('检查 '+inputs.length+' 章，不合格 '+failed+' 章。');
if(!inputs.length||failed)process.exitCode=1;
