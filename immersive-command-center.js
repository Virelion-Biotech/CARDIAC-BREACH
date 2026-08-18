/* CARDIAC//BREACH — immersive command center v1
 * Presentation layer only. Consumes CBApp; does not change simulation rules.
 */
(()=>{
'use strict';
const THREE_URL='https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js';
const rootId='cbImmersive';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let THREE=null,renderer=null,scene=null,camera=null,stage=null,regions=[],regionGroup=null,particles=null,clock=null,raf=0;
let selectedIndex=0,selectedAgent=null,deepScan=false,pointerDown=false,lastX=0,lastY=0,lastTime=0,toastTimer=0;
const $=s=>document.querySelector(s),root=()=>$('#'+rootId),game=()=>window.CBApp?.state;
function createShell(){
 if(root())return;
 const el=document.createElement('div');el.id=rootId;el.className='cb-immersive-root';
 el.innerHTML=`
 <div class="cb-scene">
  <div class="cb-atmosphere"><canvas id="cbParticleField"></canvas></div>
  <div class="cb-containment"></div><div class="cb-scanline"></div>
  <div class="cb-volume" id="cbVolume"><div class="cb-volume-state" id="cbVolumeState"></div></div>
  <div class="cb-hud">
   <div class="cb-arc"><div class="cb-telemetry">
    <div class="cb-readout"><small>TIMEPOINT</small><b id="immDay">DAY 0</b></div>
    <div class="cb-readout"><small>SYSTEM HEALTH</small><b id="immHealth">78%</b></div>
    <div class="cb-readout"><small>ENERGY</small><b id="immEnergy">100</b></div>
    <div class="cb-readout"><small>SCORE</small><b id="immScore">0</b></div>
   </div></div>
   <div class="cb-status-flare" id="immAlert">STABLE</div>
   <aside class="cb-left" id="immLeft"></aside><aside class="cb-right" id="immRight"></aside>
   <div class="cb-dock" id="immDock"></div>
   <button class="cb-deep-scan" id="immScan" type="button">DEEP SCAN</button>
   <div class="cb-deep-overlay" id="immDeep"><button class="cb-deep-close" id="immDeepClose">CLOSE</button><div class="cb-panel-kicker">ANALYST OVERLAY</div><div class="cb-panel-title">SYSTEM TELEMETRY</div><div class="cb-panel-sub">Opt-in precision readout. Presentation only; underlying simulation remains unchanged.</div><div class="cb-deep-grid" id="immDeepGrid"></div></div>
   <div class="cb-immersive-toast" id="immToast"></div>
  </div>
 </div>`;
 document.body.appendChild(el);
 $('#immScan').addEventListener('click',()=>{deepScan=!deepScan;$('#immScan').classList.toggle('active',deepScan);$('#immDeep').classList.toggle('open',deepScan);renderDeep();});
 $('#immDeepClose').addEventListener('click',()=>{deepScan=false;$('#immScan').classList.remove('active');$('#immDeep').classList.remove('open');});
}
async function loadThree(){if(THREE)return THREE;THREE=await import(THREE_URL);return THREE;}
function cellMetric(c){return c?clamp(100-(c.injury?.damage||0)*.62-(c.injury?.stress||0)*.18+(c.supply?.oxygen||0)*.12,0,100):0}
function cellSeverity(c){return c?clamp((c.injury?.damage||0)*.55+(c.injury?.stress||0)*.25+(100-(c.supply?.oxygen||0))*.20,0,100)/100:0}
function regionColor(sev,active=false){return active?0xd8f36a:(sev>.7?0xff536b:sev>.42?0xf3b45d:0x55d9c8)}
function layoutRegion(i,n){const ga=Math.PI*(3-Math.sqrt(5));const y=1-(i/(Math.max(1,n-1)))*2;const r=Math.sqrt(Math.max(0,1-y*y));const theta=ga*i;return new THREE.Vector3(Math.cos(theta)*r*.92,y*.92,Math.sin(theta)*r*.92);}
function init3D(){
 const host=$('#cbVolume');if(!host)return;
 return loadThree().then(T=>{
  const w=()=>Math.max(280,host.clientWidth||700),h=()=>Math.max(300,host.clientHeight||650);
  scene=new T.Scene();camera=new T.PerspectiveCamera(34,w()/h(),.1,100);camera.position.set(0,0,5.5);
  renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.setSize(w(),h(),false);renderer.setClearColor(0x000000,0);host.innerHTML='';host.appendChild(renderer.domElement);renderer.domElement.style.touchAction='none';renderer.domElement.setAttribute('aria-label','Interactive 3D synthetic cardiac volume');
  stage=new T.Group();stage.rotation.set(-.1,.18,0);scene.add(stage);
  scene.add(new T.HemisphereLight(0x8be9e0,0x041015,1.25));const key=new T.DirectionalLight(0x8ff8e8,2.2);key.position.set(3,4,5);scene.add(key);const rim=new T.PointLight(0x2fe1ce,14,10);rim.position.set(-4,1,3);scene.add(rim);
  const shell=new T.Mesh(new T.IcosahedronGeometry(1.22,3),new T.MeshPhysicalMaterial({color:0x0b3137,transparent:true,opacity:.18,roughness:.6,metalness:.02,wireframe:true}));stage.add(shell);
  const core=new T.Mesh(new T.IcosahedronGeometry(.86,4),new T.MeshPhysicalMaterial({color:0x08343a,transparent:true,opacity:.33,roughness:.5,metalness:.05,emissive:0x0b5153,emissiveIntensity:.45}));stage.add(core);
  regionGroup=new T.Group();stage.add(regionGroup);
  particles=new T.Points(new T.BufferGeometry(),new T.PointsMaterial({color:0x67e7d7,size:.035,transparent:true,opacity:.38,blending:T.AdditiveBlending,depthWrite:false}));stage.add(particles);
  clock=new T.Clock();
  bind3D();resize3D();new ResizeObserver(resize3D).observe(host);animate3D();renderRegions();
 }).catch(err=>{console.warn('Immersive renderer unavailable',err);fallbackScene();});
}
function bind3D(){
 const canvas=renderer.domElement;
 canvas.addEventListener('pointerdown',e=>{pointerDown=true;lastX=e.clientX;lastY=e.clientY;lastTime=performance.now();canvas.setPointerCapture?.(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!pointerDown)return;stage.rotation.y+=(e.clientX-lastX)*.005;stage.rotation.x=clamp(stage.rotation.x+(e.clientY-lastY)*.003,-.65,.65);lastX=e.clientX;lastY=e.clientY;});
 canvas.addEventListener('pointerup',e=>{pointerDown=false;if(performance.now()-lastTime>280)return;pickRegion(e);});
 canvas.addEventListener('pointerleave',()=>pointerDown=false);
 canvas.addEventListener('wheel',e=>{e.preventDefault();camera.position.z=clamp(camera.position.z+e.deltaY*.003,3.7,8.2);},{passive:false});
 canvas.addEventListener('dblclick',()=>{stage.rotation.set(-.1,.18,0);camera.position.z=5.5;});
}
function pickRegion(e){
 if(!regions.length)return;const r=renderer.domElement.getBoundingClientRect(),p=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1),ray=new THREE.Raycaster();ray.setFromCamera(p,camera);const hit=ray.intersectObjects(regions.map(x=>x.mesh),false)[0];if(!hit)return;const found=regions.find(x=>x.mesh===hit.object);if(found){selectRegion(found.index,true);}}
function selectRegion(index,user=true){
 const g=game();if(!g?.cells?.[index])return;selectedIndex=index;window.CBApp?.selectCell?.(index);renderRegions();renderContext();if(user)toast(`REGION ${index+1} SELECTED`);
}
function renderRegions(){
 if(!regionGroup||!THREE)return;const cells=game()?.cells||[];if(regionGroup.children.length!==cells.length){regionGroup.clear();regions=[];const n=cells.length||216;for(let i=0;i<n;i++){const m=new TMesh(THREE.SphereGeometry,.084,.08);const p=layoutRegion(i,n);m.position.copy(p);regionGroup.add(m);regions.push({index:i,mesh:m,base:p.clone()});}}
 regions.forEach(r=>{const c=cells[r.index],sev=cellSeverity(c),active=r.index===selectedIndex;const m=r.mesh;m.scale.setScalar((active?1.55:1)+(sev*.7));m.material.color.setHex(regionColor(sev,active));m.material.emissive.setHex(regionColor(sev,active));m.material.emissiveIntensity=active?.85:(.22+sev*.6);m.material.opacity=.72+(active?.28:0);});
 const active=regions.find(r=>r.index===selectedIndex);if(active){const p=active.base;const el=$('#immLeft');if(el){};}
 syncIncidentBeacons(cells);
}
function TMesh(T,GeoR,rs,rr){const geo=new T(GeoR(rs,24,16));return new T.Mesh(geo,new T.MeshPhysicalMaterial({color:0x55d9c8,emissive:0x124f50,emissiveIntensity:.3,roughness:.35,metalness:.04,transparent:true,opacity:.8}));}
function syncIncidentBeacons(cells){
 document.querySelectorAll('.cb-incident').forEach(e=>e.remove());
 const sceneEl=$('#cbImmersive');if(!sceneEl||!renderer||!camera)return;
 const hotspots=(game()?.hotspots||[]).filter(h=>!h.resolved).slice(0,3);
 for(const h of hotspots){const r=regions.find(x=>x.index===h.cell);if(!r)continue;const p=r.mesh.getWorldPosition(new THREE.Vector3()).project(camera);const x=(p.x*.5+.5)*innerWidth,y=(-p.y*.5+.5)*innerHeight;const d=document.createElement('div');d.className='cb-incident';d.style.left=`${x}px`;d.style.top=`${y}px`;d.innerHTML=`<b>CRISIS BEACON // R${h.cell+1}</b><span>SEVERITY ${h.severity}% · ${esc(game()?.scenario||'UNKNOWN')}</span>`;sceneEl.querySelector('.cb-hud').appendChild(d);}
}
function renderContext(){
 const g=game(),c=g?.cells?.[selectedIndex];const regionLabel=`REGION ${selectedIndex+1}`;const sev=cellSeverity(c);const valid=!selectedAgent||Boolean(c);
 $('#immLeft').innerHTML=`<div class="cb-holo-panel"><div class="cb-panel-kicker">SELECTED VOLUME</div><div class="cb-panel-title">${regionLabel}</div><div class="cb-panel-sub">Direct manipulation target. No fixed anatomy is assumed; regions are generated from the simulation field.</div><div class="cb-region-id">R-${String(selectedIndex+1).padStart(3,'0')}</div><div class="cb-stat-line"><span>VIABILITY</span><b>${Math.round(cellMetric(c))}%</b></div><div class="cb-stat-line"><span>OXYGEN</span><b>${Math.round(c?.supply?.oxygen??0)}%</b></div><div class="cb-stat-line"><span>STRESS</span><b>${Math.round(c?.injury?.stress??0)}%</b></div><div class="cb-target-hint" data-valid="${valid}">${selectedAgent?`TARGET LOCK // ${esc(selectedAgent.toUpperCase())}`:'TAP REGION TO TARGET'}</div></div>`;
 $('#immRight').innerHTML=`<div class="cb-holo-panel"><div class="cb-panel-kicker">CURRENT CRISIS</div><div class="cb-panel-title">${esc(g?.scenario||'UNKNOWN')}</div><div class="cb-panel-sub">Threat evolves across the field. Watch the object first; this panel is secondary.</div><div class="cb-stat-line"><span>THREAT</span><b>${Math.round(((100-(g?.state?.viability||0))*.52+(g?.state?.inflammation||0)*.28+(g?.state?.arrhythmia||0)*.2))}</b></div><div class="cb-stat-line"><span>MOVE</span><b>${g?.moves??0}</b></div><div class="cb-stat-line"><span>REGIONS</span><b>${g?.cells?.length??0}</b></div></div>`;
}
function renderDock(){
 const dock=$('#immDock');if(!dock)return;const agents=window.CBApp?.engine?.agents||{};const list=Object.keys(agents);dock.innerHTML=list.map((id,i)=>{const a=agents[id]||{};const active=selectedAgent===id;return `<button class="cb-action ${active?'selected':''}" data-agent="${esc(id)}" type="button"><span class="cb-action-glyph">${['+','↗','◉','≈','◇','ϟ'][i%6]}</span><b>${esc(id.toUpperCase())}</b><small>${a.cost??'--'} ENERGY</small></button>`}).join('')+`<button class="cb-endturn" id="immEnd" type="button"><b>END TURN</b><small>RESOLVE CONSEQUENCE</small></button>`;
 dock.querySelectorAll('.cb-action').forEach(btn=>btn.addEventListener('click',()=>{selectedAgent=selectedAgent===btn.dataset.agent?null:btn.dataset.agent;renderDock();renderContext();if(selectedAgent)toast(`TARGETING ${selectedAgent.toUpperCase()} // TAP A REGION`);}));
 $('#immEnd').addEventListener('click',()=>{window.CBApp?.advanceDay?.();selectedAgent=null;renderAll();toast('TURN RESOLVED');});
}
function deployAtSelection(){if(!selectedAgent)return false;const result=window.CBApp?.deploy?.(selectedAgent);if(result?.ok){impactPulse();toast(`${selectedAgent.toUpperCase()} DEPLOYED // REGION ${selectedIndex+1}`);selectedAgent=null;renderAll();return true;}toast(result?.reason||'DEPLOYMENT REJECTED');return false;}
function maybeInterceptSelection(){
 const original=window.CBApp?.selectCell;if(!original||original.__immersiveWrapped)return;
 const wrapped=function(index){const ok=original.call(this,index);if(ok){selectedIndex=index;renderRegions();renderContext();if(selectedAgent)deployAtSelection();}return ok};wrapped.__immersiveWrapped=true;
 try{window.CBApp.selectCell=wrapped;}catch{}
}
function renderDeep(){const g=game(),s=g?.state||{},c=g?.cells?.[selectedIndex]||{};const data={TIMEPOINT:g?.day??0,VIABILITY:s.viability,FUNCTION:s.func,OXYGEN:s.oxygen,INFLAMMATION:s.inflammation,FIBROSIS:s.fibrosis,ARRHYTHMIA:s.arrhythmia,ENERGY:g?.energy,REGION_DAMAGE:c.injury?.damage,REGION_ROS:c.injury?.ros,REGION_REPAIR:c.repair?.capacity,REGION_CONDUCTION:c.electrical?.conduction};$('#immDeepGrid').innerHTML=Object.entries(data).map(([k,v])=>`<div class="cb-deep-item"><span>${k}</span><b>${typeof v==='number'?Math.round(v*10)/10:v??'—'}</b></div>`).join('');}
function renderAll(){const g=game(),s=g?.state||{},health=Math.round(s.viability??0);$('#immDay').textContent=`DAY ${g?.day??0}`;$('#immHealth').textContent=`${health}%`;$('#immEnergy').textContent=Math.round(g?.energy??0);$('#immScore').textContent=Math.round(window.CBApp?.engine?.score?.(g)||0);const threat=clamp((100-health)*.52+(s.inflammation||0)*.28+(s.arrhythmia||0)*.2,0,100);const flare=$('#immAlert');flare.textContent=threat>70?'CRITICAL':threat>42?'ELEVATED':'STABLE';flare.style.color=threat>70?'#ff7180':threat>42?'#ffc064':'#73e4d4';flare.style.borderColor=threat>70?'rgba(255,93,112,.42)':threat>42?'rgba(255,193,94,.35)':'rgba(83,224,211,.24)';$('#cbVolumeState').dataset.severity=threat>70?'high':threat>42?'mid':'low';renderRegions();renderContext();renderDock();if(deepScan)renderDeep();}
function impactPulse(){const g=game();if(!regionGroup||!regions.length)return;const r=regions.find(x=>x.index===selectedIndex);if(!r)return;r.mesh.scale.setScalar(2.2);const start=performance.now();const tick=()=>{const p=(performance.now()-start)/650;if(p>=1){renderRegions();return;}r.mesh.scale.setScalar(2.2+(1-p)*.35);requestAnimationFrame(tick);};tick();}
function toast(msg){const el=$('#immToast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),1700);}
function fallbackScene(){const v=$('#cbVolume');if(v)v.innerHTML='<div style="height:100%;display:grid;place-items:center;color:#72cfc5;font:700 11px Inter;letter-spacing:.18em">3D RENDERER OFFLINE</div>';}
function resize3D(){if(!renderer||!camera)return;const h=$('#cbVolume'),w=Math.max(280,h.clientWidth||700),ht=Math.max(300,h.clientHeight||650);camera.aspect=w/ht;camera.updateProjectionMatrix();renderer.setSize(w,ht,false);}
function animate3D(){if(raf)return;const loop=()=>{raf=requestAnimationFrame(loop);if(!renderer)return;const dt=clock?.getDelta?.()||.016;if(stage){stage.rotation.y+=Math.sin(performance.now()*.00022)*.0007;stage.position.y=Math.sin(performance.now()*.0014)*.018;}if(regionGroup){regionGroup.children.forEach((m,i)=>{const sev=cellSeverity(game()?.cells?.[i]);const amp=(i===selectedIndex?.index?1:0)+sev*.18;m.position.y+=Math.sin(performance.now()*.002+i)*.0005;});}renderer.render(scene,camera);if(Math.floor(performance.now()/500)!==Math.floor((performance.now()-dt*1000)/500)){syncIncidentBeacons(game()?.cells||[]);} };loop();}
function bindApp(){const app=window.CBApp;if(!app)return;app.subscribe?.(()=>{maybeInterceptSelection();renderAll();});document.addEventListener('cardiac3d:select',()=>{});maybeInterceptSelection();renderAll();}
async function start(){createShell();document.body.classList.add('cb-immersive');await init3D();bindApp();renderAll();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
