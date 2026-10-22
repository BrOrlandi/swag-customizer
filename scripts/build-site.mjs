/** Build a public landing page at / and the Nuxt SPA at /app/. */
import {spawnSync} from 'node:child_process';
import {cp,mkdir,readFile,rm,rename,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
await rm(path.join(root,'.vercel/output'),{recursive:true,force:true});
const result=spawnSync(process.execPath,['node_modules/nuxt/bin/nuxt.mjs','generate'],{
 cwd:root,stdio:'inherit',env:{...process.env,NUXT_APP_BASE_URL:'/app/',NITRO_PRESET:'static'},
});
if(result.status!==0)process.exit(result.status||1);
const source=path.join(root,'.output/public');
const site=path.join(root,'.output/site');
await rm(site,{recursive:true,force:true});
await mkdir(site,{recursive:true});
await cp(source,path.join(site,'app'),{recursive:true});
await copyFile(path.join(source,'demo/index.html'),path.join(site,'index.html'));
await rename(path.join(site,'app/media'),path.join(site,'media'));
await rm(path.join(site,'app/demo'),{recursive:true,force:true});
// Keep catalog URLs used by existing localStorage projects working at the same origin.
await cp(path.join(source,'images'),path.join(site,'images'),{recursive:true});
const appHtml=await readFile(path.join(site,'app/index.html'),'utf8');
if(!appHtml.includes('/app/_nuxt/'))throw Error('The SPA build must reference assets below /app/.');
console.log('Site ready: landing at /, application at /app/.');
