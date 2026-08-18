const {test,expect}=require('@playwright/test');

async function boot(page,viewport){
  if(viewport)await page.setViewportSize(viewport);
  await page.goto('/');
  await page.waitForSelector('#beginnerGuide');
  await expect(page.locator('#beginnerGuide')).toBeVisible();
}

async function hitTest(page,selector){
  return page.evaluate(selector=>{
    const target=document.querySelector(selector);
    if(!target)return null;
    const r=target.getBoundingClientRect();
    const x=Math.max(0,Math.min(innerWidth-1,Math.round(r.left+r.width/2)));
    const y=Math.max(0,Math.min(innerHeight-1,Math.round(r.top+r.height/2)));
    const hit=document.elementFromPoint(x,y);
    return {ok:!!hit&&(hit===target||target.contains(hit)),hitId:hit?.id||'',hitTag:hit?.tagName||''};
  },selector);
}

test.describe('CARDIAC//BREACH visual shell',()=>{
  test('first load has one onboarding layer and no duplicate blockers',async({page})=>{
    await boot(page);
    const layers=await page.evaluate(()=>({
      beginner:!!document.querySelector('#beginnerGuide'),
      quickStart:!!document.querySelector('#cbStart'),
      oldCoach:!!document.querySelector('#cbCoach'),
      crisis:document.querySelector('#crisisLayer')?.classList.contains('show')||false,
      final:document.querySelector('#finalOverlay')?.classList.contains('show')||false,
      guideState:document.documentElement.dataset.beginnerGuide,
      coordinator:!!window.CB_UI_COORDINATOR,
      heartHost:!!document.querySelector('#heart3d'),
    }));
    expect(layers.beginner).toBe(true);
    expect(layers.quickStart).toBe(false);
    expect(layers.oldCoach).toBe(false);
    expect(layers.crisis).toBe(false);
    expect(layers.final).toBe(false);
    expect(layers.guideState).toBe('open');
    expect(layers.coordinator).toBe(true);
    expect(layers.heartHost).toBe(true);
  });

  test('NEW RUN is visually clear and actually clickable',async({page})=>{
    await boot(page,{width:1280,height:720});
    await expect(page.locator('#newRun')).toBeVisible();
    const geometry=await page.evaluate(()=>{
      const card=document.querySelector('.bg-card').getBoundingClientRect();
      const target=document.querySelector('#newRun').getBoundingClientRect();
      const overlap=!(card.right<=target.left||card.left>=target.right||card.bottom<=target.top||card.top>=target.bottom);
      return {overlap,card,target};
    });
    expect(geometry.overlap).toBe(false);
    expect(await hitTest(page,'#newRun')).toMatchObject({ok:true});
    await page.getByRole('button',{name:'NEW RUN'}).click();
    await expect(page.locator('#day')).toHaveText('0');
  });

  test('3D cardiac cockpit actually renders a model surface or graceful fallback',async({page})=>{
    await boot(page,{width:1280,height:720});
    await expect(page.locator('#heart3d')).toBeVisible();
    await page.waitForTimeout(1200);
    const state=await page.evaluate(()=>({
      canvas:!!document.querySelector('#heart3d canvas'),
      fallback:!!document.querySelector('#heart3d .heart3d-fallback'),
      api:!!window.CB_Heart3D,
      rect:document.querySelector('#heart3d')?.getBoundingClientRect().toJSON(),
    }));
    expect(state.rect.width).toBeGreaterThan(400);
    expect(state.rect.height).toBeGreaterThan(300);
    expect(state.canvas||state.fallback).toBe(true);
  });

  test('3D viewport responds to pointer interaction',async({page})=>{
    await boot(page,{width:1280,height:720});
    await page.waitForTimeout(1200);
    const canvas=page.locator('#heart3d canvas');
    if(await canvas.count()===0)test.skip();
    await canvas.hover();
    await page.mouse.down();
    await page.mouse.move(760,300,{steps:5});
    await page.mouse.up();
    await page.mouse.wheel(0,420);
    await page.mouse.dblclick(760,300);
  });

  test('mobile onboarding keeps the highlighted target reachable',async({page})=>{
    await boot(page,{width:390,height:844});
    for(let i=0;i<3;i++){
      const target=await page.locator('.bg-pulse').getAttribute('id');
      expect(target).toBeTruthy();
      const result=await hitTest(page,`#${target}`);
      expect(result?.ok).toBe(true);
      await page.locator('#bgNext').click();
    }
  });

  test('coordinator suppresses recreated overlays while guide is open',async({page})=>{
    await boot(page);
    const state=await page.evaluate(()=>{
      const crisis=document.querySelector('#crisisLayer');
      const final=document.querySelector('#finalOverlay');
      crisis?.classList.add('show');
      final?.classList.add('show');
      return {crisis:crisis?.classList.contains('show'),final:final?.classList.contains('show')};
    });
    await page.waitForTimeout(50);
    const after=await page.evaluate(()=>({
      crisis:document.querySelector('#crisisLayer')?.classList.contains('show')||false,
      final:document.querySelector('#finalOverlay')?.classList.contains('show')||false,
      guide:document.documentElement.dataset.beginnerGuide,
    }));
    expect(state.crisis).toBe(true);
    expect(state.final).toBe(true);
    expect(after.crisis).toBe(false);
    expect(after.final).toBe(false);
    expect(after.guide).toBe('open');
  });

  test('HOW TO PLAY opens the same single coach',async({page})=>{
    await boot(page);
    await page.locator('#bgSkip').click();
    await page.getByRole('button',{name:'HOW TO PLAY'}).first().click();
    await expect(page.locator('#beginnerGuide')).toBeVisible();
    expect(await page.locator('#cbStart').count()).toBe(0);
    expect(await page.locator('#cbCoach').count()).toBe(0);
  });

  test('closing onboarding restores the normal UI state',async({page})=>{
    await boot(page);
    await page.locator('#bgSkip').click();
    await expect(page.locator('#beginnerGuide')).toHaveCount(0);
    const state=await page.evaluate(()=>({guide:document.documentElement.dataset.beginnerGuide,body:document.body.classList.contains('beginner-active')}));
    expect(state.guide).toBe('closed');
    expect(state.body).toBe(false);
  });
});
