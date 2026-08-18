const {test,expect}=require('@playwright/test');

test.describe('application architecture',()=>{
  test('mounts through the explicit ES-module lifecycle',async({page})=>{
    await page.goto('/');
    await page.waitForFunction(()=>document.documentElement.dataset.appReady==='true');
    await page.waitForFunction(()=>document.documentElement.dataset.compatReady==='true');
    const snapshot=await page.evaluate(()=>({
      app:!!window.CBApp,
      compat:!!window.CBCompat,
      ready:document.documentElement.dataset.appReady,
      compatReady:document.documentElement.dataset.compatReady,
      moduleBootstrap:document.querySelector('script[type="module"][src="src/bootstrap.mjs"]')!==null,
      oldAdapterLoaded:Array.from(document.scripts).some(s=>/game-core-adapter\.js$/.test(s.src)),
      oldAppControllerLoaded:Array.from(document.scripts).some(s=>/app-controller\.js$/.test(s.src))
    }));
    expect(snapshot.app).toBeTruthy();expect(snapshot.compat).toBeTruthy();
    expect(snapshot.ready).toBe('true');expect(snapshot.compatReady).toBe('true');
    expect(snapshot.moduleBootstrap).toBeTruthy();
    expect(snapshot.oldAdapterLoaded).toBeFalsy();
    expect(snapshot.oldAppControllerLoaded).toBeFalsy();
  });

  test('legacy compatibility is isolated to CBCompat',async({page})=>{
    await page.goto('/');
    await page.waitForFunction(()=>document.documentElement.dataset.compatReady==='true');
    const source=await page.evaluate(async()=>await (await fetch('/legacy-compat.js')).text());
    expect(source).not.toContain('setTimeout');
    expect(source).toContain('cardiac:app-ready');
    expect(source).toContain('window.CBCompat');
    expect(source).not.toContain('window.cells =');
    expect(source).not.toContain('window.state =');
  });
});
