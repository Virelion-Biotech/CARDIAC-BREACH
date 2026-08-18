import {readdir} from 'node:fs/promises';
import {join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

const root=fileURLToPath(new URL('../',import.meta.url));
const ignored=new Set(['node_modules','.git','dist','tests']);
const files=[];
async function walk(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    if(ignored.has(entry.name))continue;
    const path=join(dir,entry.name);
    if(entry.isDirectory())await walk(path);
    else if(/\.m?js$/.test(entry.name))files.push(path);
  }
}
await walk(root);
for(const file of files){
  await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,['--check',file],{stdio:'inherit'});
    child.on('exit',code=>code===0?resolve():reject(new Error(`Syntax check failed: ${relative(root,file)}`)));
    child.on('error',reject);
  });
}
console.log(`Syntax OK: ${files.length} JavaScript files`);
