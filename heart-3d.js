/* CARDIAC//BREACH — anatomical interactive heart viewer
 * Uses the Human-Organ3D heart.glb at runtime instead of a procedural placeholder.
 * The source project documents the heart as a realistic GLB with chambers/vessels and heartbeat animation.
 */
(()=>{
'use strict';
const THREE_URL='https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js';
const GLTF_URL='https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
const HEART_URL='https://raw.githubusercontent.com/yihalem123/Human-Organ3D/main/models/heart.glb';
const host=()=>document.getElementById('heart3d');
let api=null;
function load(url){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.onload=resolve;s.onerror=()=>reject(new Error(`Failed to load ${url}`));document.head.appendChild(s);});}
function fallback(){const el=host();if(!el)return;el.innerHTML='<div class="heart3d-fallback"><div class="fallback-anatomy"><span></span><span></span><span></span></div><div><b>ANATOMICAL MODEL OFFLINE</b><span>The tactical simulation remains fully playable. Reconnect to load the high-resolution heart model.</span></div></div>';}
function fitObject(THREE,obj){const box=new THREE.Box3().setFromObject(obj),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());obj.position.sub(center);const max=Math.max(size.x,size.y,size.z)||1;obj.scale.multiplyScalar(4.6/max);return obj;}
async function init(){
 const el=host();if(!el)return;
 try{
  if(!window.THREE)await load(THREE_URL);
  if(!THREE.GLTFLoader)await load(GLTF_URL);
  const W=()=>Math.max(300,el.clientWidth||720),H=()=>Math.max(320,el.clientHeight||520);
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x080a0d);
  const camera=new THREE.PerspectiveCamera(24,W()/H(),.01,100);camera.position.set(0,.15,7.8);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));renderer.setSize(W(),H(),false);renderer.setClearColor(0x080a0d,1);renderer.gammaOutput=true;renderer.gammaFactor=2.2;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  el.innerHTML='';el.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Interactive realistic anatomical heart model');renderer.domElement.style.touchAction='none';
  const hemi=new THREE.HemisphereLight(0xdce7ef,0x090b0e,1.7);scene.add(hemi);
  const key=new THREE.DirectionalLight(0xffe1cf,4.2);key.position.set(4,6,7);key.castShadow=true;scene.add(key);
  const fill=new THREE.DirectionalLight(0x89b8ff,1.2);fill.position.set(-5,2,4);scene.add(fill);
  const rim=new THREE.PointLight(0x50d9ca,8,10);rim.position.set(-4,0,3);scene.add(rim);
  const group=new THREE.Group();scene.add(group);
  const loader=new THREE.GLTFLoader();
  const gltf=await new Promise((resolve,reject)=>loader.load(HEART_URL,resolve,undefined,reject));
  const model=fitObject(THREE,gltf.scene||gltf.scenes?.[0]);
  group.add(model);
  const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3());
  camera.position.z=Math.max(5.6,Math.max(size.x,size.y,size.z)*1.65);
  model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material){o.material.side=THREE.DoubleSide;o.material.needsUpdate=true;}}});
  let mixer=null;if(gltf.animations?.length){mixer=new THREE.AnimationMixer(model);gltf.animations.forEach(clip=>mixer.clipAction(clip).play());}
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let dragging=false,lastX=0,lastY=0,downTime=0;
  function point(e){const r=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;}
  renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;downTime=performance.now();lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture?.(e.pointerId);});
  renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;group.rotation.y+=(e.clientX-lastX)*.006;group.rotation.x=Math.max(-.55,Math.min(.55,group.rotation.x+(e.clientY-lastY)*.004));lastX=e.clientX;lastY=e.clientY;});
  renderer.domElement.addEventListener('pointerup',e=>{dragging=false;if(performance.now()-downTime>350)return;point(e);ray.setFromCamera(pointer,camera);const hit=ray.intersectObject(model,true)[0];if(!hit)return;let obj=hit.object;while(obj&&obj.parent&&obj.parent!==model)obj=obj.parent;const raw=(hit.object.name||obj?.name||'CARDIAC STRUCTURE').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();const name=raw||'CARDIAC STRUCTURE';document.dispatchEvent(new CustomEvent('cardiac3d:select',{detail:{name}}));window.CB_BeginnerGuide?.flash?.(`${name.toUpperCase()} selected`);});
  renderer.domElement.addEventListener('pointerleave',()=>{dragging=false;});
  renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();camera.position.z=Math.max(3.8,Math.min(12,camera.position.z+e.deltaY*.004));},{passive:false});
  renderer.domElement.addEventListener('dblclick',()=>{group.rotation.set(0,.15,0);camera.position.z=Math.max(5.6,Math.max(size.x,size.y,size.z)*1.65);});
  const clock=new THREE.Clock();
  function resize(){const w=W(),h=H();camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}
  new ResizeObserver(resize).observe(el);
  api={scene,model,group,renderer,setStress(v){rim.intensity=4+Math.max(0,Math.min(1,v))*14;}};window.CB_Heart3D=api;
  document.addEventListener('cardiac:heart-state',e=>api.setStress(Number(e.detail?.severity)||0));
  function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05);if(mixer)mixer.update(dt);else model.scale.setScalar(1+Math.sin(performance.now()*.0036)*.012);renderer.render(scene,camera);}frame();
 }catch(err){console.warn('Anatomical heart model unavailable',err);fallback();}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
