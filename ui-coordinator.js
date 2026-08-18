/* CARDIAC//BREACH — final interaction coordinator
 * Owns only presentation safety: one onboarding layer, safe coach placement,
 * and suppression of competing overlays. It never owns gameplay state.
 * No polling timers; reacts to DOM/layout changes through observers.
 */
(()=>{
  'use strict';

  const ROOT=document.documentElement;
  const GUIDE='#beginnerGuide';
  const TARGET='.bg-pulse';
  const CARD='.bg-card';
  const COMPETING=['#crisisLayer','#finalOverlay','#cbStart','#cbCoach'];
  let resizeObserver=null;
  let mutationObserver=null;
  let raf=0;

  const rect=(el)=>el?.getBoundingClientRect?.();
  const overlap=(a,b)=>!!a&&!!b&&!(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom);
  const insideViewport=(r,w,h,pad=10)=>!!r&&r.left>=pad&&r.top>=pad&&r.right<=w-pad&&r.bottom<=h-pad;
  const visible=(el)=>{if(!el)return false;const s=getComputedStyle(el),r=rect(el);return s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0'&&r?.width>0&&r?.height>0};

  function suppressCompeting(){
    const guide=!!document.querySelector(GUIDE);
    ROOT.dataset.beginnerGuide=guide?'open':'closed';
    if(guide){
      for(const selector of COMPETING){
        const el=document.querySelector(selector);
        if(el&&selector!=='#beginnerGuide'){
          el.dataset.coordinatorSuppressed='true';
          el.classList.remove('show');
          el.setAttribute('aria-hidden','true');
        }
      }
      document.body.classList.add('beginner-active');
    }else{
      document.body.classList.remove('beginner-active');
      for(const selector of COMPETING){
        const el=document.querySelector(selector);
        if(el?.dataset.coordinatorSuppressed==='true'){
          delete el.dataset.coordinatorSuppressed;
          el.removeAttribute('aria-hidden');
        }
      }
    }
  }

  function safePlace(){
    const card=document.querySelector(CARD);
    const target=document.querySelector(TARGET);
    if(!card||!target||!visible(card)||!visible(target))return;

    const w=innerWidth,h=innerHeight,gap=18,pad=10;
    const tr=rect(target),cw=card.offsetWidth,ch=card.offsetHeight;
    if(!tr||!cw||!ch)return;

    const candidates=[
      {left:tr.right+gap,top:tr.top+tr.height/2-ch/2},
      {left:tr.left-cw-gap,top:tr.top+tr.height/2-ch/2},
      {left:tr.left+tr.width/2-cw/2,top:tr.bottom+gap},
      {left:tr.left+tr.width/2-cw/2,top:tr.top-ch-gap},
      {left:pad,top:pad},
      {left:w-cw-pad,top:pad},
      {left:pad,top:h-ch-pad},
      {left:w-cw-pad,top:h-ch-pad}
    ];

    const topbar=rect(document.querySelector('.topbar'));
    const score=(p)=>{
      const cr={left:p.left,top:p.top,right:p.left+cw,bottom:p.top+ch};
      const badTarget=overlap(cr,tr);
      const badTop=topbar&&overlap(cr,topbar);
      const viewportPenalty=insideViewport(cr,w,h,pad)?0:100000;
      return viewportPenalty+(badTarget?50000:0)+(badTop?25000:0)+Math.abs((cr.left+cr.right)/2-w/2)*0.01;
    };

    const p=candidates.sort((a,b)=>score(a)-score(b))[0];
    card.style.left=`${Math.round(p.left)}px`;
    card.style.top=`${Math.round(p.top)}px`;
    card.style.transform='none';

    const cr=rect(card),arrow=document.querySelector('#bgArrow');
    if(arrow&&cr){
      const tx=tr.left+tr.width/2,ty=tr.top+tr.height/2;
      const cx=cr.left+cr.width/2,cy=cr.top+cr.height/2;
      const dx=tx-cx,dy=ty-cy,len=Math.hypot(dx,dy);
      if(len>55){
        arrow.style.left=`${cx}px`;
        arrow.style.top=`${cy}px`;
        arrow.style.width=`${Math.max(70,Math.min(len-8,Math.max(90,w*.34)))}px`;
        arrow.style.transform=`translateY(-50%) rotate(${Math.atan2(dy,dx)*180/Math.PI}deg)`;
        arrow.classList.add('show');
      }else arrow.classList.remove('show');
    }
  }

  function verifyClickTarget(){
    const target=document.querySelector(TARGET);
    if(!target)return;
    const r=rect(target);if(!r)return;
    const x=Math.round(r.left+r.width/2),y=Math.round(r.top+r.height/2);
    const hit=document.elementFromPoint(x,y);
    if(!hit)return;
    if(hit===target||target.contains(hit))return;
    const card=document.querySelector(CARD);
    if(card&&card.contains(hit))safePlace();
  }

  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(()=>{raf=0;suppressCompeting();safePlace();verifyClickTarget()});
  }

  function attach(){
    mutationObserver=new MutationObserver(schedule);
    mutationObserver.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','hidden','aria-hidden']});

    if(window.ResizeObserver){
      resizeObserver=new ResizeObserver(schedule);
      resizeObserver.observe(document.documentElement);
      const card=document.querySelector(CARD);if(card)resizeObserver.observe(card);
      const target=document.querySelector(TARGET);if(target)resizeObserver.observe(target);
    }

    window.addEventListener('resize',schedule,{passive:true});
    window.addEventListener('scroll',schedule,{passive:true});
    schedule();
  }

  function boot(){
    if(!document.body)return;
    attach();
    document.documentElement.dispatchEvent(new CustomEvent('cardiac:ui-coordinator-ready'));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.CB_UI_COORDINATOR={safePlace,suppressCompeting,verifyClickTarget};
})();
