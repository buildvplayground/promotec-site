/* ============================================================================
   BuildV — Sistema de Movimento (motion.js)
   Origem: extraido de one-office/dist/index.html (build real de julho/2026),
   ultimo <script> do <body>. Este bloco e BYTE-IDENTICO em 7 das 8 paginas do
   build, ou seja, e o motor compartilhado do site.
   Implementacao de REFERENCIA do sistema de movimento BuildV: codigo testado em
   producao, copiado sem alteracoes. Nao "melhore" — replique.
   O prefixo `oo-` e herdado do projeto original (One Office) e pode ser renomeado
   ao reusar, DESDE QUE motion.css e motion.js sejam renomeados juntos.
   Par obrigatorio: este arquivo + motion/motion.css.
   Zero dependencias externas: sem GSAP, sem Lenis, sem ScrollTrigger, sem CDN.
   Carregar no fim do <body> (nao usa DOMContentLoaded).
   ============================================================================ */

(function(){
  // Padrão BuildV: respeita a preferência de sistema "prefers-reduced-motion"
  // (WCAG — ver design-bank/principles/wcag-acessibilidade-obrigatorio.md e
  // sistema-de-movimento.md §6). O build de origem (One Office) rodou com isso
  // desativado a pedido explícito daquele cliente; essa exceção não se propaga
  // para outros projetos por padrão, então aqui fica sempre ligado.
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var hd = document.querySelector('[data-hd]');
  var prog = document.querySelector('[data-progress]');
  var docEl = document.documentElement;
  var heroFx = reduce ? null : document.querySelector('[data-hero-fx]');
  var parallaxEls = reduce ? [] : [].slice.call(document.querySelectorAll('[data-parallax]'));
  if(heroFx) heroFx.style.willChange='transform,opacity';
  parallaxEls.forEach(function(el){ el.style.willChange='transform'; });
  var lastY = window.pageYOffset||0, hdHidden=false, ticking=false;
  var onScrollHooks=[];

  function applyScroll(){
    ticking=false;
    var y = window.pageYOffset||docEl.scrollTop||0;
    var vh = window.innerHeight||1;

    if(prog){ var range=docEl.scrollHeight-vh; prog.style.width=(range>0?Math.min(100,(y/range)*100):0).toFixed(2)+'%'; }

    if(hd){
      if(y>40){ hd.style.background='rgba(28,27,25,0.9)'; hd.style.backdropFilter='blur(14px)'; hd.style.webkitBackdropFilter='blur(14px)'; hd.style.borderBottomColor='rgba(241,239,234,0.1)'; }
      else{ hd.style.background='transparent'; hd.style.backdropFilter='none'; hd.style.webkitBackdropFilter='none'; hd.style.borderBottomColor='transparent'; }
      if(!reduce){
        var menuOpen = menu && menu.getAttribute('data-open')==='true';
        if(!menuOpen && y>220 && y>lastY+3){ if(!hdHidden){ hdHidden=true; hd.style.transform='translateY(-100%)'; } }
        else if(y<lastY-3 || y<=220){ if(hdHidden){ hdHidden=false; hd.style.transform='translateY(0)'; } }
      }
    }

    if(heroFx){ var hp=Math.min(1,y/(vh*0.92)); heroFx.style.transform='translate3d(0,'+(y*0.12).toFixed(1)+'px,0)'; heroFx.style.opacity=(1-0.9*hp).toFixed(3); }

    for(var i=0;i<parallaxEls.length;i++){ var el=parallaxEls[i]; var r=el.getBoundingClientRect(); if(r.bottom<-60||r.top>vh+60) continue; var f=parseFloat(el.getAttribute('data-parallax'))||0; var delta=(r.top+r.height/2)-vh/2; el.style.transform='translate3d(0,'+(delta*f).toFixed(1)+'px,0)'; }

    for(var hk=0;hk<onScrollHooks.length;hk++){ try{ onScrollHooks[hk](y,vh); }catch(e){} }

    lastY=y;
  }
  function onScroll(){ if(!ticking){ ticking=true; requestAnimationFrame(applyScroll); } }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
  applyScroll();

  var menu=document.querySelector('[data-mobile-menu]');
  var navToggle=document.querySelector('[data-nav-toggle]');
  var menuTimer=null;
  function setMenu(open){
    if(!menu) return;
    if(open){
      if(menuTimer){ clearTimeout(menuTimer); menuTimer=null; }
      menu.style.display='flex'; document.body.style.overflow='hidden'; menu.setAttribute('aria-hidden','false');
      if(navToggle) navToggle.setAttribute('aria-expanded','true');
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ menu.setAttribute('data-open','true'); }); });
    } else {
      menu.setAttribute('data-open','false'); menu.setAttribute('aria-hidden','true'); document.body.style.overflow='';
      if(navToggle) navToggle.setAttribute('aria-expanded','false');
      if(reduce){ menu.style.display='none'; }
      else { menuTimer=setTimeout(function(){ menu.style.display='none'; menuTimer=null; },380); }
    }
  }
  if(navToggle) navToggle.addEventListener('click',function(){setMenu(true);});
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&menu&&menu.getAttribute('data-open')==='true') setMenu(false); });
  [].forEach.call(document.querySelectorAll('[data-menu-close]'),function(el){ el.addEventListener('click',function(){setMenu(false);}); });
  window.addEventListener('resize',function(){ if(window.innerWidth>900) setMenu(false); });

  /* REVISAR: pode ser especifico da pagina — skip-link, acessibilidade e nao movimento */
  var skip=document.querySelector('[data-skip]');
  if(skip){ skip.addEventListener('focus',function(){skip.style.left='16px';skip.style.top='12px';}); skip.addEventListener('blur',function(){skip.style.left='-9999px';}); }

  // ===== Smooth scroll reforçado (âncoras internas, com easing e offset do header) =====
  var HEADER_OFFSET=76;
  var SCROLL_DELAY=reduce?0:220;   // respiro após o clique antes de iniciar a rolagem (mais cinematográfico)
  // Easing cinematográfico (quint): partida bem lenta, meio veloz, chegada suave
  function easeInOutQuint(t){ return t<0.5 ? 16*t*t*t*t*t : 1-Math.pow(-2*t+2,5)/2; }
  var scrollAnim=null;
  function smoothScrollTo(targetY,dur){
    var startY=window.pageYOffset||docEl.scrollTop||0;
    var maxY=Math.max(0,(docEl.scrollHeight||0)-(window.innerHeight||0));
    var destY=Math.max(0,Math.min(targetY,maxY));
    var dist=destY-startY;
    if(scrollAnim){ cancelAnimationFrame(scrollAnim); scrollAnim=null; }
    if(reduce || Math.abs(dist)<2){ window.scrollTo(0,destY); return; }
    var d=dur||Math.max(1000,Math.min(2300,Math.abs(dist)*0.95));
    var t0=null;
    function step(now){ if(t0===null)t0=now; var p=Math.min(1,(now-t0)/d); window.scrollTo(0,startY+dist*easeInOutQuint(p)); if(p<1){ scrollAnim=requestAnimationFrame(step); } else { scrollAnim=null; } }
    scrollAnim=requestAnimationFrame(step);
  }
  // Cancela a animação assim que o usuário assume o controle (roda/toque/teclado)
  ['wheel','touchstart','keydown'].forEach(function(ev){ window.addEventListener(ev,function(){ if(scrollAnim){ cancelAnimationFrame(scrollAnim); scrollAnim=null; } },{passive:true}); });
  function anchorTarget(a){ var h=a.getAttribute('href')||''; if(h.charAt(0)!=='#'||h.length<2) return null; try{ return document.getElementById(h.slice(1)); }catch(e){ return null; } }
  document.addEventListener('click',function(e){
    var el=e.target; if(el&&el.nodeType!==1) el=el.parentElement;
    var a=(el&&el.closest)?el.closest('a[href^="#"]'):null;
    if(!a) return;
    var tgt=anchorTarget(a); if(!tgt) return;
    e.preventDefault();
    var inMenu = menu && menu.contains(a);
    if(inMenu) setMenu(false);
    var go=function(){ var y=tgt.getBoundingClientRect().top+(window.pageYOffset||docEl.scrollTop||0)-HEADER_OFFSET; smoothScrollTo(y); if(window.history&&history.pushState){ try{ history.pushState(null,'',a.getAttribute('href')); }catch(err){} } };
    // Delay maior quando vem do menu mobile (espera o menu fechar); pequeno respiro nos demais
    if(reduce){ go(); } else { setTimeout(go, inMenu?420:SCROLL_DELAY); }
  },false);

  /* seção de contato substituída por um CTA de orçamento (link mailto/tel, sem JS) */

  var revs=[].slice.call(document.querySelectorAll('[data-reveal]'));
  if(!reduce && 'IntersectionObserver' in window){
    var narrowRv=window.innerWidth<768;
    var RV_EASE='cubic-bezier(.16,.84,.28,1)';
    revs.forEach(function(el){ var dir=el.getAttribute('data-rv')||'up'; var t='translateY(34px)'; if(!narrowRv&&dir==='left')t='translateX(-40px)'; else if(!narrowRv&&dir==='right')t='translateX(40px)'; else if(dir==='scale')t='scale(0.96)'; el.style.opacity='0'; el.style.transform=t; el.style.filter='blur(6px)'; el.style.willChange='opacity, transform, filter'; el.style.transition='opacity .95s '+RV_EASE+', transform 1.05s '+RV_EASE+', filter .8s ease'; var sibs=el.parentElement?[].slice.call(el.parentElement.children).filter(function(c){return c.hasAttribute('data-reveal');}):[el]; var idx=Math.max(0,sibs.indexOf(el)); el.style.transitionDelay=(sibs.length>1?Math.min(idx,7)*90:0)+'ms'; });
    var io=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ var el=en.target; el.style.opacity='1'; el.style.transform='none'; el.style.filter='none'; el.addEventListener('transitionend',function h(){ el.style.willChange='auto'; el.removeEventListener('transitionend',h); }); io.unobserve(el);} }); },{threshold:0.12,rootMargin:'0px 0px -8% 0px'});
    revs.forEach(function(el){io.observe(el);});
  }

  function countUp(el){ var target=parseInt(el.getAttribute('data-count'),10)||0; var dur=1500; var t0=null; el.textContent='0'; function tick(now){ if(t0===null)t0=now; var p=Math.min(1,(now-t0)/dur); var eased=1-Math.pow(1-p,3); el.textContent=Math.round(target*eased); if(p<1)requestAnimationFrame(tick); else el.textContent=target; } requestAnimationFrame(tick); }

  // Contadores fora da seção Números (ex.: "10 dias" na Tecnologia)
  var counts=[].slice.call(document.querySelectorAll('[data-count]')).filter(function(el){ return !(el.closest && el.closest('[data-nums]')); });
  if(!reduce && 'IntersectionObserver' in window){
    var cio=new IntersectionObserver(function(es){ es.forEach(function(en){ if(!en.isIntersecting)return; countUp(en.target); cio.unobserve(en.target); }); },{threshold:0.5});
    counts.forEach(function(el){cio.observe(el);});
  } else { counts.forEach(function(el){ el.textContent=el.getAttribute('data-count'); }); }

  // Big numbers: itens surgem um a um + contagem coordenada
  (function(){
    var wrap=document.querySelector('[data-nums]'); if(!wrap) return;
    var items=[].slice.call(wrap.querySelectorAll('[data-num-item]')); if(!items.length) return;
    if(reduce || !('IntersectionObserver' in window)){ items.forEach(function(it){ it.style.opacity='1'; it.style.transform='none'; var c=it.querySelector('[data-count]'); if(c) c.textContent=c.getAttribute('data-count'); }); return; }
    items.forEach(function(it){ it.style.opacity='0'; it.style.transform='translateY(34px)'; it.style.transition='opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1)'; });
    var done=false;
    var nio=new IntersectionObserver(function(es){ es.forEach(function(en){ if(!en.isIntersecting||done)return; done=true;
      items.forEach(function(it,i){ setTimeout(function(){ it.style.opacity='1'; it.style.transform='none'; var c=it.querySelector('[data-count]'); if(c) countUp(c); }, i*240); });
      nio.disconnect();
    }); },{threshold:0.35});
    nio.observe(wrap);
  })();

  // Atuação: cena com pin — cards entram conforme o scroll (desktop); fallback revela no mobile
  (function(){
    var scene=document.querySelector('[data-svc-scene]'); if(!scene) return;
    var cards=[].slice.call(scene.querySelectorAll('[data-svc-card]')); if(!cards.length) return;
    var mq=window.matchMedia('(min-width:900px)');
    var mode=null, fio=null;
    function canPin(){ return mq.matches && !reduce && window.innerHeight>=560; }
    function clearCards(){ cards.forEach(function(c){ c.style.transition=''; c.style.transitionDelay=''; c.style.opacity=''; c.style.transform=''; c.style.willChange=''; }); }
    function teardown(){ if(fio){ fio.disconnect(); fio=null; } clearCards(); scene.removeAttribute('data-pin'); }
    function toFlow(){
      teardown(); mode='flow';
      if(reduce || !('IntersectionObserver' in window)){ cards.forEach(function(c){ c.style.opacity='1'; c.style.transform='none'; }); return; }
      cards.forEach(function(c){ c.style.opacity='0'; c.style.transform='translateY(40px)'; c.style.transition='opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1)'; });
      fio=new IntersectionObserver(function(es){ es.forEach(function(en){ if(!en.isIntersecting)return; var i=cards.indexOf(en.target); en.target.style.transitionDelay=(Math.max(0,i)*90)+'ms'; en.target.style.opacity='1'; en.target.style.transform='none'; fio.unobserve(en.target); }); },{threshold:0.2});
      cards.forEach(function(c){ fio.observe(c); });
    }
    function toPin(){
      teardown(); mode='pin'; scene.setAttribute('data-pin','on');
      cards.forEach(function(c){ c.style.transition='none'; c.style.opacity='0'; c.style.transform='translateY(80px) scale(.97)'; c.style.willChange='opacity,transform'; });
      update();
    }
    function update(){
      if(mode!=='pin') return;
      var rect=scene.getBoundingClientRect(); var vh=window.innerHeight;
      var total=rect.height - vh; if(total<=0) return;
      var p=Math.min(1,Math.max(0,(0-rect.top)/total));
      var n=cards.length;
      for(var i=0;i<n;i++){ var start=i/n, end=start+(1/n)*1.1; var cp=Math.min(1,Math.max(0,(p-start)/(end-start))); var e=1-Math.pow(1-cp,3); cards[i].style.opacity=e.toFixed(3); cards[i].style.transform='translateY('+((1-e)*80).toFixed(1)+'px) scale('+(0.97+e*0.03).toFixed(3)+')'; }
    }
    function setup(){ var want=canPin()?'pin':'flow'; if(want===mode) return; if(want==='pin') toPin(); else toFlow(); }
    setup();
    onScrollHooks.push(update);
    window.addEventListener('resize', function(){ setup(); update(); });
    if(mq.addEventListener) mq.addEventListener('change', function(){ setup(); update(); });
  })();

  (function(){ var vids=document.querySelectorAll('[data-hero-video],[data-body-video]'); [].forEach.call(vids,function(v){ v.muted=true; v.setAttribute('muted',''); v.loop=true; v.setAttribute('loop',''); if(reduce)return; try{v.load();}catch(e){} var tp=function(){ var p=v.play(); if(p&&p.catch)p.catch(function(){}); }; v.addEventListener('loadeddata',tp,{once:true}); v.addEventListener('canplay',tp,{once:true}); tp(); }); })();

  // Diferenciais: timeline horizontal — a linha avança conforme o scroll (01 → 04)
  (function(){
    var htl=document.querySelector('[data-htl]'); if(!htl) return;
    var line=htl.querySelector('.oo-htl-line'), prog=htl.querySelector('[data-htl-prog]');
    var items=[].slice.call(htl.querySelectorAll('[data-htl-item]'));
    var dots=[].slice.call(htl.querySelectorAll('[data-htl-dot]'));
    if(!line||!prog||!dots.length) return;
    var mq=window.matchMedia('(min-width:900px)');
    var geom=null;
    function clamp(v){ return Math.min(1,Math.max(0,v)); }
    function offWithin(el,anc){ var x=0,y=0,n=el; while(n&&n!==anc){ x+=n.offsetLeft; y+=n.offsetTop; n=n.offsetParent; } return {x:x,y:y}; }
    function build(){
      var horizontal=mq.matches;
      var pos=dots.map(function(d){ var o=offWithin(d,htl); return {x:o.x+d.offsetWidth/2, y:o.y+d.offsetHeight/2}; });
      var first=pos[0], last=pos[pos.length-1];
      if(horizontal){
        var top=first.y-1, left=first.x, w=Math.max(0,last.x-first.x);
        [line,prog].forEach(function(el){ el.style.left=left+'px'; el.style.top=top+'px'; el.style.width=w+'px'; el.style.height='2px'; });
        prog.style.transformOrigin='left center';
      } else {
        var l=first.x-1, t=first.y, h=Math.max(0,last.y-first.y);
        [line,prog].forEach(function(el){ el.style.left=l+'px'; el.style.top=t+'px'; el.style.width='2px'; el.style.height=h+'px'; });
        prog.style.transformOrigin='top center';
      }
      geom={horizontal:horizontal};
    }
    function apply(p){
      if(!geom) return;
      prog.style.transform=(geom.horizontal?'scaleX(':'scaleY(')+p.toFixed(4)+')';
      var n=items.length;
      items.forEach(function(it,i){ var frac=n>1?i/(n-1):0; if(p>=frac-0.001) it.setAttribute('data-on','true'); else it.removeAttribute('data-on'); });
    }
    function progress(){
      var vh=window.innerHeight, r=line.getBoundingClientRect();
      if(geom&&!geom.horizontal) return clamp((vh*0.62 - r.top)/Math.max(1,r.height));
      return clamp(((vh*0.78)-r.top)/(vh*0.46));
    }
    function tick(){ if(!reduce) apply(progress()); }
    build();
    window.addEventListener('resize', function(){ build(); tick(); });
    if(mq.addEventListener) mq.addEventListener('change', function(){ build(); tick(); });
    if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){ build(); tick(); });
    setTimeout(function(){ build(); tick(); },400);
    setTimeout(function(){ build(); tick(); },1400);
    if(reduce || !('IntersectionObserver' in window)){ apply(1); return; }
    apply(0);
    onScrollHooks.push(tick);
    tick();
  })();

  /* Scrollspy: destaca a seção ativa na navegação */
  (function(){
    if(!('IntersectionObserver' in window)) return;
    var links=[].slice.call(document.querySelectorAll('header nav a[data-nav-link]'));
    var secs=[]; links.forEach(function(a){ var h=a.getAttribute('href'); if(h&&h.charAt(0)==='#'){ var s=document.querySelector(h); if(s) secs.push(s); } });
    if(!secs.length) return;
    function activate(id){ links.forEach(function(a){ if(a.getAttribute('href')===id){ a.setAttribute('aria-current','true'); } else { a.removeAttribute('aria-current'); } }); }
    var vis={};
    var spy=new IntersectionObserver(function(es){ es.forEach(function(en){ vis['#'+en.target.id]=en.isIntersecting?en.intersectionRatio:0; }); var best=null,bv=0; Object.keys(vis).forEach(function(k){ if(vis[k]>bv){ bv=vis[k]; best=k; } }); if(best&&bv>0) activate(best); },{rootMargin:'-40% 0px -50% 0px',threshold:[0,0.25,0.5,1]});
    secs.forEach(function(s){ spy.observe(s); });
  })();

  /* REVISAR: pode ser especifico da pagina — lightbox da galeria, generico para `.oo-gal figure` mas acoplado a galeria */
  /* Lightbox da galeria — navegável por setas (mouse/teclado) e toque (swipe) */
  (function(){
    var lb=document.querySelector('[data-lightbox]'); if(!lb) return;
    var img=lb.querySelector('[data-lb-img]'), btn=lb.querySelector('[data-lb-close]');
    var prevBtn=lb.querySelector('[data-lb-prev]'), nextBtn=lb.querySelector('[data-lb-next]'), counter=lb.querySelector('[data-lb-count]');
    var figs=[].slice.call(document.querySelectorAll('.oo-gal figure')).filter(function(f){return f.querySelector('img');});
    if(!figs.length) return;
    var last=null, cur=0;
    if(figs.length<2) lb.setAttribute('data-single','true');

    function isOpen(){ return lb.getAttribute('data-open')==='true'; }
    function show(i){
      cur=((i%figs.length)+figs.length)%figs.length;
      var im=figs[cur].querySelector('img');
      var src=im.currentSrc||im.getAttribute('src'), alt=im.alt||'';
      if(counter) counter.textContent=(cur+1)+' / '+figs.length;
      if(reduce){ img.setAttribute('src',src); img.setAttribute('alt',alt); return; }
      var swap=function(){ img.setAttribute('src',src); img.setAttribute('alt',alt); requestAnimationFrame(function(){ img.style.opacity='1'; }); };
      img.style.opacity='0';
      var pre=new Image(); pre.referrerPolicy='no-referrer'; pre.onload=swap; pre.onerror=swap; pre.src=src;
      if(pre.complete){ pre.onload=null; swap(); }
    }
    function open(i){ last=document.activeElement; lb.setAttribute('data-open','true'); lb.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; show(i); requestAnimationFrame(function(){ requestAnimationFrame(function(){ lb.classList.add('is-visible'); }); }); if(btn) try{btn.focus();}catch(e){} }
    function close(){ lb.classList.remove('is-visible'); lb.setAttribute('aria-hidden','true'); document.body.style.overflow=''; var t=null; var fin=function(e){ if(e&&e.target!==lb) return; lb.setAttribute('data-open','false'); img.setAttribute('src',''); img.style.opacity=''; lb.removeEventListener('transitionend',fin); if(t) clearTimeout(t); }; if(reduce){ fin(); } else { lb.addEventListener('transitionend',fin); t=setTimeout(fin,420); } if(last&&last.focus) try{last.focus();}catch(e){} }

    figs.forEach(function(fig,i){ var im=fig.querySelector('img'); fig.setAttribute('tabindex','0'); fig.setAttribute('role','button'); fig.setAttribute('aria-label','Ampliar imagem'+(im.alt?': '+im.alt:'')); fig.addEventListener('click',function(){ open(i); }); fig.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(i); } }); });

    if(btn) btn.addEventListener('click',function(e){ e.stopPropagation(); close(); });
    if(prevBtn) prevBtn.addEventListener('click',function(e){ e.stopPropagation(); show(cur-1); });
    if(nextBtn) nextBtn.addEventListener('click',function(e){ e.stopPropagation(); show(cur+1); });
    lb.addEventListener('click',function(e){ if(e.target===lb) close(); });
    document.addEventListener('keydown',function(e){ if(!isOpen()) return; if(e.key==='Escape'){ close(); } else if(e.key==='ArrowRight'){ e.preventDefault(); show(cur+1); } else if(e.key==='ArrowLeft'){ e.preventDefault(); show(cur-1); } });

    // Navegação por toque (swipe horizontal) no mobile
    var sx=0, sy=0, swiping=false;
    lb.addEventListener('touchstart',function(e){ if(!isOpen()||e.touches.length!==1){ swiping=false; return; } swiping=true; sx=e.touches[0].clientX; sy=e.touches[0].clientY; },{passive:true});
    lb.addEventListener('touchend',function(e){ if(!swiping) return; swiping=false; if(figs.length<2) return; var t=e.changedTouches[0]; var dx=t.clientX-sx, dy=t.clientY-sy; if(Math.abs(dx)>44 && Math.abs(dx)>Math.abs(dy)*1.3){ show(cur+(dx<0?1:-1)); } },{passive:true});
  })();
})();
