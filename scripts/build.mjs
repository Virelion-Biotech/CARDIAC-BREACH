import {cp,rm,mkdir,writeFile,readFile} from 'node:fs/promises';
import {join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const dist=join(root,'dist');
await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});

const excluded=new Set(['.git','.github','dist','node_modules','tests','scripts','package.json','package-lock.json','CONTRIBUTING.md','CHANGELOG.md','ARCHITECTURE.md']);
for(const entry of await (await import('node:fs/promises')).readdir(root,{withFileTypes:true})){
  if(excluded.has(entry.name))continue;
  const from=join(root,entry.name);const to=join(dist,entry.name);
  await cp(from,to,{recursive:true,force:true});
}

const index=await readFile(join(dist,'index.html'),'utf8');
await writeFile(join(dist,'BUILD.txt'),`CARDIAC//BREACH static build\nSource: ${new Date().toISOString()}\nEntry: index.html\n`);
console.log(`Built ${relative(root,dist)} with ${index.length} bytes of entry HTML`);
