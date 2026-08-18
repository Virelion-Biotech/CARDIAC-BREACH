const {test,expect}=require('@playwright/test');

test.describe('application lifecycle architecture',()=>{
  test('mounts through explicit CBApp lifecycle',async({page})=>{
    await page.goto('/');
    await page.waitForFunction(()=>document.documentElement.dataset.appReady==='true');
    await expect(page.locator('body')).toHaveAttribute('data-commands','2');
    const snapshot=await page.evaluate(()=>({app:!!window.CBApp,core:!!window.CBGameCoreV2,compat:!!window.CBCompat,ready:document.documentElement.dataset.appReady,compatReady:document.documentElement.dataset.compatReady}));
    expect(snapshot.app).toBeTruthy();
    expect(snapshot.core).toBeTruthy();
    expect(snapshot.compat).toBeTruthy();
    expect(snapshot.ready).toBe('true');
    expect(snapshot.compatReady).toBe('true');
  });

  test('CBApp owns the authoritative state and selected cell',async({page})=>{
    await page.goto('/');
    await page.waitForFunction(()=>document.documentElement.dataset.appReady==='true');
    const before=await page.evaluate(()=>({day:window.CBApp.state.day,energy:window.CBApp.state.state.energy,selected:window.CBApp.selectedCell}));
    await page.locator('#tissue').click({position:{x:650,y:350}});
    const afterSelection=await page.evaluate(()=>({selected:window.CBApp.selectedCell,day:window.CBApp.state.day}));
    expect(afterSelection.day).toBe(before.day);
    expect(afterSelection.selected).not.toBe(before.selected);
    await page.getByRole('button',{name:'RESOLVE DAY'}).click();
    const afterTurn=await page.evaluate(()=>({day:window.CBApp.state.day,energy:window.CBApp.state.state.energy}));
    expect(afterTurn.day).toBe(1);
    expect(afterTurn.energy).toBeLessThanOrEqual(100);
  });

  test('legacy timing takeover is absent from the v2 adapter',async({page})=>{
    await page.goto('/');
    const source=await page.evaluate(async()=>await (await fetch('/game-core-adapter.js')).text());
    expect(source).not.toContain('setTimeout(bind,520)');
    expect(source).not.toContain('window.cells=');
    expect(source).not.toContain('window.state=');
    expect(source).toContain('window.CBGameV2');
  });
});
