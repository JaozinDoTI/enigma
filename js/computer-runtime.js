const FILE_VARIANTS = Object.freeze({
  'event-1010': Object.freeze({
    rewritten: Object.freeze({
      modified:'10/10/2025 10:12', size:'11 KB', origin:'VOLUME EXTERNO / FONTE DUPLA',
      body:['10:10:00  EVENTO_1010','origem desconhecida','volume correspondente ausente','índice anterior à pasta atual','10:10:00  ASSINATURA REESCRITA','DUAS FONTES PRESENTES NO MESMO EVENTO','CHECKSUM ANTERIOR ≠ CHECKSUM ATUAL']
    }),
    stable: Object.freeze({ attributes:'SISTEMA · ISOLADO · SOMENTE LEITURA' })
  }),
  tmp1: Object.freeze({ base:Object.freeze({}) }),
  tmp2: Object.freeze({
    spawned:Object.freeze({ name:'~$0001_2.tmp', modified:'10/10/2025 10:13', size:'19 KB', origin:'PROCESSO DESCONHECIDO', body:['DADOS TEMPORÁRIOS','MESMA CRIAÇÃO / TAMANHO DIVERGENTE','REFERÊNCIA: OBJETO C'] })
  }),
  'event-old': Object.freeze({
    contaminated:Object.freeze({ modified:'09/10/2025 23:48', size:'3 KB', origin:'BACKUP LOCAL / CHECKSUM DIVERGENTE', body:['VERSÃO ENCERRADA','EVENTO ASSOCIADO: 1010','FONTE B JÁ PRESENTE'] })
  }),
  cache: Object.freeze({
    foreshadow:Object.freeze({ size:'129 KB', body:['CACHE DE VISUALIZAÇÃO','BLOCO 04 / 18','THUMBNAIL: OBJETO_C','BUSCA PRESERVADA: CURITIBA'] })
  }),
  'webcam-cache': Object.freeze({
    temporal:Object.freeze({ modified:'10/10/2025 10:10', size:'7 KB', body:['DISPOSITIVO REAL: NÃO ACESSADO','FRAMES LOCAIS RECUPERADOS','FRAME_0317: 03:17:00','RELÓGIO DA ESTAÇÃO: 10:10:00','CORRESPONDÊNCIA PARCIAL NO TELEFONE'] })
  }),
  'object-c-thumb': Object.freeze({
    damaged:Object.freeze({ name:'OBJETO_C.thumb', size:'18 KB', origin:'CACHE DE MINIATURAS', attributes:'OCULTO · RECUPERÁVEL' }),
    identified:Object.freeze({ name:'IMG_CURITIBA_PRESENTE.jpg', size:'1,8 MB', origin:'CELULAR / METADATA RECUPERADA', attributes:'ARQUIVO · IDENTIDADE CONFIRMADA' })
  }),
  'shell-trace': Object.freeze({
    recovered:Object.freeze({ name:'SHELL_RECOVERY.LOG', size:'6 KB', origin:'BOOT 02', body:['SHELL.EXE ........ RECUPERADO','MEMORY ........ DUPLICATE','ENTITY_B ........ PRESENT','SOURCE_B ........ ATIVA','1 RELAÇÃO NÃO ANCORADA'] })
  })
});

export const FILE_BEHAVIORS = Object.freeze({
  stable:'Conteúdo passivo e confiável.',
  suspicious:'Metadados fora do padrão.',
  latent:'Conteúdo futuro preservado sem bloquear progressão.',
  temporal:'Conteúdo condicionado por relógio ou revisita.',
  mirror:'Cópia que pode discordar da origem.',
  carrier:'Arquivo que entrega consequência em outro dispositivo.',
  parasite:'Arquivo que deixa outro artefato no filesystem.',
  rupture:'Arquivo capaz de desmontar e reparar a shell fictícia.',
  recoverable:'Conteúdo danificado que pode ganhar identidade.'
});

export function fileRuntime(state,id) {
  return state.computer?.files?.[id] || null;
}

export function resolveComputerResource(resource,state) {
  if (!resource) return null;
  const runtime=fileRuntime(state,resource.id);
  if (!runtime) return resource;
  const variant=FILE_VARIANTS[resource.id]?.[runtime.variant] || {};
  return {
    ...resource,
    ...variant,
    behavior:runtime.behavior || 'stable',
    openCount:runtime.openCount || 0,
    quarantined:Boolean(runtime.quarantined),
    hidden:Boolean(runtime.hidden),
    recovered:Boolean(runtime.recovered),
    lastMutation:runtime.lastMutation || null
  };
}

export function visibleComputerChildren(state,folderId,baseChildren=[]) {
  let ids=[...baseChildren];
  if (folderId==='computer' && state.completed.includes('05')) ids.push('archive-170491');
  if (folderId==='downloads' && !state.vxNet?.downloads?.includes('DUMP_24.bin')) ids=[];
  if (folderId==='backup' && state.documentRuntime?.copiesSeen?.includes('A')) ids.push('rel-1708-b');
  if (folderId==='temp' && state.flags.event1010Seen) ids.push('cam-cache');
  if (folderId==='temp' && !fileRuntime(state,'tmp2')?.hidden) ids.push('tmp2');
  if (folderId==='cam-cache' && state.flags.eventChanged) ids=['frame-0017','frame-0018','webcam-cache'];
  if (folderId==='cam-cache' && state.flags.clock0317Triggered) ids=['frame-0017','frame-0018','frame-0317','webcam-cache'];
  if (folderId==='cam-cache' && state.unlocked.some((id)=>Number(id)>=20)) ids.push('cam-local-app');
  if (folderId==='images' && (state.completed.includes('08') || state.unlocked.includes('09'))) ids.push('object-c-thumb');
  if (folderId==='backup' && !fileRuntime(state,'shell-trace')?.hidden) ids.push('found-000');
  if (folderId==='found-000' && !fileRuntime(state,'shell-trace')?.hidden) ids=['shell-trace'];
  if (folderId==='quarantine') ids=[...(state.computer?.quarantine || [])];
  return [...new Set(ids)].filter((id)=>!fileRuntime(state,id)?.hidden);
}

