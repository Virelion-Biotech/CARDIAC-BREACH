const {test,expect}=require('@playwright/test');

async function load(page){
 await page.goto('/');
 await page.waitForFunction(()=>window.CBMechanisticGameEngine&&window.CBApp?.state?.version===3);
}

const finiteKeys=['oxygen','atp','ros','stress','damage','immune','scar','conduction'];

test.describe('mechanistic engine v3',()=>{
 test('uses explicit ordered phases and bounded states',async({page})=>{
  await load(page);
  const out=await page.evaluate(()=>{const g=window.CBApp.state;window.CBApp.advanceDay();return {phases:g.lastResolve.phases,digest:g.audit[g.audit.length-1].stateDigest,cells:g.cells.map(c=>({supply:c.supply,energy:c.energy,injury:c.injury,immune:c.immune,repair:c.repair,matrix:c.matrix,electrical:c.electrical}))}});
  expect(out.phases).toEqual(['insult','delivery','metabolism','injury','immune','repair','remodel','electrical','organ','mission']);
  for(const c of out.cells){for(const section of Object.values(c))for(const value of Object.values(section)){if(typeof value==='number')expect(value).toBeGreaterThanOrEqual(0);expect(value).toBeLessThanOrEqual(100)}}
  expect(out.digest.meanOxygen).toBeGreaterThanOrEqual(0);expect(out.digest.meanOxygen).toBeLessThanOrEqual(100);
 });

 test('same seed and same decision reproduce the same digest',async({browser})=>{
  async function run(seed,cell){const ctx=await browser.newContext();const p=await ctx.newPage();await load(p);await p.evaluate(({seed,cell})=>{window.CBApp.newRun('ischemia',seed);window.CBApp.selectCell(cell);window.CBApp.deploy('vascular');window.CBApp.advanceDay();window.CBApp.advanceDay()}, {seed,cell});const r=await p.evaluate(()=>window.CBApp.state.audit.map(a=>a.stateDigest));await ctx.close();return r}
  const a=await run(12345,42),b=await run(12345,42);expect(a).toEqual(b);
 });

 test('location changes hidden trajectory',async({browser})=>{
  async function run(cell){const ctx=await browser.newContext();const p=await ctx.newPage();await load(p);await p.evaluate(cell=>{window.CBApp.newRun('ischemia',777);window.CBApp.selectCell(cell);window.CBApp.deploy('vascular');window.CBApp.advanceDay()},cell);const d=await p.evaluate(()=>window.CBApp.state.audit[0].stateDigest);await ctx.close();return d}
  const a=await run(0),b=await run(210);expect(a).not.toEqual(b);
 });

 test('intervention changes causal variables before organ aggregation',async({browser})=>{
  async function run(agent){const ctx=await browser.newContext();const p=await ctx.newPage();await load(p);await p.evaluate(agent=>{window.CBApp.newRun('ischemia',9001);window.CBApp.selectCell(100);window.CBApp.deploy(agent);window.CBApp.advanceDay()},agent);const d=await p.evaluate(()=>window.CBApp.state.audit[0].stateDigest);await ctx.close();return d}
  const base=await run('stabilizer'),vascular=await run('vascular');expect(vascular.meanOxygen).not.toBe(base.meanOxygen);expect(vascular.meanATP).not.toBe(base.meanATP);
 });
});
