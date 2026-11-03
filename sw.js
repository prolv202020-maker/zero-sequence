/* 第零序列 · 音乐播放器注入 Service Worker */
const PLAYER='<script src="/zero-sequence/assets/js/audio-player.js" defer></script>';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  if(event.request.mode!=='navigate') return;
  event.respondWith((async()=>{
    try{
      const res=await fetch(event.request);
      const type=res.headers.get('content-type')||'';
      if(!type.includes('text/html')) return res;
      let html=await res.text();
      if(!html.includes('/zero-sequence/assets/js/audio-player.js')) html=html.replace('</body>',PLAYER+'</body>');
      const headers=new Headers(res.headers); headers.delete('content-length');
      return new Response(html,{status:res.status,statusText:res.statusText,headers});
    }catch(err){
      return fetch(event.request);
    }
  })());
});
