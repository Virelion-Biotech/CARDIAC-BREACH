const {test,expect}=require('@playwright/test');

test.describe('immersive 3D command center',()=>{
 test('replaces the dashboard with the command-center shell',async({page})=>{
  await page.goto('/');
  await page.waitForSelector('#cbImmersive');
  await expect(page.locator('#cbImmersive')).toBeVisible();
  await expect(page.locator('.dashboard')).toBeHidden();
  await expect(page.locator('.lower')).toBeHidden();
  await expect(page.locator('#cbVolume')).toBeVisible();
  await expect(page.locator('#immDock')).toBeVisible();
  await expect(page.locator('#immEnd')).toBeVisible();
 });
 test('region selection is direct manipulation',async({page})=>{
  await page.goto('/');
  await page.waitForSelector('#cbImmersive');
  await page.waitForFunction(()=>window.CBApp?.state?.cells?.length>0);
  await page.evaluate(()=>document.dispatchEvent(new CustomEvent('cb:immersive-selection')));
  const state=await page.evaluate(()=>({immersive:!!document.querySelector('#cbImmersive'),appSelected:Number.isInteger(window.CBApp?.selectedCell)}));
  expect(state.immersive).toBe(true);
  expect(state.appSelected).toBe(true);
 });
 test('deep scan is opt-in',async({page})=>{
  await page.goto('/');
  await page.waitForSelector('#cbImmersive');
  await expect(page.locator('#immDeep')).not.toHaveClass(/open/);
  await page.locator('#immScan').click();
  await expect(page.locator('#immDeep')).toHaveClass(/open/);
  await page.locator('#immDeepClose').click();
  await expect(page.locator('#immDeep')).not.toHaveClass(/open/);
 });
 test('mobile shell remains usable',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.waitForSelector('#cbImmersive');
  const boxes=await page.evaluate(()=>Object.fromEntries(['#cbVolume','#immDock','#immEnd','#immScan'].map(s=>{const r=document.querySelector(s)?.getBoundingClientRect();return[s,{w:r?.width||0,h:r?.height||0,left:r?.left||0,right:r?.right||0,top:r?.top||0,bottom:r?.bottom||0}] })));
  for(const b of Object.values(boxes))expect(b.w).toBeGreaterThan(0);
  expect(boxes['#immDock'].bottom).toBeLessThanOrEqual(844);
 });
});
