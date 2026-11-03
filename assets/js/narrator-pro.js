/* 第零序列 · 情绪说书引擎 V2 */
(() => {
  'use strict';
  const synth=window.speechSynthesis;
  if(!synth) return;

  const KEY_VOICE='zs_narrator_voice_v2';
  const KEY_RATE='zs_narration_rate';
  const KEY_STYLE='zs_narration_style_v2';
  const READ_KEY='zs_read_progress:'+location.pathname;

  let paras=[], paraIndex=0, sentenceIndex=0, sentences=[];
  let active=false, paused=false, runId=0, pauseTimer=null;
  let rate=parseFloat(localStorage.getItem(KEY_RATE)||'1');
  let style=localStorage.getItem(KEY_STYLE)||'anime';
  let voiceName=localStorage.getItem(KEY_VOICE)||'';
  let voices=[];

  const stylePresets={
    anime:{label:'动漫旁白',rate:1,pitch:1.02},
    warm:{label:'温柔叙事',rate:.94,pitch:1.06},
    heroic:{label:'热血冒险',rate:1.07,pitch:1.04},
    cinematic:{label:'沉浸电影感',rate:.91,pitch:.98}
  };

  function clean(t){return (t||'').replace(/\s+/g,' ').trim();}
  function splitSentences(text){
    text=clean(text);
    if(!text) return [];
    const out=[]; let buf='';
    for(const ch of text){
      buf+=ch;
      if(/[。！？!?；;]/.test(ch) || (ch==='…' && buf.endsWith('……'))){out.push(buf.trim());buf='';}
    }
    if(buf.trim()) out.push(buf.trim());
    return out.filter(Boolean);
  }

  function voiceScore(v){
    const n=(v.name||'').toLowerCase(), l=(v.lang||'').toLowerCase();
    let s=0;
    if(/^zh/.test(l)) s+=80;
    if(/zh-cn|zh_hans|cmn/.test(l)) s+=35;
    if(/natural|neural|premium|online/.test(n)) s+=60;
    if(/xiaoxiao|xiaoyi|yunxi|yunjian|yunyang|xiaohan|xiaomo/.test(n)) s+=55;
    if(/microsoft/.test(n)) s+=25;
    if(/google/.test(n)) s+=22;
    if(/tingting|meijia|sin-ji|li-mu/.test(n)) s+=18;
    if(v.localService===false) s+=8;
    return s;
  }

  function refreshVoices(){
    voices=synth.getVoices().filter(v=>/^zh|cmn/i.test(v.lang||''));
    voices.sort((a,b)=>voiceScore(b)-voiceScore(a));
    const sel=document.querySelector('.zs-pro-voice');
    if(!sel) return;
    const current=voiceName;
    sel.innerHTML='';
    if(!voices.length){const o=document.createElement('option');o.textContent='系统中文声音';o.value='';sel.appendChild(o);return;}
    voices.forEach((v,i)=>{const o=document.createElement('option');o.value=v.name;o.textContent=(i===0?'★ ':'')+v.name;sel.appendChild(o);});
    if(current && voices.some(v=>v.name===current)) sel.value=current;
    else {voiceName=voices[0].name;sel.value=voiceName;localStorage.setItem(KEY_VOICE,voiceName);}
    updateVoiceHint();
  }

  function selectedVoice(){return voices.find(v=>v.name===voiceName)||voices[0]||null;}

  function classify(text){
    const t=text;
    if(/[【】]/.test(t) || /^\s*[\[【]/.test(t)) return {name:'系统',rate:.91,pitch:.92,pause:300};
    if(/[！!]/.test(t) || /冲|杀|爆|斩|吼|怒|猛地|骤然|雷霆|火焰|冲锋|战斗|剑|砸|轰/.test(t)) return {name:'热血',rate:1.10,pitch:1.07,pause:150};
    if(/[？?]/.test(t)) return {name:'疑问',rate:.97,pitch:1.10,pause:250};
    if(/……|沉默|安静|黑暗|未知|不对|异常|秘密|低声|皱眉|盯着/.test(t)) return {name:'悬念',rate:.88,pitch:.96,pause:390};
    if(/死|失去|眼泪|哭|痛|绝望|最后|再也|害怕|颤|离开|没能/.test(t)) return {name:'悲伤',rate:.86,pitch:.94,pause:430};
    if(/笑|温柔|轻声|放心|喜欢|拥抱|等你|回来|谢谢|没事|很好/.test(t)) return {name:'温柔',rate:.92,pitch:1.08,pause:310};
    if(/[“”「」]/.test(t) || /：“|说：“|问：“|道：“/.test(t)) return {name:'对白',rate:.97,pitch:1.055,pause:230};
    if(/。$/.test(t)) return {name:'旁白',rate:.96,pitch:1.01,pause:240};
    return {name:'旁白',rate:.97,pitch:1.01,pause:210};
  }

  function prosody(text){
    const e=classify(text), p=stylePresets[style]||stylePresets.anime;
    return {name:e.name,rate:Math.max(.65,Math.min(1.55,rate*p.rate*e.rate)),pitch:Math.max(.65,Math.min(1.4,p.pitch*e.pitch)),pause:e.pause};
  }

  function duck(on){
    const slider=document.querySelector('.zs-slider');
    if(!slider) return;
    if(on){if(slider.dataset.beforeNarration==null) slider.dataset.beforeNarration=slider.value; slider.value=Math.min(parseFloat(slider.value||'.18'),.05); slider.dispatchEvent(new Event('input',{bubbles:true}));}
    else if(slider.dataset.beforeNarration!=null){slider.value=slider.dataset.beforeNarration;delete slider.dataset.beforeNarration;slider.dispatchEvent(new Event('input',{bubbles:true}));}
  }

  function status(t){const e=document.querySelector('.zs-pro-status');if(e)e.textContent=t;}
  function mainLabel(){const b=document.querySelector('.zs-pro-main');if(b)b.textContent=active&&!paused?'⏸ 暂停':paused?'▶ 继续':'🎧 有感情朗读';}
  function clearMarks(){paras.forEach(p=>p.classList.remove('zs-pro-reading','zs-pro-done'));}
  function mark(i){paras.forEach((p,n)=>{p.classList.toggle('zs-pro-reading',n===i);p.classList.toggle('zs-pro-done',n<i);});const p=paras[i];if(p)p.scrollIntoView({behavior:'smooth',block:'center'});}
  function save(){localStorage.setItem(READ_KEY,String(paraIndex));}

  function speakCurrent(myRun){
    if(!active||paused||myRun!==runId) return;
    if(paraIndex>=paras.length){finish();return;}
    if(!sentences.length){sentences=splitSentences(paras[paraIndex].innerText);sentenceIndex=0;mark(paraIndex);save();}
    if(sentenceIndex>=sentences.length){paraIndex++;sentences=[];sentenceIndex=0;setTimeout(()=>speakCurrent(myRun),260);return;}

    const text=sentences[sentenceIndex];
    const pr=prosody(text);
    const u=new SpeechSynthesisUtterance(text);
    u.lang='zh-CN';u.rate=pr.rate;u.pitch=pr.pitch;u.volume=1;
    const v=selectedVoice();if(v)u.voice=v;
    u.onstart=()=>{status(`${pr.name} · ${paraIndex+1}/${paras.length}`);};
    u.onend=()=>{
      if(!active||paused||myRun!==runId) return;
      sentenceIndex++;
      clearTimeout(pauseTimer);
      pauseTimer=setTimeout(()=>speakCurrent(myRun),pr.pause);
    };
    u.onerror=e=>{if(/canceled|interrupted/.test(e.error||''))return;status('朗读中断，点继续即可');active=false;paused=false;duck(false);mainLabel();};
    synth.speak(u);
  }

  function start(){
    if(paused){synth.resume();paused=false;active=true;duck(true);mainLabel();status('继续朗读');return;}
    if(active){synth.pause();paused=true;duck(false);mainLabel();status(`已暂停 · ${paraIndex+1}/${paras.length}`);return;}
    runId++;synth.cancel();clearTimeout(pauseTimer);
    active=true;paused=false;sentences=[];sentenceIndex=0;duck(true);mainLabel();speakCurrent(runId);
  }

  function stop(reset=false){runId++;clearTimeout(pauseTimer);synth.cancel();active=false;paused=false;sentences=[];sentenceIndex=0;duck(false);if(reset){paraIndex=0;localStorage.removeItem(READ_KEY);}mainLabel();status(reset?'已回到本章开头':'已停止');if(reset)mark(0);}
  function move(d){runId++;clearTimeout(pauseTimer);synth.cancel();paraIndex=Math.max(0,Math.min(paras.length-1,paraIndex+d));sentences=[];sentenceIndex=0;save();mark(paraIndex);if(active&&!paused){const r=++runId;setTimeout(()=>speakCurrent(r),120);}else status(`定位到 ${paraIndex+1}/${paras.length}`);}
  function finish(){runId++;synth.cancel();active=false;paused=false;duck(false);mainLabel();status('本章朗读完成 ✓');clearMarks();}

  function preview(){
    runId++;synth.cancel();
    const sample='新的世界已经开启。顾长渊握紧剑柄，抬头看向晨星镇之外的天空——这一次，他不会再让命运替自己选择。';
    const ss=splitSentences(sample);let i=0;const r=runId;
    function next(){if(r!==runId||i>=ss.length)return;const text=ss[i++],pr=prosody(text),u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=pr.rate;u.pitch=pr.pitch;const v=selectedVoice();if(v)u.voice=v;u.onend=()=>setTimeout(next,pr.pause);synth.speak(u);}next();
    status('正在试听当前声线');
  }

  function updateVoiceHint(){const n=document.querySelector('.zs-pro-voice-hint');if(n)n.textContent=selectedVoice()?`当前声线：${selectedVoice().name}`:'将使用设备默认中文声线';}

  function injectStyle(){
    if(document.getElementById('zs-pro-style'))return;
    const s=document.createElement('style');s.id='zs-pro-style';s.textContent=`
    .zs-pro{margin:24px auto 30px;max-width:840px;padding:17px 18px;border:1px solid rgba(139,164,255,.42);border-radius:20px;background:linear-gradient(135deg,rgba(34,42,82,.78),rgba(28,20,55,.82));box-shadow:0 14px 38px rgba(0,0,0,.24);backdrop-filter:blur(12px)}
    .zs-pro-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px}.zs-pro-title{font-weight:800;font-size:14px}.zs-pro-status{font-size:11px;color:#bbb8cc}.zs-pro-controls{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.zs-pro button,.zs-pro select{border:1px solid rgba(224,211,255,.38);border-radius:999px;background:rgba(15,18,35,.76);color:#f6f1ff;padding:8px 11px;font:inherit;font-size:12px;cursor:pointer}.zs-pro button:hover,.zs-pro select:hover{border-color:rgba(236,223,255,.8)}.zs-pro-main{font-weight:800!important;background:linear-gradient(135deg,#7869d8,#4d82d8)!important}.zs-pro-note{margin-top:10px;color:#9f9ab1;font-size:10px;line-height:1.6}.zs-pro-voice-hint{margin-top:6px;color:#b9b3ca;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .article>p.zs-pro-reading{background:linear-gradient(90deg,rgba(95,128,255,.17),rgba(203,166,255,.12),transparent);box-shadow:-4px 0 0 rgba(168,190,255,.8);border-radius:8px;padding-left:12px!important;transition:.25s}.article>p.zs-pro-done{opacity:.76}
    @media(max-width:560px){.zs-pro{margin:18px 0 26px;padding:14px}.zs-pro-head{align-items:flex-start;flex-direction:column;gap:5px}.zs-pro button,.zs-pro select{padding:8px 10px}}
    `;document.head.appendChild(s);
  }

  function build(){
    const article=document.querySelector('.article');if(!article)return;
    const old=document.getElementById('zs-narrator');if(old)old.remove();
    document.querySelectorAll('.article>p').forEach(p=>p.classList.remove('zs-reading','zs-read-done'));
    paras=[...article.querySelectorAll(':scope > p')].filter(p=>clean(p.innerText));if(!paras.length)return;
    const saved=parseInt(localStorage.getItem(READ_KEY)||'0',10);if(Number.isFinite(saved)&&saved>=0&&saved<paras.length)paraIndex=saved;
    injectStyle();
    const box=document.createElement('section');box.id='zs-pro';box.className='zs-pro';
    box.innerHTML=`<div class="zs-pro-head"><div class="zs-pro-title">🎙️ 情绪说书 · 动漫朗读 V2</div><div class="zs-pro-status">${paraIndex?`上次听到 ${paraIndex+1}/${paras.length}`:`共 ${paras.length} 段`}</div></div><div class="zs-pro-controls"><button class="zs-pro-main" type="button">🎧 有感情朗读</button><button class="zs-pro-prev" type="button">← 上一段</button><button class="zs-pro-next" type="button">下一段 →</button><select class="zs-pro-style-select" title="朗读风格"><option value="anime">动漫旁白</option><option value="warm">温柔叙事</option><option value="heroic">热血冒险</option><option value="cinematic">沉浸电影感</option></select><select class="zs-pro-rate" title="基础语速"><option value="0.8">0.8×</option><option value="1">1.0×</option><option value="1.2">1.2×</option><option value="1.5">1.5×</option></select><select class="zs-pro-voice" title="中文声线"></select><button class="zs-pro-preview" type="button">▷ 试听</button><button class="zs-pro-reset" type="button">↺ 从头</button></div><div class="zs-pro-note">会自动识别热血、温柔、悲伤、悬念、对白、疑问与系统提示，并调整停顿、语速和音高。设备里的自然中文声线越好，效果越接近真人。</div><div class="zs-pro-voice-hint"></div>`;
    article.parentNode.insertBefore(box,article);
    box.querySelector('.zs-pro-style-select').value=style;box.querySelector('.zs-pro-rate').value=String(rate);
    box.querySelector('.zs-pro-main').onclick=start;box.querySelector('.zs-pro-prev').onclick=()=>move(-1);box.querySelector('.zs-pro-next').onclick=()=>move(1);box.querySelector('.zs-pro-preview').onclick=preview;box.querySelector('.zs-pro-reset').onclick=()=>stop(true);
    box.querySelector('.zs-pro-style-select').onchange=e=>{style=e.target.value;localStorage.setItem(KEY_STYLE,style);status(`风格：${stylePresets[style].label}`);if(active&&!paused){runId++;synth.cancel();sentences=[];sentenceIndex=0;const r=runId;setTimeout(()=>speakCurrent(r),120);}};
    box.querySelector('.zs-pro-rate').onchange=e=>{rate=parseFloat(e.target.value);localStorage.setItem(KEY_RATE,String(rate));status(`基础语速 ${rate.toFixed(1)}×`);if(active&&!paused){runId++;synth.cancel();sentences=[];sentenceIndex=0;const r=runId;setTimeout(()=>speakCurrent(r),120);}};
    box.querySelector('.zs-pro-voice').onchange=e=>{voiceName=e.target.value;localStorage.setItem(KEY_VOICE,voiceName);updateVoiceHint();status('已切换声线，可点试听');};
    refreshVoices();
  }

  if('onvoiceschanged' in synth)synth.addEventListener('voiceschanged',refreshVoices);
  window.addEventListener('pagehide',()=>{runId++;clearTimeout(pauseTimer);try{synth.cancel();}catch(e){}});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(build,0));else setTimeout(build,0);
})();
