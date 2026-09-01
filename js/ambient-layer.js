/* RECUPERACAO_1010 — local procedural ambience continuity layer. */
(() => {
  'use strict';
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  let ctx, master, ambience, currentWorld = '', activeNodes = [], rareTimer = 0, unlocked = false;
  const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
  const now = ()=>ctx?.currentTime || 0;

  function noiseBuffer(seconds=2) {
    const length=Math.max(1,Math.floor(ctx.sampleRate*seconds));
    const buffer=ctx.createBuffer(1,length,ctx.sampleRate);
    const data=buffer.getChannelData(0);
    for(let i=0;i<length;i+=1)data[i]=(Math.random()*2-1)*.72;
    return buffer;
  }

  function osc(frequency,volume,type='sine') {
    const source=ctx.createOscillator(), gain=ctx.createGain();
    source.type=type; source.frequency.value=frequency; gain.gain.value=volume;
    source.connect(gain).connect(ambience); source.start(); activeNodes.push({source,gain});
  }

  function loopNoise(volume,filterFrequency=420,type='lowpass') {
    const source=ctx.createBufferSource(), filter=ctx.createBiquadFilter(), gain=ctx.createGain();
    source.buffer=noiseBuffer(2.4); source.loop=true;
    filter.type=type; filter.frequency.value=filterFrequency; filter.Q.value=.7; gain.gain.value=volume;
    source.connect(filter).connect(gain).connect(ambience); source.start(); activeNodes.push({source,gain});
  }

  function stopEnvironment(duration=.65) {
    const t=now(), stop=t+duration+.08;
    activeNodes.forEach(({source,gain})=>{
      try {
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(Math.max(.0001,gain.gain.value),t);
        gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
        source.stop(stop);
      } catch {}
    });
    activeNodes=[];
  }

  function world() {
    const puzzle=document.body.dataset.puzzle || document.querySelector('[data-puzzle-id]')?.dataset.puzzleId || '';
    if(['20','21'].includes(puzzle))return 'room-zero';
    if(document.querySelector('.receiver-scene,.tv-cabinet'))return 'tv';
    if(document.querySelector('.phone-scene'))return 'phone';
    if(document.querySelector('.retro-computer'))return 'computer';
    if(document.querySelector('[data-scene-family="reconstruction"]'))return 'reconstruction';
    if(document.querySelector('.phase-archive,[data-scene-family="archive"]'))return 'archive';
    if(document.querySelector('[data-scene-family="forensic"]'))return 'forensic';
    return 'system';
  }

  function build(name) {
    if(!unlocked||!ctx)return;
    stopEnvironment(name==='room-zero'?.22:.65);
    currentWorld=name;
    const p={
      computer:()=>{osc(49.8,.012);osc(99.6,.0035);loopNoise(.0055,280);},
      system:()=>{osc(49.8,.008);loopNoise(.004,250);},
      tv:()=>{osc(59.7,.013);osc(119.4,.003);osc(11800,.0011);loopNoise(.009,1300,'bandpass');},
      phone:()=>{osc(61,.0025);loopNoise(.0017,360);},
      archive:()=>{osc(42,.007);osc(84,.002);loopNoise(.006,500);},
      forensic:()=>{osc(54,.006);loopNoise(.004,340);},
      reconstruction:()=>{osc(36,.006);osc(71.6,.002);loopNoise(.0035,240);},
      'room-zero':()=>{osc(31,.0032);osc(62,.0009);loopNoise(.0016,145);}
    };
    (p[name]||p.system)();
    scheduleRare();
  }

  function tone({frequency=120,end=null,duration=.12,volume=.025,type='sine'}={}) {
    const source=ctx.createOscillator(),gain=ctx.createGain(),t=now();
    source.type=type;source.frequency.setValueAtTime(frequency,t);
    if(end)source.frequency.exponentialRampToValueAtTime(Math.max(1,end),t+duration);
    gain.gain.setValueAtTime(.0001,t);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume),t+.012);
    gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
    source.connect(gain).connect(ambience);source.start();source.stop(t+duration+.03);
  }

  function noiseShot({duration=.12,volume=.018,filter=560,type='bandpass',pan=0}={}) {
    const source=ctx.createBufferSource(),biquad=ctx.createBiquadFilter(),gain=ctx.createGain(),t=now();
    source.buffer=noiseBuffer(Math.max(.2,duration));biquad.type=type;biquad.frequency.value=filter;biquad.Q.value=.9;
    gain.gain.setValueAtTime(volume,t);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
    source.connect(biquad).connect(gain);
    if(ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=clamp(pan,-1,1);gain.connect(p).connect(ambience);}
    else gain.connect(ambience);
    source.start();source.stop(t+duration+.03);
  }

  function signature(scale=1) {
    [0,.31,.67].forEach((delay,index)=>setTimeout(()=>tone({
      frequency:86-index*6,end:62-index*4,duration:.09,volume:.026*scale,type:'triangle'
    }),Math.round(delay*1000)));
  }

  function duck(duration=.65,depth=.12) {
    const t=now();
    ambience.gain.cancelScheduledValues(t);
    ambience.gain.setValueAtTime(Math.max(.0001,ambience.gain.value),t);
    ambience.gain.exponentialRampToValueAtTime(Math.max(.0001,depth),t+.025);
    ambience.gain.exponentialRampToValueAtTime(1,t+duration);
  }

  function rare() {
    if(!unlocked||document.hidden)return scheduleRare();
    const pan=Math.random()*1.4-.7;
    if(currentWorld==='room-zero'){
      const pick=Math.random();
      if(pick<.42){duck(.9,.025);setTimeout(()=>tone({frequency:74,end:58,duration:.07,volume:.012,type:'triangle'}),330);}
      else if(pick<.78)noiseShot({duration:.07,volume:.009,filter:210,type:'lowpass',pan});
      else signature(.42);
    } else if(currentWorld==='computer') {
      if(Math.random()<.56){noiseShot({duration:.035,volume:.011,filter:980,pan});setTimeout(()=>noiseShot({duration:.025,volume:.009,filter:1180,pan:pan*.8}),76);}
      else tone({frequency:142,end:118,duration:.06,volume:.008,type:'square'});
    } else if(currentWorld==='tv')noiseShot({duration:.07,volume:.012,filter:1750,pan});
    else if(currentWorld==='archive')noiseShot({duration:.04,volume:.009,filter:920,pan});
    else noiseShot({duration:.06,volume:.006,filter:300,pan});
    scheduleRare();
  }

  function scheduleRare() {
    clearTimeout(rareTimer);
    if(!unlocked)return;
    const min=currentWorld==='room-zero'?15000:22000;
    const spread=currentWorld==='room-zero'?28000:50000;
    rareTimer=setTimeout(rare,min+Math.random()*spread);
  }

  function sync() { const next=world(); if(next!==currentWorld)build(next); }

  async function unlock() {
    if(unlocked)return;
    ctx=new AudioCtx(); master=ctx.createGain(); ambience=ctx.createGain();
    master.gain.value=.16; ambience.gain.value=1; ambience.connect(master).connect(ctx.destination);
    if(ctx.state==='suspended')await ctx.resume();
    unlocked=true;build(world());
  }

  function delivered(event) {
    if(!unlocked)return;
    const name=event?.detail?.event||'';
    if(name==='computer.clock.0317'){duck(1.4,.012);setTimeout(()=>signature(.72),520);return;}
    if(name==='room.node.validated'){duck(1.15,.02);setTimeout(()=>signature(.55),260);return;}
    if(name==='tv.channel.04.locked'){noiseShot({duration:.22,volume:.02,filter:860});return;}
    tone({frequency:92,end:72,duration:.12,volume:.012,type:'triangle'});
  }

  function install() {
    const gesture=()=>{unlock().catch(()=>{});window.removeEventListener('pointerdown',gesture,true);window.removeEventListener('keydown',gesture,true);};
    window.addEventListener('pointerdown',gesture,true);
    window.addEventListener('keydown',gesture,true);
    document.addEventListener('world:delivered',delivered);

    const observer=new MutationObserver(()=>{
      clearTimeout(observer._t);
      observer._t=setTimeout(sync,80);
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-puzzle','class','hidden']});

    document.addEventListener('visibilitychange',()=>{
      if(!unlocked||!ctx)return;
      if(document.hidden)ctx.suspend().catch(()=>{});
      else ctx.resume().then(sync).catch(()=>{});
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
