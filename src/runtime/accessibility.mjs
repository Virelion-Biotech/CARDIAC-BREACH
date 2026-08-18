export function installAccessibility(documentRef=document){
  const tissue=documentRef.getElementById('tissue');
  if(tissue){
    tissue.tabIndex=0;
    tissue.setAttribute('role','grid');
    tissue.setAttribute('aria-label','Cardiac tissue board. Use arrow keys to move the selected cell.');
    tissue.setAttribute('aria-keyshortcuts','ArrowUp ArrowDown ArrowLeft ArrowRight');
  }
  const log=documentRef.getElementById('log');
  if(log){log.setAttribute('role','log');log.setAttribute('aria-live','polite');log.setAttribute('aria-relevant','additions text');}
  const style=documentRef.createElement('style');
  style.textContent='@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}';
  documentRef.head.appendChild(style);
}
