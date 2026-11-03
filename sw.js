/* 第零序列 · 音乐 / 情绪说书 / 官方旁白注入 Service Worker */
const PLAYER='<script src="/zero-sequence/assets/js/audio-player.js?v=5" defer></script>';
const NARRATOR='<script src="/zero-sequence/assets/js/narrator-pro.js?v=2" defer></script>';
const OFFICIAL='<script src="/zero-sequence/assets/js/narration-official.js?v=1" defer></script>';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  if(event.request.mode!=='navigate') return;
  event.respondWith((async()=>{
    try{
      const res=await fetch(event.request,{cache:'no-store'});
      const type=res.headers.get('content-type')||'';
      if(!type.includes('text/html')) return res;
      let html=await res.text();
      if(!html.includes('/zero-sequence/assets/js/audio-player.js')) html=html.replace('</body>',PLAYER+'</body>');
      else html=html.replace(/\/zero-sequence\/assets\/js\/audio-player\.js(?:\?v=\d+)?/g,'/zero-sequence/assets/js/audio-player.js?v=5');
      if(html.includes('class="article"') && !html.includes('/zero-sequence/assets/js/narrator-pro.js')) html=html.replace('</body>',NARRATOR+'</body>');
      else html=html.replace(/\/zero-sequence\/assets\/js\/narrator-pro\.js(?:\?v=\d+)?/g,'/zero-sequence/assets/js/narrator-pro.js?v=2');
      if(html.includes('class="article"') && !html.includes('/zero-sequence/assets/js/narration-official.js')) html=html.replace('</body>',OFFICIAL+'</body>');
      else html=html.replace(/\/zero-sequence\/assets\/js\/narration-official\.js(?:\?v=\d+)?/g,'/zero-sequence/assets/js/narration-official.js?v=1');
      const headers=new Headers(res.headers);headers.delete('content-length');headers.set('cache-control','no-cache');
      return new Response(html,{status:res.status,statusText:res.statusText,headers});
    }catch(err){return fetch(event.request);}
  })());
});
