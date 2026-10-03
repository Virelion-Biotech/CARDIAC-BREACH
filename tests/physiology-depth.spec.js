const {test,expect}=require('@playwright/test');

async function boot(page,seed=123){
 await page.addInitScript({content:`(()=>{let s=${seed>>>0};Math.random=()=>{s=(1664525*s+1013904223)>>>0;return s/4294967296}})()`});
 await page.goto('/');
 await page.waitForFunction(()=>window.CBApp?.state&&window.CBPhysiology&&window.CBGameCoreV2);
}

test.describe('deep hidden physiology',()=>{
 test('latent physiology evolves before the player sees the next crisis',async({page})=>{
  await boot(page,101);
  const before=await page.evaluate(()=>({ros:CBApp.state.cells[100].ros,atp:CBApp.state.cells[100].atp,calcium:CBApp.state.cells[100].calcium,repair:CBApp.state.cells[100].repair}));
  await page.evaluate(()=>CBApp.advanceDay());
  const after=await page.evaluate(()=>({ros:CBApp.state.cells[100].ros,atp:CBApp.state.cells[100].atp,calcium:CBApp.state.cells[100].calcium,repair:CBApp.state.cells[100].repair}));
  expect(after).not.toEqual(before);
 });
 test('spatial intervention changes local latent state',async({page})=>{
  await boot(page,202);
  const result=await page.evaluate(()=>{CBApp.selectCell(100);const a=CBApp.deploy('vascular');CBApp.advanceDay();return {ok:a.ok,oxygen:CBApp.state.cells[100].oxygen,neighbor:CBApp.state.cells[101].oxygen,far:CBApp.state.cells[0].oxygen};});
  expect(result.ok).toBeTruthy();
  expect(result.oxygen).toBeGreaterThan(result.neighbor-10);
  expect(Math.abs(result.oxygen-result.far)).toBeGreaterThan(0.1);
 });
 test('hidden state exposes real causal subsystems',async({page})=>{
  await boot(page,303);
  await page.evaluate(()=>CBApp.advanceDay());
  const h=await page.evaluate(()=>({...CBApp.state.hidden}));
  for(const key of ['systemicROS','neurohumoral','hemodynamicReserve','repairCapacity','conductionReserve','scarBurden','globalPerfusion','globalATP','immuneReserve','fluidReserve'])expect(typeof h[key]).toBe('number');
  expect(['acute','metabolic','inflammatory','remodeling','electrical']).toContain(h.phase);
 });
 test('same seed and same action sequence are reproducible',async({browser})=>{
  async function run(){const ctx=await browser.newContext();const p=await ctx.newPage();await boot(p,404);const snap=await p.evaluate(()=>{CBApp.selectCell(73);CBApp.deploy('vascular');CBApp.advanceDay();CBApp.selectCell(74);CBApp.deploy('stabilizer');CBApp.advanceDay();return {state:{...CBApp.state.state},hidden:{...CBApp.state.hidden},cell:CBApp.state.cells[73]}});await ctx.close();return snap}
  const a=await run();const b=await run();expect(b).toEqual(a);
 });
});
