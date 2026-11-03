/* 第零序列 · 官方高质量旁白接入层
 * 未来只需要把对应章节 audioUrl 填上正式音频地址，页面就会自动从本地 TTS 切换为官方旁白。
 */
(() => {
  'use strict';

  const chapterKey = location.pathname.replace(/\/+$/, '');
  const OFFICIAL = {
    '/zero-sequence/chapters/volume-01/chapter-001.html': {
      title: '第一卷 · 第一章《死亡与重生》',
      voice: 'Haoran',
      provider: 'HeyGen',
      status: 'pending',
      audioUrl: ''
    }
  };

  const item = OFFICIAL[chapterKey];
  if (!item) return;

  function injectStyle(){
    if(document.getElementById('zs-official-narration-style')) return;
    const s=document.createElement('style');
    s.id='zs-official-narration-style';
    s.textContent=`
      .zs-official-card{margin:0 0 12px;padding:11px 13px;border:1px solid rgba(232,201,121,.38);border-radius:14px;background:linear-gradient(135deg,rgba(232,201,121,.08),rgba(121,142,232,.08));display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
      .zs-official-copy{min-width:0}.zs-official-kicker{font-size:10px;letter-spacing:.15em;color:#e8c979}.zs-official-name{margin-top:3px;font-size:13px;font-weight:800;color:#f6f1e7}.zs-official-desc{margin-top:3px;font-size:10px;line-height:1.55;color:#aaa5b8}
      .zs-official-badge{padding:6px 10px;border-radius:999px;border:1px solid rgba(232,201,121,.4);font-size:10px;color:#e8c979;background:rgba(20,22,35,.66);white-space:nowrap}
      .zs-official-ready .zs-official-badge{color:#c9f0d0;border-color:rgba(143,218,157,.45)}
      .zs-pro.zs-official-ready .zs-pro-main{background:linear-gradient(135deg,#b88a35,#7257c7)!important}
      @media(max-width:560px){.zs-official-card{align-items:flex-start;flex-direction:column}}
    `;
    document.head.appendChild(s);
  }

  function fmt(sec){
    if(!Number.isFinite(sec)) return '00:00';
    const m=Math.floor(sec/60), s=Math.floor(sec%60);
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function duck(on){
    const slider=document.querySelector('.zs-slider');
    if(!slider) return;
    if(on){
      if(slider.dataset.beforeOfficialNarration==null) slider.dataset.beforeOfficialNarration=slider.value;
      slider.value=Math.min(parseFloat(slider.value||'.18'),.04);
      slider.dispatchEvent(new Event('input',{bubbles:true}));
    }else if(slider.dataset.beforeOfficialNarration!=null){
      slider.value=slider.dataset.beforeOfficialNarration;
      delete slider.dataset.beforeOfficialNarration;
      slider.dispatchEvent(new Event('input',{bubbles:true}));
    }
  }

  function mount(){
    const pro=document.getElementById('zs-pro');
    if(!pro) return false;
    if(pro.querySelector('.zs-official-card')) return true;
    injectStyle();

    const card=document.createElement('div');
    card.className='zs-official-card';
    card.innerHTML=`
      <div class="zs-official-copy">
        <div class="zs-official-kicker">OFFICIAL AUDIOBOOK</div>
        <div class="zs-official-name">🎙️ 官方高质量旁白 · ${item.voice}</div>
        <div class="zs-official-desc"></div>
      </div>
      <div class="zs-official-badge"></div>`;
    const head=pro.querySelector('.zs-pro-head');
    if(head && head.nextSibling) pro.insertBefore(card,head.nextSibling); else pro.prepend(card);

    const desc=card.querySelector('.zs-official-desc');
    const badge=card.querySelector('.zs-official-badge');

    if(!item.audioUrl || item.status!=='ready'){
      document.body.dataset.officialNarration='pending';
      desc.textContent='正式有感情旁白接口已经预留。成品音频完成后，本章会自动优先播放官方版本；现在仍可使用下方「情绪说书 V2」。';
      badge.textContent='制作中 · TTS 备用';
      return true;
    }

    document.body.dataset.officialNarration='ready';
    pro.classList.add('zs-official-ready');
    desc.textContent=`${item.provider} · ${item.voice} · 官方完整章音频`;
    badge.textContent='✓ 官方旁白已就绪';

    const main=pro.querySelector('.zs-pro-main');
    const prev=pro.querySelector('.zs-pro-prev');
    const next=pro.querySelector('.zs-pro-next');
    const reset=pro.querySelector('.zs-pro-reset');
    const status=pro.querySelector('.zs-pro-status');
    if(!main) return true;

    // 克隆按钮以移除原本本地 TTS 的事件处理；正式音频优先。
    const main2=main.cloneNode(true); main.replaceWith(main2);
    const prev2=prev?prev.cloneNode(true):null; if(prev) prev.replaceWith(prev2);
    const next2=next?next.cloneNode(true):null; if(next) next.replaceWith(next2);
    const reset2=reset?reset.cloneNode(true):null; if(reset) reset.replaceWith(reset2);

    const audio=new Audio(item.audioUrl);
    audio.preload='metadata';
    main2.textContent='▶ 官方旁白';
    main2.title=`${item.title} · ${item.voice}`;

    function sync(){
      main2.textContent=audio.paused?'▶ 官方旁白':'⏸ 官方旁白';
      if(status) status.textContent=`官方旁白 · ${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
    }
    main2.addEventListener('click',async()=>{
      if(window.speechSynthesis) window.speechSynthesis.cancel();
      try{
        if(audio.paused){duck(true);await audio.play();}else{audio.pause();duck(false);}
        sync();
      }catch(e){if(status)status.textContent='官方音频暂时无法播放 · 可使用本地朗读';duck(false);}
    });
    if(prev2) prev2.addEventListener('click',()=>{audio.currentTime=Math.max(0,audio.currentTime-15);sync();});
    if(next2) next2.addEventListener('click',()=>{if(Number.isFinite(audio.duration))audio.currentTime=Math.min(audio.duration,audio.currentTime+15);sync();});
    if(prev2) prev2.textContent='← 15秒';
    if(next2) next2.textContent='15秒 →';
    if(reset2) reset2.addEventListener('click',()=>{audio.pause();audio.currentTime=0;duck(false);sync();});
    audio.addEventListener('timeupdate',sync);
    audio.addEventListener('play',()=>{duck(true);sync();});
    audio.addEventListener('pause',()=>{duck(false);sync();});
    audio.addEventListener('ended',()=>{duck(false);if(status)status.textContent='官方旁白播放完成 ✓';sync();});
    audio.addEventListener('loadedmetadata',sync);
    window.addEventListener('beforeunload',()=>{audio.pause();duck(false);});
    return true;
  }

  if(!mount()){
    const ob=new MutationObserver(()=>{if(mount())ob.disconnect();});
    ob.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>{mount();ob.disconnect();},6000);
  }
})();
