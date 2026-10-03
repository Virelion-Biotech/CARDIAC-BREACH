(() => {
 const overlay=document.createElement('div');overlay.id='introOverlay';overlay.innerHTML=`
 <div class="intro-card" role="dialog" aria-modal="true" aria-labelledby="introTitle">
   <div class="intro-mark">C//B</div>
   <div class="intro-kicker">VIRELION // CARDIAC SYSTEMS LAB</div>
   <h2 id="introTitle">CARDIAC<span>//</span>BREACH</h2>
   <p class="intro-lede">Contain tissue failure. Build a response team. Keep the whole system stable for 24 simulated days.</p>

   <div class="intro-objective"><b>YOUR OBJECTIVE</b><span>Finish the run with the highest possible system score. Protect viability and function without letting inflammation, fibrosis, or electrical instability run away.</span></div>

   <div class="intro-section-title">FIRST RUN — 4 STEPS</div>
   <div class="intro-steps">
     <div><b>01</b><strong>CHOOSE</strong><span>Pick a scenario. Each creates a different pressure on the tissue.</span></div>
     <div><b>02</b><strong>DEPLOY</strong><span>Build a team of up to <em>5</em>. Every agent costs energy.</span></div>
     <div><b>03</b><strong>MONITOR</strong><span>Inspect regions and watch the system metrics before advancing.</span></div>
     <div><b>04</b><strong>ADAPT</strong><span>Advance one day at a time. Change your strategy as the tissue responds.</span></div>
   </div>

   <div class="intro-guides">
     <div><b>WATCH</b><span>VIABILITY · FUNCTION · OXYGEN</span></div>
     <div><b>CONTROL</b><span>INFLAMMATION · FIBROSIS · ARRHYTHMIA</span></div>
     <div><b>RESOURCES</b><span>ENERGY · 5 DEPLOYMENT SLOTS</span></div>
   </div>

   <details class="intro-details">
     <summary>Controls & advanced play</summary>
     <div class="intro-detail-grid">
       <div><b>NEW RUN</b><span>Reset the tissue and start a fresh 24-day simulation.</span></div>
       <div><b>ADVANCE DAY</b><span>Resolve the next simulation day and consume agent resources.</span></div>
       <div><b>REGION INSPECTOR</b><span>Click a tissue region to inspect local stress, damage, oxygen, energy, scar, and maturity.</span></div>
       <div><b>NEIGHBORS</b><span>Sample the selected region's local neighborhood to reveal spatial context.</span></div>
       <div><b>EVOLUTION LAB</b><span>Seed, evolve, archive, and deploy synthetic policies after learning the basic loop.</span></div>
       <div><b>EXPORT RUN</b><span>Save the current simulation record for later analysis.</span></div>
     </div>
   </details>

   <div class="intro-tip"><span>TIP</span> There is no universally optimal team. Complementary agents usually outperform stacking one role.</div>
   <button id="enterSim">ENTER SIMULATION</button>
   <div class="intro-note">SYNTHETIC EDUCATIONAL SIMULATION · NO REAL BIOLOGICAL PROCEDURES</div>
 </div>`;
 document.body.prepend(overlay);
 const enter=document.getElementById('enterSim');
 enter.onclick=()=>{overlay.classList.add('leave');setTimeout(()=>overlay.remove(),650)};
 enter.focus();
})();
