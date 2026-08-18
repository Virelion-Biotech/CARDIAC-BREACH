const {test,expect}=require('@playwright/test');

async function boot(page,seed=12345){
  await page.addInitScript({content:`localStorage.clear();window.__TEST_SEED__=${seed}`});
  await page.goto('/');
  await page.waitForFunction(()=>document.documentElement.dataset.appReady==='true');
}

test.describe('CARDIAC//BREACH precision kernel',()=>{
  test('uses exact 1e-18 fixed-point units without exposing implementation details',async({page})=>{
    await boot(page);
    const out=await page.evaluate(()=>({scale:String(CBPrecisionV4.SCALE),unit:CBPrecisionV4.attach(CBApp.state).unit,uiHasQ18:document.body.innerText.includes('Q18')}));
    expect(out.scale).toBe('1000000000000000000');expect(out.unit).toBe('Q18');expect(out.uiHasQ18).toBe(false);
  });
  test('signed intervention energy flow is preserved exactly',async({page})=>{
    await boot(page);
    const result=await page.evaluate(()=>{const g=CBApp.state;CBApp.selectCell(0);const before=g.energy;CBApp.deploy('vascular');const after=g.energy;return{before,after,signed:g.precision.ledger.getSigned('intervention.vascular.energy_delta').toString(),expected:CBPrecisionV4.q(after-before).toString()}});
    expect(result.signed).toBe(result.expected);expect(Number(result.after)).toBeLessThan(Number(result.before));
  });
  test('precision snapshot survives save and load',async({page})=>{
    await boot(page,987);
    const before=await page.evaluate(()=>{CBApp.selectCell(10);CBApp.deploy('stabilizer');CBApp.advanceDay();CBApp.save();return CBApp.state.precision.snapshot()});
    const after=await page.evaluate(()=>{CBApp.load();return CBApp.state.precision.snapshot()});
    expect(after.seed).toBe(before.seed);expect(after.tick).toBe(before.tick);expect(after.microstep).toBe(before.microstep);expect(after.accounts).toEqual(before.accounts);expect(after.signed).toEqual(before.signed);
  });
});
