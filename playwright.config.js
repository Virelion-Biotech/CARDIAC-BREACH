const {defineConfig,devices}=require('@playwright/test');
module.exports=defineConfig({
  testDir:'./tests',
  timeout:30000,
  expect:{timeout:5000},
  fullyParallel:false,
  workers:process.env.CI?1:2,
  retries:process.env.CI?1:0,
  reporter:process.env.CI?[['html',{open:'never'}],['list']]:[['list']],
  projects:[
    {name:'chromium',use:{...devices['Desktop Chrome']}},
    {name:'mobile-chromium',use:{...devices['Pixel 7']}}
  ],
  use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure',video:'retain-on-failure'},
  webServer:{command:'python3 -m http.server 4173',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI,timeout:10000}
});
