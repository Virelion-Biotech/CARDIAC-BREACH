const {test,expect}=require('@playwright/test');

async function boot(page,seed=42){
  await page.addInitScript({content:`localStorage.clear();(${String(()=>{let s=42;Math.random=()=>{s=(1664525*s+1013904223)>>>0;return s/4294967296}})})()`});
  await page.goto('/');
  await page.waitForFunction(()=>window.CBGameV2&&window.CBGameV2.get&&window.CBGameCoreV2);
  await page.getByRole('button',{name:'NEW RUN'}).click();
  await page.waitForFunction(()=>window.CBGameV2.get()?.version===2);
}

test.describe('v2 tactical core',()=>{
  test('exposes a single authoritative core state',async({page})=>{
    await boot(page,101);
    const snap=await page.evaluate(()=>({version:CBGameV2.get().version,day:CBGameV2.get().day,commands:CBGameV2.get().commandPoints,seed:CBGameV2.get().seed,cells:CBGameV2.get().cells.length}));
    expect(snap.version).toBe(2);expect(snap.day).toBe(0);expect(snap.commands).toBe(2);expect(snap.cells).toBe(216);expect(snap.seed).toBeGreaterThanOrEqual(0);
  });

  test('deployment is spatial and consumes both energy and command points',async({page})=>{
    await boot(page,202);
    const before=await page.evaluate(()=>({energy:CBGameV2.get().state.energy,commands:CBGameV2.get().commandPoints}));
    await page.locator('#agentList .agent').filter({hasText:'STABILIZER'}).getByRole('button',{name:'DEPLOY'}).click();
    const after=await page.evaluate(()=>({energy:CBGameV2.get().state.energy,commands:CBGameV2.get().commandPoints,target:CBGameV2.get().agents[0].targetCell,range:CBGameV2.get().agents[0].range}));
    expect(after.energy).toBeLessThan(before.energy);expect(after.commands).toBe(before.commands-1);expect(after.target).toBe(0);expect(after.range).toBeGreaterThan(0);
  });

  test('two commands are available each turn and reset at resolution',async({page})=>{
    await boot(page,303);
    await page.locator('#agentList .agent').nth(0).getByRole('button',{name:'DEPLOY'}).click();
    await page.locator('#agentList .agent').nth(1).getByRole('button',{name:'DEPLOY'}).click();
    await expect(page.locator('#coreObjectives')).toContainText('0 COMMANDS');
    await page.getByRole('button',{name:'RESOLVE DAY'}).click();
    await expect(page.locator('#coreObjectives')).toContainText('2 COMMANDS');
    await expect(page.locator('#day')).toHaveText('1');
  });

  test('same seed and same actions produce the same result',async({browser})=>{
    const run=async()=>{const c=await browser.newContext();const p=await c.newPage();await boot(p,404);await p.locator('#agentList .agent').filter({hasText:'VASCULAR SUPPORT'}).getByRole('button',{name:'DEPLOY'}).click();await p.getByRole('button',{name:'RESOLVE DAY'}).click();await p.getByRole('button',{name:'RESOLVE DAY'}).click();const s=await p.evaluate(()=>({day:CBGameV2.get().day,state:{...CBGameV2.get().state},hotspots:CBGameV2.get().mission.hotspots.map(h=>({severity:h.severity,resolved:h.resolved}))}));await c.close();return s};
    expect(await run()).toEqual(await run());
  });

  test('different placement changes spatial outcome',async({browser})=>{
    const run=async(cell)=>{const c=await browser.newContext();const p=await c.newPage();await boot(p,505);await p.evaluate(i=>window.selected=i,cell);await p.locator('#agentList .agent').filter({hasText:'VASCULAR SUPPORT'}).getByRole('button',{name:'DEPLOY'}).click();await p.getByRole('button',{name:'RESOLVE DAY'}).click();const s=await p.evaluate(()=>({oxygen:CBGameV2.get().state.oxygen,hot:CBGameV2.get().mission.hotspots.map(h=>h.severity)}));await c.close();return s};
    expect(await run(0)).not.toEqual(await run(215));
  });
});