export function sortComputerResources(resources,sortBy='name') {
  const list=[...resources];
  const key=sortBy==='modified'?'modified':sortBy==='size'?'size':'name';
  return list.sort((a,b)=>String(a?.[key]||'').localeCompare(String(b?.[key]||''),'pt-BR',{numeric:true}));
}

export function noteNavigation(state,resourceId) {
  const nav=state.computer.navigation;
  const current=nav.history[nav.index];
  if (current===resourceId) return;
  nav.history=nav.history.slice(0,nav.index+1);
  nav.history.push(resourceId);
  nav.index=nav.history.length-1;
}

export function moveNavigation(state,direction) {
  const nav=state.computer.navigation;
  const next=Math.max(0,Math.min(nav.history.length-1,nav.index+direction));
  if (next===nav.index) return null;
  nav.index=next;
  return nav.history[next] || null;
}

export function recordFileOpen(state,id) {
  const runtime=fileRuntime(state,id);
  if (!runtime) return null;
  runtime.openCount=(runtime.openCount||0)+1;
  if (id==='rel-1708-a' || id==='rel-1708-b') {
    const copy=id.endsWith('-a')?'A':'B';
    state.documentRuntime.copiesSeen=[...new Set([...state.documentRuntime.copiesSeen,copy])];
    if (runtime.openCount>1) state.documentRuntime.revision=(state.documentRuntime.revision+1)%3;
    runtime.lastMutation=runtime.openCount>1?'window-reopened':null;
  }
  if (id==='event-1010' && state.unlocked.includes('10') && runtime.variant!=='rewritten') {
    runtime.variant='rewritten'; runtime.lastMutation='event-rewrite';
    return 'carrier:event-rewrite';
  }
  if (id==='tmp1' && state.completed.includes('10') && fileRuntime(state,'tmp2')?.hidden) return 'parasite:temp-duplicate';
  if (id==='event-old' && state.flags.eventChanged && runtime.variant!=='contaminated') {
    runtime.variant='contaminated'; runtime.lastMutation='backup-contaminated';
    return 'mirror:backup-contaminated';
  }
  if (id==='cache' && state.unlocked.includes('11') && runtime.variant!=='foreshadow') {
    runtime.variant='foreshadow'; runtime.lastMutation='object-c-foreshadow';
    state.computer.navigation.rememberedQuery='CURITIBA';
    return 'latent:object-c';
  }
  if (id==='webcam-cache' && state.flags.clock0317Triggered && runtime.variant!=='temporal') {
    runtime.variant='temporal'; runtime.lastMutation='clock-conflict';
    return 'temporal:clock-conflict';
  }
  return null;
}

export function quarantineFile(state,id) {
  const runtime=fileRuntime(state,id);
  if (!runtime || runtime.quarantined) return false;
  runtime.quarantined=true;
  runtime.lastMutation='quarantined';
  state.computer.quarantine=[...new Set([...state.computer.quarantine,id])];
  return true;
}

export function markTempDuplicate(state) {
  const original=fileRuntime(state,'tmp1');
  const duplicate=fileRuntime(state,'tmp2');
  if (!original || !duplicate) return;
  original.hidden=true;
  original.lastMutation='replaced-by-duplicate';
  duplicate.hidden=false;
  duplicate.recovered=true;
}

export function beginSimulatedReboot(state,reason='INTEGRIDADE_99') {
  state.computer.boot.status='crashing';
  state.computer.boot.lastCrashReason=reason;
  state.computer.corruption.activePayload='rupture:integrity';
  state.computer.corruption.shellIntegrity=1;
  state.computer.processes.shell='stopped';
  state.computer.processes.indexer='stopped';
  state.computer.processes.sourceB='visible';
  state.computer.corruption.history=[...state.computer.corruption.history,{type:'rupture',reason,at:Date.now()}].slice(-24);
}

export function finishSimulatedReboot(state) {
  state.computer.boot.count+=1;
  state.computer.boot.status='recovered';
  state.computer.boot.safeBoot=true;
  state.computer.boot.recoveredProcesses=['SHELL.EXE','ARCHIVE.EXE','VXDRV.SYS'];
  state.computer.corruption.activePayload=null;
  state.computer.corruption.shellIntegrity=84;
  state.computer.processes.shell='recovered';
  state.computer.processes.archive='running';
  state.computer.processes.indexer='running';
  const trace=fileRuntime(state,'shell-trace');
  if (trace) { trace.hidden=false; trace.recovered=true; trace.lastMutation='boot-02'; }
}

export function stabilizeComputer(state) {
  state.computer.boot.status='ready';
  state.computer.corruption.activePayload=null;
  state.computer.corruption.shellIntegrity=100;
  state.computer.processes.shell='running';
  state.computer.processes.sourceB='stable';
}
