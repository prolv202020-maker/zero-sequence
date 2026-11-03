/* 第零序列 · 动漫风原创配乐 + 听书系统 */
(() => {
  'use strict';

  const path = location.pathname.toLowerCase();
  const theme = path.includes('volume-01') ? {
    id:'rebirth', title:'第一卷 · 重返', subtitle:'ANIME / REBIRTH', chord:[220,329.63,440], accent:[523.25,659.25,783.99], color:'#e8c979'
  } : path.includes('volume-02') ? {
    id:'arrival', title:'第二卷 · 初临', subtitle:'ANIME / ADVENTURE', chord:[246.94,369.99,493.88], accent:[587.33,659.25,783.99,987.77], color:'#bfe6c8'
  } : path.includes('volume-03') ? {
    id:'undercurrent', title:'第三卷 · 暗流', subtitle:'ANIME / MYSTERY', chord:[196,293.66,392], accent:[493.88,587.33,698.46], color:'#cbbcf1'
  } : {
    id:'main', title:'第零序列 · 主题', subtitle:'ANIME / HEROIC FANTASY', chord:[220,329.63,440], accent:[523.25,659.25,783.99], color:'#e8c979'
  };

  const KEY_ENABLED='zs_audio_enabled';
  const KEY_VOLUME='zs_audio_volume';
  const KEY_RATE='zs_narration_rate';
  const KEY_READ_PREFIX='zs_read_progress:';
  let ctx=null, master=null, ambience=null;
  let persistent=[], timers=[], playing=false;
  let volume=Math.max(0,Math.min(1,parseFloat(localStorage.getItem(KEY_VOLUME)||'0.18')));

  // ---------- Shared visual styles ----------
  function styleUI(){
    if(document.getElementById('zs-audio-style')) return;
    const s=document.createElement('style');
    s.id='zs-audio-style';
    s.textContent=`
      .zs-audio{position:fixed;right:18px;bottom:18px;z-index:9999;width:min(330px,calc(100vw - 28px));display:flex;align-items:center;gap:11px;padding:11px 13px;border:1px solid rgba(232,201,121,.4);border-radius:16px;background:rgba(12,15,26,.9);box-shadow:0 14px 45px rgba(0,0,0,.34);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);font-family:inherit;color:#f6f1e7;transition:.25s ease}
      .zs-audio:hover{border-color:rgba(232,201,121,.78);transform:translateY(-1px)}
      .zs-audio button{width:42px;height:42px;flex:0 0 42px;border-radius:50%;border:1px solid rgba(232,201,121,.58);background:radial-gradient(circle at 35% 30%,rgba(232,201,121,.24),rgba(46,38,72,.9));color:#fff3d6;cursor:pointer;font-size:16px;line-height:1}
      .zs-audio .zs-copy{min-width:0;flex:1}.zs-audio .zs-title{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.04em}.zs-audio .zs-sub{margin-top:3px;font-size:9px;letter-spacing:.15em;color:#b9b5c6}.zs-audio .zs-wave{display:flex;align-items:end;gap:2px;height:14px;margin-top:5px}.zs-audio .zs-wave i{display:block;width:2px;height:5px;background:var(--zs-accent,#e8c979);opacity:.6;border-radius:2px}.zs-audio.is-playing .zs-wave i{animation:zsWave .72s ease-in-out infinite alternate}.zs-audio .zs-wave i:nth-child(2){animation-delay:.12s}.zs-audio .zs-wave i:nth-child(3){animation-delay:.24s}.zs-audio .zs-wave i:nth-child(4){animation-delay:.36s}.zs-audio .zs-wave i:nth-child(5){animation-delay:.48s}
      .zs-audio input[type=range]{width:64px;accent-color:#e8c979;opacity:.85}.zs-audio .zs-vol{font-size:10px;color:#aaa5b8;display:flex;align-items:center;gap:4px}
      @keyframes zsWave{from{height:3px;opacity:.4}to{height:13px;opacity:1}}

      .zs-narrator{margin:24px auto 30px;max-width:820px;border:1px solid rgba(232,201,121,.35);border-radius:18px;padding:16px 18px;background:linear-gradient(135deg,rgba(35,30,57,.72),rgba(15,18,30,.86));box-shadow:0 12px 32px rgba(0,0,0,.22);backdrop-filter:blur(12px)}
      .zs-narrator-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:12px}.zs-narrator-title{font-size:14px;font-weight:700;letter-spacing:.05em}.zs-narrator-status{font-size:11px;color:#aaa5b8;white-space:nowrap}
      .zs-narrator-controls{display:flex;align-items:center;flex-wrap:wrap;gap:8px}.zs-narrator button,.zs-narrator select{border:1px solid rgba(232,201,121,.42);background:rgba(16,18,30,.82);color:#f5efe4;border-radius:999px;padding:8px 12px;font:inherit;font-size:12px;cursor:pointer}.zs-narrator button:hover,.zs-narrator select:hover{border-color:rgba(232,201,121,.8)}.zs-narrator .zs-read-main{background:linear-gradient(135deg,rgba(118,83,196,.9),rgba(68,89,190,.9));border-color:rgba(214,202,255,.65);font-weight:700}.zs-narrator-note{margin-top:10px;font-size:10px;color:#8f8a9c;line-height:1.6}
      .article>p.zs-reading{position:relative;background:linear-gradient(90deg,rgba(126,93,211,.18),rgba(232,201,121,.10),transparent);border-radius:8px;box-shadow:-4px 0 0 rgba(232,201,121,.75);padding-left:12px!important;transition:.25s ease}.article>p.zs-read-done{opacity:.72}
      @media(max-width:560px){.zs-audio{right:10px;bottom:10px;width:calc(100vw - 20px)}.zs-audio input[type=range]{width:52px}.zs-narrator{margin:18px 0 26px;padding:14px}.zs-narrator-head{align-items:flex-start;flex-direction:column;gap:5px}.zs-narrator-controls{gap:7px}.zs-narrator button,.zs-narrator select{padding:8px 10px}}
    `;
    document.head.appendChild(s);
  }

  // ---------- Background music ----------
  function buildAudioUI(){
    if(document.getElementById('zs-audio')) return;
    styleUI();
    const box=document.createElement('div');
    box.id='zs-audio'; box.className='zs-audio';
    box.style.setProperty('--zs-accent',theme.color);
    box.innerHTML=`<button type="button" class="zs-play" aria-label="播放背景音乐">▶</button><div class="zs-copy"><div class="zs-title">${theme.title}</div><div class="zs-sub">${theme.subtitle}</div><div class="zs-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div><label class="zs-vol" title="音量">♫ <input class="zs-slider" type="range" min="0" max="1" step="0.01" value="${volume}"></label>`;
    document.body.appendChild(box);
    box.querySelector('.zs-play').addEventListener('click',async(e)=>{e.stopPropagation(); playing?stopMusic(true):await startMusic(true);});
    box.querySelector('.zs-slider').addEventListener('input',(e)=>{
      volume=parseFloat(e.target.value); localStorage.setItem(KEY_VOLUME,String(volume));
      if(master && ctx) master.gain.setTargetAtTime(volume,ctx.currentTime,.08);
    });
    if(localStorage.getItem(KEY_ENABLED)==='1'){
      box.querySelector('.zs-sub').textContent=theme.subtitle+' · 点击页面继续';
      const resume=async()=>{document.removeEventListener('pointerdown',resume,true); if(localStorage.getItem(KEY_ENABLED)==='1'&&!playing) await startMusic(false);};
      document.addEventListener('pointerdown',resume,true);
    }
  }

  function setAudioUI(on){
    const box=document.getElementById('zs-audio'); if(!box) return;
    box.classList.toggle('is-playing',on);
    const b=box.querySelector('.zs-play'); b.textContent=on?'Ⅱ':'▶'; b.setAttribute('aria-label',on?'暂停背景音乐':'播放背景音乐');
    box.querySelector('.zs-sub').textContent=theme.subtitle+(on?' · PLAYING':'');
  }

  function ensureAudio(){
    if(ctx) return;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC) throw new Error('Web Audio not supported');
    ctx=new AC(); master=ctx.createGain(); master.gain.value=volume;
    const comp=ctx.createDynamicsCompressor(); comp.threshold.value=-18; comp.knee.value=18; comp.ratio.value=3; comp.attack.value=.08; comp.release.value=.5;
    master.connect(comp).connect(ctx.destination);
  }
  function persistentOsc(freq,type,gain,detune=0,pan=0){
    const o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter(); o.type=type;o.frequency.value=freq;o.detune.value=detune;g.gain.value=gain;f.type='lowpass';f.frequency.value=1600;f.Q.value=.25;
    if(ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=pan;o.connect(f).connect(p).connect(g).connect(master);}else{o.connect(f).connect(g).connect(master);}o.start();persistent.push(o,g,f);return{o,g,f};
  }
  function noiseBed(level=.0035){const len=ctx.sampleRate*2,buffer=ctx.createBuffer(1,len,ctx.sampleRate),data=buffer.getChannelData(0);let x=0;for(let i=0;i<len;i++){x=.97*x+(Math.random()*2-1)*.08;data[i]=x;}const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=buffer;src.loop=true;filter.type='lowpass';filter.frequency.value=650;g.gain.value=level;src.connect(filter).connect(g).connect(master);src.start();persistent.push(src,filter,g);ambience=src;}
  function note(freq,when,dur=.7,gain=.025,type='triangle',pan=0){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,when);g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(gain,when+.018);g.gain.exponentialRampToValueAtTime(.0001,when+dur);if(ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=pan;o.connect(g).connect(p).connect(master);}else{o.connect(g).connect(master);}o.start(when);o.stop(when+dur+.05);}
  function bell(freq,when,gain=.018){note(freq,when,1.2,gain,'sine',-.15);note(freq*2.01,when+.012,.75,gain*.42,'sine',.15);}
  function startPads(){theme.chord.forEach((f,i)=>{persistentOsc(f/2,'sine',.010,i*2-2,(i-1)*.24);persistentOsc(f,'triangle',.0045,2-i,(1-i)*.15);});noiseBed(.0028);}
  function scheduleTheme(){const now=()=>ctx.currentTime+.03;let i=0;
    if(theme.id==='rebirth'){timers.push(setInterval(()=>{if(!playing)return;const seq=[0,1,2,1,0,2];bell(theme.accent[seq[i++%seq.length]],now(),.015);},1500));}
    else if(theme.id==='arrival'){timers.push(setInterval(()=>{if(!playing)return;const seq=[0,1,2,3,2,1,0,2];note(theme.accent[seq[i++%seq.length]],now(),.48,.018,'triangle',Math.sin(i*.7)*.35);},520));timers.push(setInterval(()=>{if(!playing)return;bell(theme.accent[2],now(),.009);},6200));}
    else if(theme.id==='undercurrent'){timers.push(setInterval(()=>{if(!playing)return;const seq=[0,1,2,1,0,2,1];note(theme.accent[seq[i++%seq.length]],now(),.72,.014,'triangle',Math.sin(i)*.25);},900));}
    else{timers.push(setInterval(()=>{if(!playing)return;const seq=[0,1,2,1,2,0];bell(theme.accent[seq[i++%seq.length]],now(),.014);},1250));}
  }
  async function startMusic(userAction){try{ensureAudio();await ctx.resume();if(playing)return;playing=true;persistent=[];timers=[];startPads();scheduleTheme();if(userAction)localStorage.setItem(KEY_ENABLED,'1');setAudioUI(true);}catch(err){const box=document.getElementById('zs-audio');if(box)box.querySelector('.zs-sub').textContent='浏览器暂不支持音频';}}
  function stopMusic(userAction){playing=false;timers.forEach(clearInterval);timers=[];persistent.forEach(n=>{try{if(n.stop)n.stop();}catch(e){}try{n.disconnect();}catch(e){}});persistent=[];if(userAction)localStorage.setItem(KEY_ENABLED,'0');setAudioUI(false);}
  function duckBGM(on){if(!master||!ctx||!playing)return;master.gain.setTargetAtTime(on?Math.min(volume,.045):volume,ctx.currentTime,on?.18:.35);}

  // ---------- Audiobook / narration ----------
  let synth=window.speechSynthesis||null;
  let paras=[],readIndex=0,reading=false,readPaused=false,currentUtterance=null;
  const readKey=KEY_READ_PREFIX+location.pathname;
  let readRate=parseFloat(localStorage.getItem(KEY_RATE)||'1');
  if(![0.8,1,1.2,1.5].includes(readRate)) readRate=1;

  function chooseVoice(){
    if(!synth)return null;
    const vs=synth.getVoices();
    return vs.find(v=>/zh[-_](CN|Hans)/i.test(v.lang)&&/xiaoxiao|yunxi|natural|premium|tingting|meijia/i.test(v.name)) ||
           vs.find(v=>/zh[-_](CN|Hans)/i.test(v.lang)) ||
           vs.find(v=>/^zh/i.test(v.lang)) || null;
  }
  function cleanText(t){return (t||'').replace(/\s+/g,' ').replace(/【/g,'“').replace(/】/g,'”').trim();}
  function updateReadStatus(text){const el=document.querySelector('.zs-narrator-status');if(el)el.textContent=text;}
  function updateReadButton(){const b=document.querySelector('.zs-read-main');if(!b)return;b.textContent=reading&&!readPaused?'⏸ 暂停':readPaused?'▶ 继续':'🎧 听本章';}
  function clearHighlight(){paras.forEach(p=>p.classList.remove('zs-reading'));}
  function highlight(i){clearHighlight();paras.forEach((p,n)=>p.classList.toggle('zs-read-done',n<i));const p=paras[i];if(!p)return;p.classList.add('zs-reading');p.scrollIntoView({behavior:'smooth',block:'center'});}
  function saveProgress(){localStorage.setItem(readKey,String(readIndex));}

  function speakParagraph(i){
    if(!synth||!paras.length)return;
    if(i<0)i=0;
    if(i>=paras.length){finishReading();return;}
    readIndex=i;saveProgress();highlight(i);
    const text=cleanText(paras[i].innerText);
    if(!text){speakParagraph(i+1);return;}
    const u=new SpeechSynthesisUtterance(text);currentUtterance=u;u.lang='zh-CN';u.rate=readRate;u.pitch=1.03;u.volume=1;
    const v=chooseVoice();if(v)u.voice=v;
    u.onstart=()=>{reading=true;readPaused=false;duckBGM(true);updateReadButton();updateReadStatus(`正在朗读 · ${i+1}/${paras.length}`);};
    u.onend=()=>{if(!reading||readPaused)return;speakParagraph(readIndex+1);};
    u.onerror=(e)=>{if(e.error==='canceled'||e.error==='interrupted')return;reading=false;duckBGM(false);updateReadButton();updateReadStatus('朗读暂时中断，点击继续');};
    synth.speak(u);
  }

  function startReading(){
    if(!synth){updateReadStatus('此浏览器暂不支持语音朗读');return;}
    if(readPaused){synth.resume();readPaused=false;reading=true;duckBGM(true);updateReadButton();updateReadStatus(`继续朗读 · ${readIndex+1}/${paras.length}`);return;}
    if(reading){synth.pause();readPaused=true;duckBGM(false);updateReadButton();updateReadStatus(`已暂停 · ${readIndex+1}/${paras.length}`);return;}
    const saved=parseInt(localStorage.getItem(readKey)||'0',10);readIndex=Number.isFinite(saved)&&saved>=0&&saved<paras.length?saved:0;
    synth.cancel();reading=true;speakParagraph(readIndex);
  }
  function stopReading(reset=false){if(!synth)return;synth.cancel();reading=false;readPaused=false;currentUtterance=null;duckBGM(false);clearHighlight();if(reset){readIndex=0;localStorage.removeItem(readKey);}updateReadButton();updateReadStatus(reset?'已回到本章开头':'已停止');}
  function moveReading(delta){if(!paras.length)return;const was=reading||readPaused;if(synth)synth.cancel();readPaused=false;reading=was;readIndex=Math.max(0,Math.min(paras.length-1,readIndex+delta));saveProgress();highlight(readIndex);if(was)speakParagraph(readIndex);else updateReadStatus(`定位到 ${readIndex+1}/${paras.length}`);}
  function finishReading(){if(synth)synth.cancel();reading=false;readPaused=false;readIndex=paras.length-1;saveProgress();duckBGM(false);updateReadButton();updateReadStatus('本章朗读完成 ✓');clearHighlight();}
  function changeRate(v){readRate=parseFloat(v);localStorage.setItem(KEY_RATE,String(readRate));const was=reading||readPaused;if(was){if(synth)synth.cancel();readPaused=false;reading=true;speakParagraph(readIndex);}updateReadStatus(`语速 ${readRate.toFixed(1)}×`);}

  function buildNarrator(){
    const article=document.querySelector('.article');
    if(!article||!synth||document.getElementById('zs-narrator'))return;
    paras=[...article.querySelectorAll(':scope > p')].filter(p=>cleanText(p.innerText).length>0);
    if(!paras.length)return;
    styleUI();
    const saved=parseInt(localStorage.getItem(readKey)||'0',10);if(Number.isFinite(saved)&&saved>=0&&saved<paras.length)readIndex=saved;
    const box=document.createElement('section');box.id='zs-narrator';box.className='zs-narrator';
    box.innerHTML=`<div class="zs-narrator-head"><div class="zs-narrator-title">🎧 听书模式 · 本章说书</div><div class="zs-narrator-status">${readIndex>0?`上次听到 ${readIndex+1}/${paras.length}`:`共 ${paras.length} 段`}</div></div><div class="zs-narrator-controls"><button type="button" class="zs-read-main">🎧 听本章</button><button type="button" class="zs-read-prev">← 上一段</button><button type="button" class="zs-read-next">下一段 →</button><select class="zs-rate" aria-label="朗读语速"><option value="0.8">0.8×</option><option value="1">1.0×</option><option value="1.2">1.2×</option><option value="1.5">1.5×</option></select><button type="button" class="zs-read-reset">↺ 从头听</button></div><div class="zs-narrator-note">使用设备自带中文语音朗读。朗读时背景音乐会自动降低，正在朗读的段落会高亮。</div>`;
    article.parentNode.insertBefore(box,article);
    box.querySelector('.zs-rate').value=String(readRate);
    box.querySelector('.zs-read-main').addEventListener('click',startReading);
    box.querySelector('.zs-read-prev').addEventListener('click',()=>moveReading(-1));
    box.querySelector('.zs-read-next').addEventListener('click',()=>moveReading(1));
    box.querySelector('.zs-read-reset').addEventListener('click',()=>{stopReading(true);highlight(0);});
    box.querySelector('.zs-rate').addEventListener('change',e=>changeRate(e.target.value));
    if(synth.onvoiceschanged!==undefined)synth.addEventListener?.('voiceschanged',()=>{}, {once:true});
  }

  window.addEventListener('pagehide',()=>{try{synth&&synth.cancel();}catch(e){}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&synth&&reading&&!readPaused){/* allow lock-screen/device TTS where supported */}});

  function init(){
    buildAudioUI();
    if(!document.querySelector('script[src*="reader-experience.js"]')){
      const reader=document.createElement('script');reader.src='/zero-sequence/assets/js/reader-experience.js?v=1';document.body.appendChild(reader);
    }
    // 单一情绪朗读界面由 narrator-pro.js 提供，避免先显示旧版播放器再替换
    if(document.querySelector('.article') && !document.querySelector('script[src*="narrator-pro.js"]')){
      const script=document.createElement('script');
      script.src='/zero-sequence/assets/js/narrator-pro.js?v=2';
      document.body.appendChild(script);
    }
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('/zero-sequence/sw.js').catch(()=>{});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
