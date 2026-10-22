/** Original ambient score. Pure synthesis; no third-party samples. */
import {writeFile} from 'node:fs/promises';
export async function writeAmbientTrack(file, seconds = 36) {
  const rate = 44100;
  const chords = [
    [130.8128,164.8138,195.9977,246.9417],
    [110,130.8128,164.8138,195.9977],
    [87.3071,110,130.8128,164.8138],
    [97.9989,123.4708,146.8324,195.9977],
  ];
  const bytes = rate * seconds * 4;
  const wav = Buffer.alloc(44 + bytes);
  wav.write('RIFF',0); wav.writeUInt32LE(36+bytes,4); wav.write('WAVEfmt ',8);
  wav.writeUInt32LE(16,16); wav.writeUInt16LE(1,20); wav.writeUInt16LE(2,22);
  wav.writeUInt32LE(rate,24); wav.writeUInt32LE(rate*4,28);
  wav.writeUInt16LE(4,32); wav.writeUInt16LE(16,34);
  wav.write('data',36); wav.writeUInt32LE(bytes,40);
  for(let n=0;n<rate*seconds;n++) {
    const t=n/rate, index=Math.floor(t/6)%4, local=t%6;
    const fade=Math.min(1,t/2,(seconds-t)/2), mix=Math.min(1,local/1.5);
    const chord = frequencies => frequencies.reduce((sum,f) => sum + Math.sin(2*Math.PI*f*t)*.019 + Math.sin(2*Math.PI*f*2*t)*.004,0);
    const pad=chord(chords[index])*mix+chord(chords[(index+3)%4])*(1-mix);
    const beat=(t*2)%1, arp=chords[index][Math.floor(t*2)%4]*4;
    const note=Math.sin(2*Math.PI*arp*t)*Math.exp(-beat*7)*.025;
    const value=(pad+note)*fade;
    wav.writeInt16LE(Math.trunc(value*30000),44+n*4);
    wav.writeInt16LE(Math.trunc(value*29000),46+n*4);
  }
  await writeFile(file,wav);
}
