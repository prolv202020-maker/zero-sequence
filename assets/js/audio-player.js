/* 第零序列 · 动漫冒险风原创浏览器生成配乐 */
(() => {
  'use strict';

  const path = location.pathname.toLowerCase();
  const theme = path.includes('volume-01') ? {
    id:'rebirth', title:'第一卷 · 重返', subtitle:'ANIME / REBIRTH', bpm:96,
    chords:[[164.81,207.65,246.94],[146.83,185.00,220.00],[123.47,164.81,207.65],[110.00,146.83,196.00]],
    melody:[329.63,369.99,415.30,493.88,415.30,369.99,329.63,277.18], color:'#e7cf8f'
  } : path.includes('volume-02') ? {
    id:'arrival', title:'第二卷 · 初临', subtitle:'ANIME / ADVENTURE', bpm:112,
    chords:[[196.00,246.94,293.66],[146.83,196.00,246.94],[164.81,207.65,246.94],[130.81,164.81,196.00]],
    melody:[392.00,493.88,587.33,659.25,587.33,493.88,440.00,392.00], color:'#bfe0a5'
  } : path.includes('volume-03') ? {
    id:'undercurrent', title:'第三卷 · 暗流', subtitle:'ANIME / MYSTERY', bpm:102,
    chords:[[220.00,261.63,329.63],[196.00,246.94,293.66],[174.61,220.00,261.63],[196.00,246.94,329.63]],
    melody:[440.00,493.88,523.25,587.33,523.25,493.88,440.00,392.00], color:'#c9b7ef'
  } : {
    id:'main', title:'第零序列 · 主题', subtitle:'ANIME / ZERO SEQUENCE', bpm:104,
    chords:[[146.83,185.00,220.00],[110.00,146.83,185.00],[123.47,164.81,207.65],[98.00,123.47,146.83]],
    melody:[293.66,369.99,440.00,493.88,440.00,369.99,329.63,293.66], color:'#e7cf8f'
  };

  const KEY_ENABLED='zs_audio_enabled';
  const KEY_VOLUME='zs_audio_volume';
  let ctx=null, master=null, playing=false;
  let activeNodes=[], timers=[];
  let volume=Math.max(0,Math.min(1,parseFloat(localStorage.getItem(KEY_VOLUME)||'0.18')));
  let step=0, chordStep=0;

  function styleUI(){
    if(document.getElementById('zs-audio-style')) return;
    const s=document.createElement('style'); s.id='zs-audio-style';
    s.textContent=`
      .zs-audio{position:fixed;right:18px;bottom:18px;z-index:9999;width:min(340px,calc(100vw - 28px));display:flex;align-items:center;gap:11px;padding:11px 13px;border:1px solid rgba(231,207,143,.42);border-radius:18px;background:linear-gradient(135deg,rgba(20,23,38,.91),rgba(31,27,52,.88));box-shadow:0 14px 42px rgba(0,0,0,.3);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);font-family:inherit;color:#f7f2e7;transition:.25s ease}
      .zs-audio:hover{border-color:rgba(231,207,143,.78);transform:translateY(-1px)}
      .zs-audio button{width:42px;height:42px;flex:0 0 42px;border-radius:50%;border:1px solid rgba(231,207,143,.62);background:linear-gradient(145deg,rgba(255,238,185,.18),rgba(110,82,166,.34));color:#fff1c9;cursor:pointer;font-size:16px;line-height:1}
      .zs-copy{min-width:0;flex:1}.zs-title{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.04em}.zs-sub{margin-top:3px;font-size:9px;letter-spacing:.16em;color:#b9b4c8}.zs-wave{display:flex;align-items:end;gap:2px;height:14px;margin-top:5px}.zs-wave i{display:block;width:2px;height:5px;background:var(--zs-accent,#e7cf8f);opacity:.6;border-radius:2px}.zs-audio.is-playing .zs-wave i{animation:zsWave .7s ease-in-out infinite alternate}.zs-audio .zs-wave i:nth-child(2){animation-delay:.1s}.zs-audio .zs-wave i:nth-child(3){animation-delay:.2s}.zs-audio .zs-wave i:nth-child(4){animation-delay:.3s}.zs-audio .zs-wave i:nth-child(5){animation-delay:.4s}
      .zs-audio input[type=range]{width:66px;accent-color:#e7cf8f;opacity:.85}.zs-vol{font-size:10px;color:#aaa5b7;display:flex;align-items:center;gap:4px}@keyframes zsWave{from{height:3px;opacity:.4}to{height:13px;opacity:1}}
      @media(max-width:560px){.zs-audio{right:10px;bottom:10px;width:calc(100vw - 20px)}.zs-audio input[type=range]{width:52px}}
    `;
    document.head.appendChild(s);
  }

  function buildUI(){
    if(document.getElementById('zs-audio')) return;
    styleUI();
    const box=document.createElement('div'); box.id='zs-audio'; box.className='zs-audio'; box.style.setProperty('--zs-accent',theme.color);
    box.innerHTML=`<button type="button" class="zs-play" aria-label="播放背景音乐">▶</button><div class="zs-copy"><div class="zs-title">${theme.title}</div><div class="zs-sub">${theme.subtitle}</div><div class="zs-wave"><i></i><i></i><i></i><i></i><i></i></div></div><label class="zs-vol">♫ <input class="zs-slider" type="range" min="0" max="1" step="0.01" value="${volume}"></label>`;
    document.body.appendChild(box);
    box.querySelector('.zs-play').addEventListener('click',async()=>playing?stopMusic(true):await startMusic(true));
    box.querySelector('.zs-slider').addEventListener('input',e=>{volume=parseFloat(e.target.value);localStorage.setItem(KEY_VOLUME,String(volume));if(master&&ctx)master.gain.setTargetAtTime(volume,ctx.currentTime,.08);});
    if(localStorage.getItem(KEY_ENABLED)==='1'){
      box.querySelector('.zs-sub').textContent=theme.subtitle+' · 点击页面继续';
      const resume=async()=>{document.removeEventListener('pointerdown',resume,true);if(localStorage.getItem(KEY_ENABLED)==='1'&&!playing)await startMusic(false);};
      document.addEventListener('pointerdown',resume,true);
    }
  }

  function setUI(on){const box=document.getElementById('zs-audio');if(!box)return;box.classList.toggle('is-playing',on);const b=box.querySelector('.zs-play');b.textContent=on?'Ⅱ':'▶';box.querySelector('.zs-sub').textContent=theme.subtitle+(on?' · PLAYING':'');}

  function ensureAudio(){
    if(ctx)return; const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw new Error('no audio');
    ctx=new AC(); master=ctx.createGain(); master.gain.value=volume;
    const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.knee.value=16;comp.ratio.value=2.2;comp.attack.value=.03;comp.release.value=.3;master.connect(comp).connect(ctx.destination);
  }

  function tone(freq,when,dur,gain=.035,type='triangle',pan=0,cut=2400){
    const o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();o.type=type;o.frequency.setValueAtTime(freq,when);f.type='lowpass';f.frequency.value=cut;g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(gain,when+.02);g.gain.exponentialRampToValueAtTime(.0001,when+dur);
    if(ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=pan;o.connect(f).connect(g).connect(p).connect(master);}else{o.connect(f).connect(g).connect(master);}o.start(when);o.stop(when+dur+.05);activeNodes.push(o,g,f);
  }

  function bell(freq,when,gain=.028){tone(freq,when,1.35,gain,'sine',Math.sin(step*.7)*.35,5200);tone(freq*2,when+.01,.75,gain*.28,'sine',0,7000);}

  function softKick(when){
    const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(110,when);o.frequency.exponentialRampToValueAtTime(58,when+.12);g.gain.setValueAtTime(.025,when);g.gain.exponentialRampToValueAtTime(.0001,when+.16);o.connect(g).connect(master);o.start(when);o.stop(when+.18);activeNodes.push(o,g);
  }

  function shimmer(when){
    const len=Math.floor(ctx.sampleRate*.06),b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=b;f.type='highpass';f.frequency.value=4200;g.gain.value=.008;s.connect(f).connect(g).connect(master);s.start(when);activeNodes.push(s,f,g);
  }

  function playBeat(){
    if(!playing)return;
    const beat=60/theme.bpm, now=ctx.currentTime+.03, chord=theme.chords[chordStep%theme.chords.length];
    const arp=[0,1,2,1]; const f=chord[arp[step%4]];
    tone(f*2,now,beat*.8,.022,'triangle',step%2?.22:-.22,3200);
    if(step%2===0) tone(chord[0],now,beat*1.7,.016,'sine',-.1,1400);
    if(step%4===0){softKick(now); chordStep++;}
    if(step%2===1) shimmer(now+.02);
    if(step%4===2){const m=theme.melody[(Math.floor(step/2))%theme.melody.length];bell(m,now,.023);}
    if(theme.id==='rebirth' && step%8===7) bell(987.77,now+.05,.012);
    if(theme.id==='arrival' && step%8===6) bell(theme.melody[(step+2)%theme.melody.length],now,.03);
    if(theme.id==='undercurrent' && step%8===4) tone(theme.melody[(step+1)%theme.melody.length],now,beat*2.2,.014,'sine',.3,2500);
    step++;
  }

  function startLoop(){
    step=0;chordStep=0;playBeat();
    const interval=(60/theme.bpm)*1000;timers.push(setInterval(playBeat,interval));
  }

  async function startMusic(userAction){
    try{ensureAudio();await ctx.resume();if(playing)return;playing=true;activeNodes=[];timers=[];startLoop();if(userAction)localStorage.setItem(KEY_ENABLED,'1');setUI(true);}catch(e){const box=document.getElementById('zs-audio');if(box)box.querySelector('.zs-sub').textContent='浏览器暂不支持音频';}
  }

  function stopMusic(userAction){playing=false;timers.forEach(clearInterval);timers=[];activeNodes.forEach(n=>{try{if(n.stop)n.stop();}catch(e){}try{n.disconnect();}catch(e){}});activeNodes=[];if(userAction)localStorage.setItem(KEY_ENABLED,'0');setUI(false);}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',buildUI);else buildUI();
})();
