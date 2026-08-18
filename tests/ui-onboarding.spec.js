const {test,expect}=require('@playwright/test');

test.describe('single-layer onboarding',()=>{
  test('first load has no duplicate blocking coaches',async({page})=>{
    await page.goto('/');
    await page.waitForTimeout(300);
    const layers=await page.evaluate(()=>({
      beginner:!!document.querySelector('#beginnerGuide'),
      quickStart:!!document.querySelector('#cbStart'),
      oldCoach:!!document.querySelector('#cbCoach'),
      crisis:document.querySelector('#crisisLayer')?.classList.contains('show')||false,
    }));
    expect(layers.beginner).toBe(true);
    expect(layers.quickStart).toBe(false);
    expect(layers.oldCoach).toBe(false);
    expect(layers.crisis).toBe(false);
  });

  test('step 1 highlights NEW RUN without covering it',async({page})=>{
    await page.goto('/');
    await page.waitForSelector('#beginnerGuide');
    const geometry=await page.evaluate(()=>{
      const card=document.querySelector('.bg-card').getBoundingClientRect();
      const target=document.querySelector('#newRun').getBoundingClientRect();
      const overlap=!(card.right<target.left||card.left>target.right||card.bottom<target.top||card.top>target.bottom);
      return {overlap,target:{x:target.left+target.width/2,y:target.top+target.height/2}};
    });
    expect(geometry.overlap).toBe(false);
  });

  test('HOW TO PLAY opens the same single coach',async({page})=>{
    await page.goto('/');
    await page.waitForSelector('#beginnerGuide');
    await page.locator('#bgSkip').click();
    await page.getByRole('button',{name:'HOW TO PLAY'}).first().click();
    await expect(page.locator('#beginnerGuide')).toBeVisible();
    expect(await page.locator('#cbStart').count()).toBe(0);
    expect(await page.locator('#cbCoach').count()).toBe(0);
  });
});
