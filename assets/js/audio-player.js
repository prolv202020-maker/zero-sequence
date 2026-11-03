/* 第零序列 · 原创浏览器生成配乐系统 */
(() => {
  'use strict';

  const path = location.pathname.toLowerCase();
  const theme = path.includes('volume-01') ? {
    id:'rebirth', title:'第一卷 · 重返', subtitle:'TIME / REBIRTH', chord:[110,164.81,220], accent:[440,523.25,659.25], color:'#d9c49c'
  } : path.includes('volume-02') ? {
    id:'arrival', title:'第二卷 · 初临', subtitle:'ARRIVAL / ADVENTURE', chord:[82.41,123.47,164.81], accent:[329.63,392,493.88,587.33], color:'#c9d9b8'
  } : path.includes('volume-03') ? {
    id:'undercurrent', title:'第三卷 · 暗流', subtitle:'CITY / UNDERCURRENT', chord:[69.30,103.83,138.59], accent:[277.18,311.13,415.30], color:'#b5a6cf'
  } : {
    id:'main', title:'第零序列 · 主题', subtitle:'THE ZERO SEQUENCE', chord:[73.42,110,146.83], accent:[293.66,349.23,440], color:'#d9c49c'
  };

  const KEY_ENABLED='zs_audio_enabled';
  const KEY_VOLUME='zs_audio_volume';
  let ctx=null, master=null, ambience=null;
  let persistent=[], timers=[], playing=false;
  let volume=Math.max(0,Math.min(1,parseFloat(localStorage.getItem(KEY_VOLUME)||'0.22')));

  function registerSW(){
    if('serviceWorker' in navigator && location.protocol==='https:'){
      navigator.serviceWorker.register('/zero-sequence/sw.js',{scope:'/zero-sequence/'}).catch(()=>{});
    }
  }

  function styleUI(){
    if(document.getElementById('zs-audio-style')) return;
    const s=document.createElement('style');
    s.id='zs-audio-style';
    s.textContent=`
      .zs-audio{position:fixed;right:18px;bottom:18px;z-index:9999;width:min(330px,calc(100vw - 28px));display:flex;align-items:center;gap:11px;padding:11px 13px;border:1px solid rgba(217,196,156,.38);border-radius:16px;background:rgba(10,12,20,.88);box-shadow:0 14px 45px rgba(0,0,0,.38);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);font-family:inherit;color:#f2eee5;transition:.25s ease}
      .zs-audio:hover{border-color:rgba(217,196,156,.7);transform:translateY(-1px)}
      .zs-audio button{width:42px;height:42px;flex:0 0 42px;border-radius:50%;border:1px solid rgba(217,196,156,.55);background:radial-gradient(circle at 35% 30%,rgba(217,196,156,.22),rgba(35,27,51,.86));color:#f4ead4;cursor:pointer;font-size:16px;line-height:1;box-shadow:inset 0 0 18px rgba(217,196,156,.06)}
      .zs-audio .zs-copy{min-width:0;flex:1}.zs-audio .zs-title{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.04em}.zs-audio .zs-sub{margin-top:3px;font-size:9px;letter-spacing:.16em;color:#a9a5b3}.zs-audio .zs-wave{display:flex;align-items:end;gap:2px;height:14px;margin-top:5px}.zs-audio .zs-wave i{display:block;width:2px;height:5px;background:var(--zs-accent,#d9c49c);opacity:.55;border-radius:2px}.zs-audio.is-playing .zs-wave i{animation:zsWave .85s ease-in-out infinite alternate}.zs-audio .zs-wave i:nth-child(2){animation-delay:.12s}.zs-audio .zs-wave i:nth-child(3){animation-delay:.24s}.zs-audio .zs-wave i:nth-child(4){animation-delay:.36s}.zs-audio .zs-wave i:nth-child(5){animation-delay:.48s}
      .zs-audio input[type=range]{width:64px;accent-color:#d9c49c;opacity:.8}.zs-audio .zs-vol{font-size:10px;color:#8f8998;display:flex;align-items:center;gap:4px}
      @keyframes zsWave{from{height:3px;opacity:.35}to{height:13px;opacity:.9}}
      @media(max-width:560px){.zs-audio{right:10px;bottom:10px;width:calc(100vw - 20px)}.zs-audio input[type=range]{width:52px}}
    `;
    document.head.appendChild(s);
  }

  function buildUI(){
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

  function setUI(on){
    const box=document.getElementById('zs-audio'); if(!box) return;
    box.classList.toggle('is-playing',on);
    const b=box.querySelector('.zs-play'); b.textContent=on?'Ⅱ':'▶'; b.setAttribute('aria-label',on?'暂停背景音乐':'播放背景音乐');
    box.querySelector('.zs-sub').textContent=theme.subtitle+(on?' · PLAYING':'');
  }

  function ensureAudio(){
    if(ctx) return;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC) throw new Error('Web Audio not supported');
    ctx=new AC();
    master=ctx.createGain(); master.gain.value=volume;
    const comp=ctx.createDynamicsCompressor(); comp.threshold.value=-18; comp.knee.value=18; comp.ratio.value=3; comp.attack.value=.08; comp.release.value=.5;
    master.connect(comp).connect(ctx.destination);
  }

  function persistentOsc(freq,type,gain,detune=0,pan=0){
    const o=ctx.createOscillator(), g=ctx.createGain(), f=ctx.createBiquadFilter();
    o.type=type; o.frequency.value=freq; o.detune.value=detune; g.gain.value=gain; f.type='lowpass'; f.frequency.value=900; f.Q.value=.3;
    let dest=f;
    if(ctx.createStereoPanner){const p=ctx.createStereoPanner(); p.pan.value=pan; f.connect(p); p.connect(g);} else f.connect(g);
    o.connect(f); g.connect(master); o.start(); persistent.push(o,g,f); return {o,g,f};
  }

  function noiseBed(level=.012){
    const len=ctx.sampleRate*3, buffer=ctx.createBuffer(1,len,ctx.sampleRate), data=buffer.getChannelData(0);
    let x=0; for(let i=0;i<len;i++){x=.985*x+(Math.random()*2-1)*.12; data[i]=x;}
    const src=ctx.createBufferSource(), filter=ctx.createBiquadFilter(), g=ctx.createGain(); src.buffer=buffer; src.loop=true; filter.type='lowpass'; filter.frequency.value=420; g.gain.value=level; src.connect(filter).connect(g).connect(master); src.start(); persistent.push(src,filter,g); ambience=src;
  }

  function note(freq,when,dur=.9,gain=.035,type='sine',pan=0){
    const o=ctx.createOscillator(), g=ctx.createGain(); o.type=type; o.frequency.setValueAtTime(freq,when); g.gain.setValueAtTime(0.0001,when); g.gain.exponentialRampToValueAtTime(gain,when+.025); g.gain.exponentialRampToValueAtTime(0.0001,when+dur);
    if(ctx.createStereoPanner){const p=ctx.createStereoPanner(); p.pan.value=pan; o.connect(g).connect(p).connect(master);} else o.connect(g).connect(master);
    o.start(when); o.stop(when+dur+.05);
  }

  function tick(when){
    const o=ctx.createOscillator(), g=ctx.createGain(), f=ctx.createBiquadFilter(); o.type='square'; o.frequency.value=1900; f.type='highpass'; f.frequency.value=1200; g.gain.setValueAtTime(.022,when); g.gain.exponentialRampToValueAtTime(.0001,when+.055); o.connect(f).connect(g).connect(master); o.start(when); o.stop(when+.06);
  }

  function startPads(){
    theme.chord.forEach((f,i)=>{persistentOsc(f,'sine',.025,i*2-2,(i-1)*.28); persistentOsc(f*2,'triangle',.008,3-i*2,(1-i)*.18);});
    noiseBed(theme.id==='undercurrent'?.018:.009);
  }

  function scheduleTheme(){
    const now=()=>ctx.currentTime+.03;
    if(theme.id==='rebirth'){
      let c=0; timers.push(setInterval(()=>{if(!playing)return; tick(now()); if(c++%4===0){const f=theme.accent[(c/4|0)%theme.accent.length]; note(f,now()+.08,2.4,.025,'sine',c%2?.35:-.35);}},2000));
    } else if(theme.id==='arrival'){
      let i=0; timers.push(setInterval(()=>{if(!playing)return; const seq=[0,1,2,1,3,2]; const f=theme.accent[seq[i++%seq.length]%theme.accent.length]; note(f,now(),.65,.018,'triangle',Math.sin(i*.8)*.45);},760));
      timers.push(setInterval(()=>{if(!playing)return; note(theme.accent[Math.floor(Math.random()*theme.accent.length)]/2,now(),2.8,.018,'sine',0);},5200));
    } else if(theme.id==='undercurrent'){
      let i=0; timers.push(setInterval(()=>{if(!playing)return; note(theme.chord[0]/2,now(),1.7,.03,'sine',0); if(i++%3===0) note(theme.chord[0]/2*1.05946,now()+.18,2.3,.012,'sine',.2);},3000));
      timers.push(setInterval(()=>{if(!playing)return; note(theme.accent[Math.floor(Math.random()*theme.accent.length)],now(),3.1,.014,'sine',Math.random()-.5);},7100));
    } else {
      let i=0; timers.push(setInterval(()=>{if(!playing)return; const f=theme.accent[i++%theme.accent.length]; note(f,now(),2.7,.018,'sine',i%2?.3:-.3);},5200));
    }
  }

  async function startMusic(userAction){
    try{
      ensureAudio(); await ctx.resume();
      if(playing) return;
      playing=true; persistent=[]; timers=[]; startPads(); scheduleTheme();
      if(userAction) localStorage.setItem(KEY_ENABLED,'1');
      setUI(true);
    }catch(err){
      const box=document.getElementById('zs-audio'); if(box) box.querySelector('.zs-sub').textContent='浏览器暂不支持音频';
    }
  }

  function stopMusic(userAction){
    playing=false; timers.forEach(clearInterval); timers=[];
    persistent.forEach(n=>{try{if(n.stop)n.stop();}catch(e){} try{n.disconnect();}catch(e){}}); persistent=[];
    if(userAction) localStorage.setItem(KEY_ENABLED,'0');
    setUI(false);
  }

  registerSW();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',buildUI); else buildUI();
})();
