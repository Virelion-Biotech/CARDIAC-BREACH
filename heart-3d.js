/* CARDIAC//BREACH — interactive 3D cardiac model
 * Procedural model: no external asset required. Three.js is loaded lazily from a CDN.
 * Interactions: drag to orbit, wheel to zoom, click structures, pulse with game state.
 */
(()=>{
'use strict';
const CDN='https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js';
const host=()=>document.getElementById('heart3d');
let api=null;
function fallback(){const el=host();if(!el)return;el.innerHTML='<div class="heart3d-fallback"><div class="fallback-heart">❤</div><div><b>3D CARDIAC MODEL</b><span>Interactive model unavailable — tactical simulation remains fully playable.</span></div></div>';}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function loadScript(){return import(CDN);}
function sphere(THREE,rx,ry,rz,mat){const g=new THREE.SphereGeometry(1,48,32);const m=new THREE.Mesh(g,mat);m.scale.set(rx,ry,rz);return m;}
function tube(THREE,pts,radius,mat){const curve=new THREE.CatmullRomCurve3(pts);const g=new THREE.TubeGeometry(curve,32,radius,16,false);return new THREE.Mesh(g,mat);}
async function init(){
 const el=host();if(!el)return;
 try{
  const THREE=await loadScript();
  const width=()=>Math.max(260,el.clientWidth||640),height=()=>Math.max(280,el.clientHeight||420);
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x071018);scene.fog=new THREE.Fog(0x071018,10,24);
  const camera=new THREE.PerspectiveCamera(32,width()/height(),0.1,100);camera.position.set(.15,.15,8.3);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(width(),height(),false);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
  el.innerHTML='';el.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Interactive three dimensional cardiac model');
  const root=new THREE.Group();root.rotation.set(-.10,.16,0);scene.add(root);
  scene.add(new THREE.HemisphereLight(0x86c8ff,0x091014,2.1));const key=new THREE.DirectionalLight(0xffe4d2,3.5);key.position.set(4,6,8);scene.add(key);const rim=new THREE.PointLight(0x62f1d7,32,14);rim.position.set(-4,1,4);scene.add(rim);const accent=new THREE.PointLight(0xff5d71,18,12);accent.position.set(4,-2,3);scene.add(accent);
  const heartMat=new THREE.MeshPhysicalMaterial({color:0x9b3046,roughness:.42,metalness:.02,clearcoat:.32,clearcoatRoughness:.2});
  const muscleMat=new THREE.MeshPhysicalMaterial({color:0xc24f68,roughness:.56,metalness:.02,clearcoat:.18});
  const vesselMat=new THREE.MeshPhysicalMaterial({color:0xb7c3cc,roughness:.32,metalness:.2,clearcoat:.25});
  const cyanMat=new THREE.MeshBasicMaterial({color:0x56e6d0});const darkMat=new THREE.MeshBasicMaterial({color:0x0a1117,transparent:true,opacity:.5,wireframe:true});
  const structure=new THREE.Group();root.add(structure);
  const left=sphere(THREE,1.65,2.0,1.25,muscleMat);left.position.set(-.68,.28,0);left.rotation.z=-.17;
  const right=sphere(THREE,1.5,1.75,1.18,heartMat);right.position.set(.73,.42,.05);right.rotation.z=.16;
  const apex=sphere(THREE,1.18,1.58,1.0,heartMat);apex.position.set(.02,-1.2,-.02);apex.rotation.z=.08;
  const septum=sphere(THREE,.68,1.34,1.16,new THREE.MeshPhysicalMaterial({color:0x7d2639,roughness:.5}));septum.position.set(.02,.1,.25);[left,right,apex,septum].forEach(m=>structure.add(m));
  const aorta=tube(THREE,[new THREE.Vector3(.15,1.48,.15),new THREE.Vector3(.25,2.18,.26),new THREE.Vector3(.62,2.78,.3),new THREE.Vector3(1.22,2.8,.15)],.27,vesselMat);aorta.rotation.z=-.08;structure.add(aorta);
  const pulmonary=tube(THREE,[new THREE.Vector3(-.18,1.52,.12),new THREE.Vector3(-.45,2.0,.18),new THREE.Vector3(-1.16,2.24,.1),new THREE.Vector3(-1.72,2.05,.03)],.23,vesselMat);structure.add(pulmonary);
  const svc=tube(THREE,[new THREE.Vector3(1.0,1.75,.2),new THREE.Vector3(1.0,2.88,.18),new THREE.Vector3(.9,3.45,.1)],.22,vesselMat);structure.add(svc);
  const ivc=tube(THREE,[new THREE.Vector3(1.0,-.18,.2),new THREE.Vector3(1.16,-1.1,.18),new THREE.Vector3(1.38,-1.82,.12)],.21,vesselMat);structure.add(ivc);
  const coronary=tube(THREE,[new THREE.Vector3(-1.36,.45,1.0),new THREE.Vector3(-.78,.05,1.18),new THREE.Vector3(-.1,-.36,1.24),new THREE.Vector3(.73,-.68,1.1),new THREE.Vector3(1.25,-.54,.94)],.052,cyanMat);structure.add(coronary);
  const coronary2=tube(THREE,[new THREE.Vector3(-.54,1.04,1.08),new THREE.Vector3(-.24,.46,1.28),new THREE.Vector3(.05,-.02,1.34),new THREE.Vector3(.26,-.72,1.22)],.046,cyanMat);structure.add(coronary2);
  const shell=sphere(THREE,1.98,2.35,1.48,darkMat);shell.position.set(0,.18,0);root.add(shell);
  const labels=new THREE.Group();root.add(labels);
  function label(text,color='white',small=false){const c=document.createElement('canvas');c.width=small?256:384;c.height=72;const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.font=`800 ${small?22:28}px Inter,Arial,sans-serif`;x.fillStyle=color;x.fillText(text,8,40);const tx=new THREE.CanvasTexture(c);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false}));sp.scale.set(small?1.55:2.1,.44,1);return sp;}
  const lab=label('CARDIAC CORE','#d9ff62');lab.position.set(-2.7,3.15,0);labels.add(lab);const mode=label('LIVE MODEL','#67ead7',true);mode.position.set(2.0,-2.9,0);labels.add(mode);
  const hotspot=sphere(THREE,.20,.20,.20,new THREE.MeshBasicMaterial({color:0xff5d71,transparent:true,opacity:1}));hotspot.position.set(0,-.1,1.34);structure.add(hotspot);const ring=new THREE.Mesh(new THREE.TorusGeometry(.34,.035,10,48),new THREE.MeshBasicMaterial({color:0xd9ff62,transparent:true,opacity:.9}));ring.position.copy(hotspot.position);ring.rotation.x=Math.PI/2;structure.add(ring);
  let dragging=false,lastX=0,lastY=0,zoom=1,hovered=null;const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();const pickables=[left,right,apex,septum,aorta,pulmonary];
  function point(e){const r=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;}
  renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture?.(e.pointerId);});
  renderer.domElement.addEventListener('pointerup',e=>{dragging=false;point(e);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(pickables,false)[0];if(hit){const names=new Map([[left,'LEFT VENTRICLE'],[right,'RIGHT VENTRICLE'],[apex,'APEX / MYOCARDIUM'],[septum,'SEPTUM'],[aorta,'AORTA'],[pulmonary,'PULMONARY ARTERY']]);const name=names.get(hit.object)||'CARDIAC STRUCTURE';window.CB_BeginnerGuide?.flash?.(`${name} selected`);document.dispatchEvent(new CustomEvent('cardiac3d:select',{detail:{name}}));}});
  renderer.domElement.addEventListener('pointermove',e=>{if(dragging){root.rotation.y+=(e.clientX-lastX)*.008;root.rotation.x=clamp(root.rotation.x+(e.clientY-lastY)*.005,-.75,.5);lastX=e.clientX;lastY=e.clientY;}else{point(e);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(pickables,false)[0];if(hit!==hovered){hovered=hit?.object||null;renderer.domElement.style.cursor=hovered?'pointer':'grab';}}});
  renderer.domElement.addEventListener('pointerleave',()=>dragging=false);renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();zoom=clamp(zoom+e.deltaY*.0012,.72,1.32);},{passive:false});renderer.domElement.addEventListener('dblclick',()=>{root.rotation.set(-.1,.16,0);zoom=1;});
  function resize(){const w=width(),h=height();camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}new ResizeObserver(resize).observe(el);
  let t=0;function animate(){requestAnimationFrame(animate);t+=.018;const pulse=1+Math.sin(t*4.2)*.025;structure.scale.setScalar(pulse);ring.scale.setScalar(1+.10*Math.sin(t*4.2));hotspot.material.opacity=.65+.35*Math.sin(t*4.2);root.rotation.y+=.0018;camera.position.z=8.3/zoom;camera.lookAt(0,.2,0);renderer.render(scene,camera);}animate();
  api={scene,root,hotspot,ring,renderer,setStress(v){accent.intensity=12+v*30;hotspot.material.color.set(v>.65?0xff5d71:0xd9ff62);}};window.CB_Heart3D=api;
  document.addEventListener('cardiac:heart-state',e=>api.setStress(clamp(Number(e.detail?.severity||0),0,1)));
 }catch(err){console.warn('CARDIAC//BREACH 3D model unavailable',err);fallback();}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
