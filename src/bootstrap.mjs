import {CardiacAppController} from './app/controller.mjs';
import {createGamePort} from './core/game-port.mjs';
import {installAccessibility} from './runtime/accessibility.mjs';

const mount=()=>{
  const legacyEngine=window.CBMechanisticGameEngine;
  const physiology=window.CBPhysiology;
  if(!legacyEngine)throw new Error('Authoritative game engine did not load before bootstrap');
  if(!physiology)throw new Error('Physiology kernel did not load before bootstrap');
  installAccessibility(document);
  const engine=createGamePort(legacyEngine);
  const app=new CardiacAppController({engine,physiology});
  app.mount();
  window.CBApp=app;
  document.documentElement.dataset.appReady='true';
  document.documentElement.dispatchEvent(new CustomEvent('cardiac:app-ready',{detail:{app}}));
};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
else mount();
