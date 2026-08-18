const {test,expect}=require('@playwright/test');

async function boot(page,seed=123){
  await page.addInitScript({content:`(()=>{let s=${seed>>>0};Math.random=()=>{s=(1664525*s+1013904223)>>>0;return s/4294967296}})()`});
  await page.goto('/');
  await page.waitForFunction(()=>window.CBApp?.state && window.CBGameCoreV2);
}

test.describe('deep hidden tissue model',()=>{
  test('hidden state has multiple coupled layers while player state stays compact',async({page})=>{
    await boot(page);
    const snapshot=await page.evaluate(()=>{
      const g=window.CBApp.state;
      return {
        player:Object.keys(g.state),
        hidden:Object.keys(g.hidden),
        cell:Object.keys(g.cells[0]),
        command:g.commandPoints,
        day:g.day
      };
    });
    expect(snapshot.player).toEqual(expect.arrayContaining(['viability','func','inflammation','fibrosis','oxygen','arrhythmia','metabolic','energy']));
    expect(snapshot.hidden).toEqual(expect.arrayContaining(['systemicROS','neurohumoral','hemodynamicReserve','repairCapacity','conductionReserve','scarBurden','globalPerfusion','globalATP']));
    expect(snapshot.cell).toEqual(expect.arrayContaining(['perfusion','oxygen','atp','ros','stress','damage','repair','immune','matrix','conduction','mature','perfusionDebt','calcium','edema']));
    expect(snapshot.command).toBe(1);
    expect(snapshot.day).toBe(0);
  });

  test('different intervention locations produce different hidden trajectories',async({browser})=>{
    async function run(target){
      const context=await browser.newContext();const page=await context.newPage();await boot(page,777);
      await page.evaluate(t=>window.CBApp.selectCell(t),target);
      await page.evaluate(()=>window.CBApp.deploy('vascular'));
      await page.evaluate(()=>window.CBApp.advanceDay());
      const result=await page.evaluate(()=>({state:{...window.CBApp.state.state},hidden:{...window.CBApp.state.hidden},hotspots:window.CBApp.state.mission.hotspots.map(h=>h.severity)}));
      await context.close();return result;
    }
    const a=await run(0),b=await run(107);
    expect(a.hidden.globalPerfusion).not.toBeCloseTo(b.hidden.globalPerfusion,5);
    expect(a.hotspots).not.toEqual(b.hotspots);
  });

  test('hidden physiological variables remain bounded and resolve into readable outcomes',async({page})=>{
    await boot(page,991);
    await page.evaluate(()=>{for(let i=0;i<12;i++)window.CBApp.advanceDay()});
    const values=await page.evaluate(()=>{
      const g=window.CBApp.state;
      return {
        state:g.state,
        hidden:g.hidden,
        cells:g.cells.slice(0,12).map(c=>({perfusion:c.perfusion,oxygen:c.oxygen,atp:c.atp,ros:c.ros,stress:c.stress,damage:c.damage,repair:c.repair,immune:c.immune,matrix:c.matrix,conduction:c.conduction,mature:c.mature,calcium:c.calcium,edema:c.edema}))
      };
    });
    for(const v of Object.values(values.state))expect(v).toBeGreaterThanOrEqual(0),expect(v).toBeLessThanOrEqual(100);
    for(const key of Object.keys(values.hidden))expect(values.hidden[key]).toBeGreaterThanOrEqual(0),expect(values.hidden[key]).toBeLessThanOrEqual(100);
    for(const cell of values.cells)for(const v of Object.values(cell)){expect(v).toBeGreaterThanOrEqual(0);expect(v).toBeLessThanOrEqual(100)}
  });
});
