const {test,expect}=require('@playwright/test');

const SCENARIOS=['ischemia','inflammation','fibrosis','maturation','arrhythmia'];
const AGENTS=['STABILIZER','REGENERATOR','IMMUNE MODULATOR','VASCULAR SUPPORT','MATURATION AGENT','ELECTRICAL BUFFER'];

function seedScript(seed=42){return `(()=>{let s=${seed>>>0};Math.random=()=>{s=(1664525*s+1013904223)>>>0;return s/4294967296}})()`}
async function boot(page,seed=42){
  await page.addInitScript({content:seedScript(seed)});
  await page.goto('/');
  await page.getByRole('button',{name:'ENTER SIMULATION'}).click();
  await page.waitForFunction(()=>typeof window.advance==='function'&&window.CardiacBalance?.version===1);
  await expect(page.locator('#day')).toHaveText('0');
}
async function runDays(page,n=24){await page.evaluate(n=>{for(let i=0;i<n;i++)window.advance()},n);}
async function scoreFor(page,scenario,agent){
  await page.getByLabel('SCENARIO').selectOption(scenario);
  if(agent){
    const row=page.locator('#agentList .agent').filter({hasText:agent});
    await row.getByRole('button',{name:'DEPLOY'}).click();
  }
  await runDays(page);
  return Number(await page.locator('#score').innerText());
}

test.describe('CARDIAC//BREACH game-state invariants',()=>{
  test('boots, exposes all core systems, and enters simulation',async({page})=>{
    await boot(page);
    await expect(page).toHaveTitle('CARDIAC//BREACH');
    await expect(page.locator('#tissue')).toBeVisible();
    await expect(page.locator('#agentList .agent')).toHaveCount(6);
    await expect(page.locator('#population')).toBeVisible();
    await expect(page.locator('#log')).toContainText('RUN INITIALIZED');
  });

  test('24-day run preserves bounded game state and completes cleanly',async({page})=>{
    await boot(page,7);
    await runDays(page,24);
    await expect(page.locator('#day')).toHaveText('24');
    const values=await page.evaluate(()=>({state:{...state},energy,history:history.length,alive:cells.filter(c=>c.alive).length}));
    for(const value of Object.values(values.state))expect(value).toBeGreaterThanOrEqual(0),expect(value).toBeLessThanOrEqual(100);
    expect(values.energy).toBeGreaterThanOrEqual(0);expect(values.energy).toBeLessThanOrEqual(100);expect(values.history).toBe(24);expect(values.alive).toBeGreaterThanOrEqual(0);
    await expect(page.locator('#log')).toContainText('RUN COMPLETE');
  });

  test('deployment cap and insufficient-energy guard hold',async({page})=>{
    await boot(page,11);
    for(let i=0;i<5;i++)await page.locator('#agentList .agent').nth(i).getByRole('button',{name:'DEPLOY'}).click();
    await expect(page.locator('#agentCount')).toHaveText('5 / 5 deployed');
    await expect(page.locator('#agentList button').filter({hasText:'DEPLOY'}).first()).toBeDisabled();
    const energy=await page.locator('#energy').innerText();expect(Number(energy)).toBeGreaterThanOrEqual(0);
  });

  test('save and restore returns to the exact checkpoint day',async({page})=>{
    await boot(page,19);
    await page.locator('#saveRun').click();
    await page.evaluate(()=>window.advance());
    await expect(page.locator('#day')).toHaveText('1');
    await page.locator('#loadRun').click();
    await expect(page.locator('#day')).toHaveText('0');
  });

  test('evolution produces bounded, diverse, deployable policies',async({page})=>{
    await boot(page,31);
    await page.locator('#seedAgents').click();
    await page.locator('#evolveAgents').click();
    const pool=await page.evaluate(()=>Evolution.pool.map(a=>({fitness:a.fitness,traits:{...a.traits},level:a.level})));
    expect(pool).toHaveLength(8);
    for(const a of pool){expect(a.fitness).toBeGreaterThanOrEqual(0);expect(a.fitness).toBeLessThanOrEqual(100);expect(a.level).toBeGreaterThanOrEqual(1);for(const v of Object.values(a.traits)){expect(v).toBeGreaterThanOrEqual(0);expect(v).toBeLessThanOrEqual(1)}}
    const fingerprints=new Set(pool.map(a=>Object.values(a.traits).map(v=>v.toFixed(3)).join('|')));expect(fingerprints.size).toBeGreaterThan(3);
  });
});

test.describe('agent balance matrix',()=>{
  test('every base agent has a meaningful niche and no agent dominates every scenario',async({browser})=>{
    const matrix={};
    for(let si=0;si<SCENARIOS.length;si++){
      matrix[SCENARIOS[si]]={};
      for(let ai=0;ai<AGENTS.length;ai++){
        const context=await browser.newContext();const page=await context.newPage();
        await boot(page,100+si*17+ai);
        const baseline=await scoreFor(page,SCENARIOS[si],null);
        await context.close();
        const c2=await browser.newContext();const p2=await c2.newPage();
        await boot(p2,100+si*17+ai);
        const score=await scoreFor(p2,SCENARIOS[si],AGENTS[ai]);
        matrix[SCENARIOS[si]][AGENTS[ai]]={score,delta:score-baseline};
        await c2.close();
      }
    }
    const wins=Object.fromEntries(AGENTS.map(a=>[a,0]));
    const niches=Object.fromEntries(AGENTS.map(a=>[a,false]));
    for(const scenario of SCENARIOS){
      const rows=AGENTS.map(a=>({agent:a,...matrix[scenario][a]})).sort((a,b)=>b.score-a.score);
      wins[rows[0].agent]++;
      const positive=rows.filter(r=>r.delta>=1).map(r=>r.agent);positive.forEach(a=>{niches[a]=true});
      expect(rows[0].score-rows[1].score,'top agent should not create a runaway gap').toBeLessThanOrEqual(15);
    }
    for(const agent of AGENTS)expect(niches[agent],`${agent} should have at least one useful scenario`).toBeTruthy();
    for(const agent of AGENTS)expect(wins[agent],`${agent} should not dominate the scenario matrix`).toBeLessThanOrEqual(3);
    console.log('BALANCE_MATRIX',JSON.stringify(matrix,null,2));
  });

  test('duplicate stacking is not strictly better than a diversified four-agent team',async({browser})=>{
    const run=async(seed,ids)=>{
      const context=await browser.newContext();const page=await context.newPage();await boot(page,seed);
      for(const id of ids)await page.locator('#agentList .agent').filter({hasText:id}).getByRole('button',{name:'DEPLOY'}).click();
      await runDays(page,24);const score=Number(await page.locator('#score').innerText());await context.close();return score;
    };
    for(const [scenario,seed] of [['ischemia',401],['inflammation',402],['fibrosis',403],['maturation',404],['arrhythmia',405]]){
      const a=await browser.newContext();const p=await a.newPage();await boot(p,seed);await p.getByLabel('SCENARIO').selectOption(scenario);for(let i=0;i<4;i++)await p.locator('#agentList .agent').nth(i).getByRole('button',{name:'DEPLOY'}).click();await runDays(p);const diversified=Number(await p.locator('#score').innerText());await a.close();
      const stacked=await run(seed+50,['REGENERATOR','REGENERATOR','REGENERATOR','REGENERATOR']);
      expect(stacked-diversified).toBeLessThanOrEqual(10);
    }
  });
});
