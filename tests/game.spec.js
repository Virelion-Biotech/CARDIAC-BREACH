const {test,expect}=require('@playwright/test');

async function boot(page,seed=42){
  await page.goto('/');
  await page.waitForFunction(()=>document.documentElement.dataset.appReady==='true');
  await page.waitForFunction(()=>document.documentElement.dataset.compatReady==='true');
  await page.getByRole('button',{name:'NEW RUN'}).click();
  await page.waitForFunction(()=>window.CBApp?.state?.day===0);
  await page.evaluate(seed=>{window.CBApp.newRun('ischemia',seed)},seed);
}

const state=page=>page.evaluate(()=>{
  const g=window.CBApp.state;
  const system=g.state||{};
  return {version:g.version,day:g.day,energy:g.energy??system.energy,viability:system.viability,func:system.func,cells:g.cells.length,moves:g.moves??g.commandPoints,history:g.history?.length||0};
});

test.describe('CARDIAC//BREACH v4 gameplay contract',()=>{
  test('boots through the explicit modular application lifecycle',async({page})=>{
    await boot(page,101);
    const s=await state(page);
    expect(s.day).toBe(0);expect(s.cells).toBe(216);expect(s.version).toBeGreaterThanOrEqual(3);
    await expect(page.locator('#tissue')).toBeVisible();
    await expect(page.locator('#agentList .agent')).toHaveCount(6);
    await expect(page.locator('#rogueChoices')).toBeVisible();
  });

  test('spatial intervention consumes the single critical move',async({page})=>{
    await boot(page,202);
    const before=await state(page);
    await page.evaluate(()=>window.CBApp.selectCell(17));
    const result=await page.evaluate(()=>window.CBApp.deploy('vascular'));
    expect(result.ok).toBeTruthy();
    const after=await state(page);
    expect(after.energy).toBeLessThan(before.energy);
    expect(after.moves).toBe(0);
    expect(await page.evaluate(()=>CBApp.state.agents[0].targetCell)).toBe(17);
  });

  test('end turn advances exactly one day and restores the next critical move',async({page})=>{
    await boot(page,303);
    await page.evaluate(()=>window.CBApp.deploy('stabilizer'));
    await page.getByRole('button',{name:'END TURN'}).click();
    const after=await state(page);
    expect(after.day).toBe(1);
    expect(after.moves).toBe(1);
  });

  test('same seed and same decisions are deterministic',async({browser})=>{
    const run=async()=>{const context=await browser.newContext();const page=await context.newPage();await boot(page,404);await page.evaluate(()=>{CBApp.selectCell(88);CBApp.deploy('vascular');CBApp.advanceDay();CBApp.selectCell(91);CBApp.deploy('electrical');CBApp.advanceDay()});const snapshot=await page.evaluate(()=>CBApp.state);await context.close();return JSON.stringify(snapshot)};
    expect(await run()).toBe(await run());
  });

  test('different placement produces different spatial state',async({browser})=>{
    const run=async(cell)=>{const context=await browser.newContext();const page=await context.newPage();await boot(page,505);await page.evaluate(cell=>{CBApp.selectCell(cell);CBApp.deploy('vascular');CBApp.advanceDay()},cell);const result=await page.evaluate(()=>({oxygen:CBApp.state.state?.oxygen,hotspots:CBApp.state.hotspots?.map(h=>h.severity)}));await context.close();return result};
    expect(await run(0)).not.toEqual(await run(215));
  });

  test('keyboard arrows move the selected cell without changing the turn',async({page})=>{
    await boot(page,606);
    const before=await page.evaluate(()=>CBApp.selectedCell);
    await page.keyboard.press('ArrowRight');
    const after=await page.evaluate(()=>({selected:CBApp.selectedCell,day:CBApp.state.day}));
    expect(after.selected).toBe(before+1);expect(after.day).toBe(0);
  });
});
