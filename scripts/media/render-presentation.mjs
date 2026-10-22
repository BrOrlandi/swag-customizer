/** Render motion graphics from the real browser captures. No API keys required. */
import sharp from 'sharp';
import {mkdtemp,copyFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {writeAmbientTrack} from './ambient-track.mjs';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const media=path.join(root,'public/media');
const image=async p=>'data:image/png;base64,'+(await sharp(p).png().toBuffer()).toString('base64');
const logo=await image(path.join(root,'public/images/swag-logo.png'));
const shots=await Promise.all(['02-montando-kit','03-personalizando-swag','07-chat-sugestoes','09-chat-nubank-mockup'].map(n=>image(`${media}/screenshots/${n}.png`)));
const swag=await image(`${media}/screenshots/swag-kit.png`);
const nubank=await image(`${media}/screenshots/nubank-kit.png`);
const scenes=[
 {k:'SWAG CUSTOMIZER',lines:['Sua marca.','Um kit.','Novas possibilidades.'],sub:['Uma experiência de personalização','com inteligência artificial.'],pic:swag,square:true},
 {k:'01 / MONTE SEU KIT',lines:['Escolha.','Combine.','Personalize.'],sub:['Produtos, cores e quantidades.','Tudo em uma experiência visual.'],pic:shots[0]},
 {k:'02 / DO LOGO AO PRODUTO',lines:['O seu logo.','Do seu jeito.'],sub:['Posicione a arte nos produtos','e crie a identidade do seu kit.'],pic:shots[1]},
 {k:'03 / CONVERSE COM A IA',lines:['Pergunte.','Descubra.','Monte seu kit.'],sub:['Um agente que consulta o catálogo,','sugere produtos e atualiza o orçamento.'],pic:await image(await sharp(`${media}/screenshots/07-chat-sugestoes.png`).extract({left:590,top:130,width:740,height:820}).toBuffer()),square:true},
 {k:'04 / VISUALIZE COM IA',lines:['Veja a ideia','ganhar forma.'],sub:['Mockups e uma composição do kit','gerados durante o uso da plataforma.'],pic:nubank,square:true,note:'Nubank: exemplo independente, sem vínculo com a marca.'},
 {k:'OPEN SOURCE / BY @BRORLANDI',lines:['Explore o código.','Experimente','com a sua IA.'],sub:['Editor visual + agente conversacional.','Seus projetos ficam no seu navegador.'],pic:shots[3]},
];
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
const fps=24,seconds=6,frames=scenes.length*seconds*fps;
const ff=spawn(process.env.FFMPEG||'ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(fps),'-i','pipe:0','-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',`${media}/videos/03-apresentacao-motion.mp4`]);
ff.stderr.pipe(process.stderr);
for(let f=0;f<frames;f++){
 const t=(f%(seconds*fps))/fps,si=Math.floor(f/(seconds*fps)),s=scenes[si];
 const ease=1-Math.pow(1-Math.min(1,t/0.85),3),fade=Math.min(1,t/0.3,(seconds-t)/0.3);
 const x=780+(1-ease)*140,y=s.square?95:190,w=s.square?920:1080,h=s.square?920:608;
 const drift=Math.sin(f/100)*30;
 const svg=`<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
 <defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#071c34"/><stop offset="1" stop-color="#043967"/></linearGradient><clipPath id="frame"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24"/></clipPath></defs>
 <rect width="1920" height="1080" fill="url(#bg)"/>
 <circle cx="${1630+drift}" cy="120" r="500" fill="#045cab" opacity=".23"/><circle cx="1780" cy="970" r="300" fill="#42b4f5" opacity=".06"/>
 <path d="M0 980 Q700 870 1920 1010" stroke="#67b9ed" fill="none" opacity=".18"/>
 <g opacity="${fade}">
 <rect x="88" y="72" width="350" height="87" rx="16" fill="white"/><image x="108" y="88" width="310" height="55" href="${logo}"/>
 <text x="92" y="255" font-family="Arial" font-size="20" font-weight="700" letter-spacing="3" fill="#76c7ff">${s.k}</text>
 ${s.lines.map((v,i)=>`<text x="${92-(1-ease)*45}" y="${365+i*87}" font-family="Arial" font-weight="700" font-size="${v.length>19?53:68}" fill="white">${escape(v)}</text>`).join('')}
 ${s.sub.map((v,i)=>`<text x="94" y="${680+i*37}" font-family="Arial" font-size="26" fill="#c3d4e5">${escape(v)}</text>`).join('')}
 <rect x="92" y="815" width="540" height="2" fill="#3b729d"/>
 <text x="94" y="867" font-family="Arial" font-size="23" fill="white">swag-customizer.vercel.app</text>
 <text x="94" y="911" font-family="Arial" font-size="18" fill="#8fafc8">Personalização e curadoria de produtos com IA</text>
 <rect x="${x-5}" y="${y-5}" width="${w+10}" height="${h+10}" rx="29" fill="#6297bd" opacity=".35"/>
 <image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" href="${s.pic}" clip-path="url(#frame)"/>
 ${s.note?`<rect x="${x}" y="${y+h-58}" width="${w}" height="58" fill="#071c34" opacity=".92"/><text x="${x+24}" y="${y+h-23}" font-family="Arial" font-size="21" fill="#e2edf6">${s.note}</text>`:''}
 <text x="94" y="1025" font-family="Arial" font-size="18" fill="#8fafc8">DEMONSTRAÇÃO REAL DA PLATAFORMA</text>
 <text x="1780" y="1040" font-family="Arial" font-size="20" fill="#8fafc8">0${si+1} / 06</text>
 </g><rect x="0" y="1074" width="${1920*(f+1)/frames}" height="6" fill="#5ebdff"/>
 </svg>`;
 const frame=await sharp(Buffer.from(svg)).png().toBuffer();if(!ff.stdin.write(frame))await once(ff.stdin,'drain');
 if(f%144===0)console.log(`Scene ${si+1}/6`);
}
ff.stdin.end();await once(ff,'close');if(ff.exitCode)throw Error('ffmpeg failed');
const temp=await mkdtemp(path.join(tmpdir(),'swag-motion-'));
try {
 await writeAmbientTrack(path.join(temp,'ambient.wav'),scenes.length*seconds);
 const mux=spawn(process.env.FFMPEG||'ffmpeg',['-y','-loglevel','error','-i',`${media}/videos/03-apresentacao-motion.mp4`,'-i',path.join(temp,'ambient.wav'),'-c:v','copy','-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart',path.join(temp,'motion.mp4')]);
 mux.stderr.pipe(process.stderr);await once(mux,'close');if(mux.exitCode)throw Error('Audio mux failed');
 await copyFile(path.join(temp,'motion.mp4'),`${media}/videos/03-apresentacao-motion.mp4`);
} finally { await rm(temp,{recursive:true,force:true}); }
console.log('Motion presentation rendered with original audio.');
