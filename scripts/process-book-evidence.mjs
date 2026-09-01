import { mkdir, readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)),'..');
const sourceDir = resolve(root,'assets/evidence/books');
const jobs = [
  ['01','shelf-cam-01.jpg','640x360','17/09/2025 03:__','camera'],
  ['02','shelf-cam-02.jpg','480x360','17/09/2025 __:17','webcam'],
  ['01','shelf-crop-ending-beginning.jpg','720x405','EXTREMIDADES // DIST 01','scanner'],
  ['01','shelf-recovered-01.jpg','960x540','RECUPERADO // CAM_01','recovered']
];
const sourceExtensions = new Set(['.jpg','.jpeg','.png','.webp']);
const profiles = {
  camera: ['-colorspace','sRGB','-channel','R','-evaluate','multiply','1.08','-channel','B','-evaluate','multiply','.82','+channel','-contrast-stretch','4%x8%','-blur','0x.55','-attenuate','.16','+noise','Gaussian','-quality','34'],
  webcam: ['-colorspace','sRGB','-modulate','96,72,102','-blur','0x.7','-attenuate','.21','+noise','Gaussian','-quality','27'],
  scanner: ['-colorspace','Gray','-rotate','-.35','-contrast-stretch','2%x4%','-attenuate','.08','+noise','Gaussian','-quality','58'],
  recovered: ['-colorspace','sRGB','-contrast-stretch','1%x2%','-unsharp','0x.65+0.55+0.02','-attenuate','.06','+noise','Gaussian','-quality','68']
};

const run = (args) => new Promise((resolvePromise,reject)=>{
  const child=spawn('magick',args,{stdio:'inherit',shell:false});
  child.once('error',reject);
  child.once('exit',(code)=>code===0?resolvePromise():reject(new Error(`ImageMagick encerrou com código ${code}`)));
});

await mkdir(sourceDir,{recursive:true});
const files=await readdir(sourceDir);
const findSource=(index)=>files.find((name)=>name.toLowerCase().startsWith(`shelf-source-${index}.`) && sourceExtensions.has(name.slice(name.lastIndexOf('.')).toLowerCase()));
for (const [sourceIndex,targetName,size,label,profile] of jobs) {
  const sourceName=findSource(sourceIndex);
  if (!sourceName) throw new Error(`Fonte ausente: shelf-source-${sourceIndex}.{jpg,jpeg,png,webp}. Consulte assets/evidence/books/README.md.`);
  const source=resolve(sourceDir,sourceName);
  const target=resolve(sourceDir,targetName);
  await run([source,'-auto-orient','-resize',`${size}^`,'-gravity','center','-extent',size,...profiles[profile],'-gravity','SouthEast','-fill','#e6d18b','-undercolor','#00000099','-pointsize','14','-annotate','+12+12',label,'-interlace','Plane',target]);
}
console.log('Derivados BOOKSCAN gerados em',sourceDir);
