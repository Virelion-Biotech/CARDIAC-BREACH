import {test,expect} from '@playwright/test';

async function openGame(page,{dismissInitialCrisis=false}={}){
  await page.addInitScript(()=>localStorage.setItem('cb-beginner-tutorial-v6:seen','1'));
  await page.goto('/');
  await page.waitForSelector('#cbImmersive');
  await page.waitForFunction(()=>window.CBApp?.state?.cells?.length===216);
  if(dismissInitialCrisis && await page.locator('#ciCrisis.open').count()) await page.keyboard.press('Escape');
}

test.describe('immersive functional loop',()=>{
  test('select -> arm -> deploy updates the real game state',async({page})=>{
    await openGame(page,{dismissInitialCrisis:true});
    await page.locator('#ciHeart').click({position:{x:0.5,y:0.5}});
    await expect.poll(async()=>page.evaluate(()=>Number.isInteger(window.CBImmersiveSelection?.index))).toBe(true);
    await page.locator('.ci-ability[data-agent="stabilizer"]').click();
    await page.locator('#ciHeart').click({position:{x:0.52,y:0.48}});
    await expect.poll(async()=>page.evaluate(()=>window.CBApp.state.agents.length)).toBe(1);
    expect(await page.evaluate(()=>window.CBApp.state.moves)).toBe(0);
    expect(await page.evaluate(()=>window.CBApp.state.agents[0].targetCell)).toBe(await page.evaluate(()=>window.CBApp.selectedCell));
  });

  test('UI energy costs match the authoritative engine',async({page})=>{
    await openGame(page,{dismissInitialCrisis:true});
    const costs=await page.evaluate(()=>Object.fromEntries(Object.entries(window.CBMechanisticGameEngine.AGENTS).map(([id,r])=>[id,r.cost])));
    for(const [id,cost] of Object.entries(costs)){
      await expect(page.locator(`.ci-ability[data-agent="${id}"] small`)).toHaveText(`${cost}E`);
    }
  });

  test('end turn restores exactly one move',async({page})=>{
    await openGame(page,{dismissInitialCrisis:true});
    await page.locator('#ciHeart').click({position:{x:0.5,y:0.5}});
    await page.locator('.ci-ability[data-agent="stabilizer"]').click();
    await page.locator('#ciHeart').click({position:{x:0.5,y:0.5}});
    await expect.poll(async()=>page.evaluate(()=>window.CBApp.state.moves)).toBe(0);
    await page.locator('#ciEnd').click();
    await expect.poll(async()=>page.evaluate(()=>window.CBApp.state.day)).toBe(1);
    expect(await page.evaluate(()=>window.CBApp.state.moves)).toBe(1);
  });

  test('immersive crisis can be answered repeatedly across turns',async({page})=>{
    await openGame(page);
    await expect(page.locator('#ciCrisis')).toHaveClass(/open/);
    await page.locator('#ciCrisis [data-agent]').first().click();
    await expect.poll(async()=>page.evaluate(()=>window.CBApp.state.day)).toBe(1);
    await expect(page.locator('#ciCrisis')).toHaveClass(/open/);
    await page.locator('#ciCrisis [data-agent]').first().click();
    await expect.poll(async()=>page.evaluate(()=>window.CBApp.state.day)).toBe(2);
    await expect(page.locator('#ciCrisis')).toHaveClass(/open/);
  });

  test('dragging the heart does not masquerade as a selection click',async({page})=>{
    await openGame(page,{dismissInitialCrisis:true});
    await page.evaluate(()=>{window.CBImmersiveSelection=undefined;document.documentElement.removeAttribute('data-cb-immersive-selection')});
    const box=await page.locator('#ciHeart').boundingBox();
    if(!box) throw new Error('heart box unavailable');
    await page.mouse.move(box.x+box.width*.45,box.y+box.height*.45);
    await page.mouse.down();
    await page.mouse.move(box.x+box.width*.65,box.y+box.height*.55,{steps:8});
    await page.mouse.up();
    expect(await page.evaluate(()=>window.CBImmersiveSelection?.index)).toBeUndefined();
  });

  test('audio volume API is safe before and after audio initialization',async({page})=>{
    await openGame(page,{dismissInitialCrisis:true});
    await page.evaluate(()=>window.CBImmersiveAudio.setVolume(.4));
    expect(await page.evaluate(()=>window.CBImmersiveAudio.volume)).toBeCloseTo(.4);
    await page.evaluate(()=>window.CBImmersiveAudio.toggle());
    await page.evaluate(()=>window.CBImmersiveAudio.setVolume(.7));
    expect(await page.evaluate(()=>window.CBImmersiveAudio.volume)).toBeCloseTo(.7);
  });
});