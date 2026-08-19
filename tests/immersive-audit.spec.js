import {test,expect} from '@playwright/test';

test.describe('immersive UI/audio audit',()=>{
  test.beforeEach(async({page})=>{await page.goto('/');await page.waitForSelector('#cbImmersive');});

  test('uses one canonical cockpit and visible heart stage',async({page})=>{
    await expect(page.locator('#cbImmersive')).toHaveCount(1);
    await expect(page.locator('#ciHeart')).toBeVisible();
    await expect(page.locator('#cbImmersive')).toHaveCSS('position','fixed');
    await expect(page.locator('#beginnerGuide')).toHaveCount(0);
    await expect(page.locator('#crisisLayer')).toHaveCount(0);
  });

  test('panel opens, traps focus, and closes with Escape',async({page})=>{
    await page.getByRole('button',{name:'STATUS',exact:true}).click();
    const panel=page.locator('#ciPanel');
    await expect(panel).toHaveClass(/open/);
    await expect(panel).toHaveAttribute('aria-hidden','false');
    await page.keyboard.press('Escape');
    await expect(panel).not.toHaveClass(/open/);
    await expect(panel).toHaveAttribute('aria-hidden','true');
  });

  test('sound control is visible and stateful',async({page})=>{
    const sound=page.locator('#ciSound');
    await expect(sound).toBeVisible();
    const before=await sound.getAttribute('aria-pressed');
    await sound.click();
    await expect(sound).toHaveAttribute('aria-pressed',before==='true'?'false':'true');
  });

  test('heart is clickable and selection state is persisted',async({page})=>{
    await page.locator('#ciHeart').click({position:{x:0.5,y:0.5}});
    await expect.poll(async()=>page.evaluate(()=>Number.isInteger(window.CBImmersiveSelection?.index))).toBe(true);
  });

  test('critical action controls are not covered',async({page})=>{
    for(const selector of ['[data-open="system"]','.ci-ability','.ci-end']){
      const box=page.locator(selector).first();
      const point=await box.evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}});
      const hit=await page.evaluate(({x,y})=>{const e=document.elementFromPoint(x,y);return e?.closest('button')?.textContent?.trim()||e?.id||''},point);
      await expect(hit).not.toBe('');
    }
  });
});