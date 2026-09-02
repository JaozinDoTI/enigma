const freeze = (value) => Object.freeze(value);

export const PHONE_APPS = freeze([
  ['messages','✉','Mensagens'], ['calls','☎','Telefone'], ['gallery','▧','Galeria'],
  ['files','▤','Arquivos'], ['camera','◉','CAM Archive'], ['recorder','≋','Gravador'],
  ['notes','▱','Notas'], ['calendar','□','Calendário'], ['contacts','◎','Contatos']
]);

export const PHONE_SEED_ENTRIES = freeze([
  freeze({ id:'seed:message:j', definition:'NORMAL_MESSAGE_J', kind:'message', source:'device', status:'visible',
    payload:{ thread:'j', sender:'J.', side:'in', text:'você ainda está com meu adaptador?', timestamp:'09:42', notify:false } }),
  freeze({ id:'seed:message:mother', definition:'NORMAL_MESSAGE_J', kind:'message', source:'device', status:'visible',
    payload:{ thread:'mae', sender:'Mãe', side:'in', text:'deixei as pilhas na segunda gaveta.', timestamp:'08:16', notify:false } }),
  freeze({ id:'seed:note:home', definition:'NORMAL_NOTE', kind:'note', source:'device', status:'visible',
    payload:{ title:'Casa', text:'comprar pilhas\ndevolver o adaptador\nregar a planta', timestamp:'ontem' } }),
  freeze({ id:'seed:battery', definition:'NORMAL_BATTERY', kind:'battery', source:'device', status:'visible',
    payload:{ value:78 } }),
  freeze({ id:'seed:call:j', definition:'NORMAL_CALL_HISTORY', kind:'call', source:'device', status:'visible',
    payload:{ person:'J.', number:'local-01', callState:'answered', duration:'00:18', timestamp:'ontem, 18:04', signal:'normal' } }),
  freeze({ id:'seed:gallery:plant', definition:'NORMAL_GALLERY', kind:'gallery', source:'device', status:'visible',
    payload:{ name:'IMG_1007.jpg', label:'Planta da janela', meta:'07/10/2025 · 16:21', src:'./assets/images/camera-01.svg' } }),
  freeze({ id:'seed:gallery:shelf', definition:'NORMAL_GALLERY', kind:'gallery', source:'device', status:'visible',
    payload:{ name:'IMG_1008.jpg', label:'Estante', meta:'08/10/2025 · 19:03', src:'./assets/evidence/books/shelf-cam-01.jpg' } }),
  freeze({ id:'seed:file:receipt', definition:'NORMAL_NOTE', kind:'file', source:'device', status:'visible',
    payload:{ name:'comprovante.pdf', fileType:'PDF', size:'84 KB', location:'Downloads', detail:'arquivo recebido · 08/10' } }),
  freeze({ id:'seed:recording', definition:'NORMAL_CALL_HISTORY', kind:'recording', source:'device', status:'visible',
    payload:{ name:'lembrete_02.m4a', duration:'00:04', signal:'normal' } }),
  freeze({ id:'seed:calendar', definition:'NORMAL_NOTE', kind:'calendar', source:'device', status:'visible',
    payload:{ day:'10', time:'10:10', title:'devolver adaptador' } })
]);

const event = (definition, level, options) => freeze({ definition, level, max:1, cooldown:180000, delay:[2400,6200], weight:1, ...options });

export const PHONE_EVENT_CATALOG = freeze([
  event('NORMAL_MESSAGE_J',0,{ group:'message', weight:3, max:1, payload:{ kind:'message', thread:'j', sender:'J.', side:'in', text:'depois me avisa se achou o cabo.', notify:true } }),
  event('NORMAL_NOTE',0,{ group:'background', weight:1, payload:{ kind:'note', title:'sem título', text:'não esquecer a janela.', notify:false } }),
  event('NORMAL_BATTERY',0,{ group:'system', weight:1, payload:{ kind:'battery', value:72, notify:false } }),
  event('NORMAL_CALL_HISTORY',0,{ group:'call', weight:1, payload:{ kind:'call', person:'Assistência', callState:'missed', duration:'00:00', timestamp:'agora', notify:true } }),
  event('NORMAL_GALLERY',0,{ group:'background', weight:1, payload:{ kind:'gallery', name:'IMG_1010.jpg', label:'Mesa', meta:'10/10/2025 · 10:01', src:'./assets/images/camera-03.svg', notify:false } }),

  event('ODD_PHANTOM_NOTIFICATION',1,{ group:'notification', cooldown:230000, payload:{ kind:'phantom', label:'Mensagens', preview:'1 nova mensagem', notify:true, expiresAfter:7000 } }),
  event('ODD_TYPING',1,{ group:'presence', max:2, payload:{ kind:'typing', thread:'unknown', duration:4800, notify:false } }),
  event('ODD_CLOCK_OFFSET',1,{ group:'time', cooldown:260000, payload:{ kind:'clock', offset:-3, duration:18000, notify:false } }),
  event('ODD_LATE_NOTIFICATION',1,{ group:'message', payload:{ kind:'message', thread:'unknown', sender:'Número não salvo', side:'in', text:'isso já tinha chegado.', timestamp:'há 4 min', notify:true } }),

  event('REACT_IGNORED_PHONE',2,{ group:'message', condition:(s)=>s.phone.activity.ignored>=1, payload:{ kind:'message', thread:'unknown', sender:'Número não salvo', side:'in', text:'você viu.', notify:true } }),
  event('REACT_REPEATED_PHOTO',2,{ group:'gallery', condition:(s)=>(s.phone.activity.items['gallery:seed:gallery:shelf']||0)>=3, payload:{ kind:'gallery', name:'IMG_1008_2.jpg', label:'Estante', meta:'08/10/2025 · 19:03 · cópia', src:'./assets/evidence/books/shelf-cam-01.jpg', notify:true } }),
  event('REACT_FAST_OPEN_CLOSE',2,{ group:'message', condition:(s)=>s.phone.activity.quickCloses>=2, payload:{ kind:'message', thread:'unknown', sender:'Número não salvo', side:'in', text:'não precisava fechar tão rápido.', notify:true } }),
  event('REACT_LONG_PC_SESSION',2,{ group:'message', condition:(s)=>s.phone.activity.pcDuration>=120000, payload:{ kind:'message', thread:'unknown', sender:'Número não salvo', side:'in', text:'a tela continua acesa.', notify:true } }),
  event('REACT_RECEIVER_OBSESSION',2,{ group:'call', condition:(s)=>s.phone.activity.receiverUses>=7, payload:{ kind:'call', person:'Número não salvo', callState:'ringing', duration:'00:00', signal:'source.03', notify:true, expiresAfter:18000 } }),
  event('REACT_REJECTED_CALL',2,{ group:'message', condition:(s)=>s.phone.activity.rejected>=1, payload:{ kind:'message', thread:'unknown', sender:'Número não salvo', side:'in', text:'recusar não interrompe o sinal.', notify:true } }),
  event('REACT_RETURNED_CALL',2,{ group:'message', condition:(s)=>s.phone.activity.returned>=1, payload:{ kind:'message', thread:'unknown', sender:'Número não salvo', side:'in', text:'agora você ligou para quem?', notify:true } }),

  event('IMPOSSIBLE_MESSAGE_EDIT',3,{ group:'mutation', cooldown:320000, payload:{ kind:'mutation', operation:'edit-message', targetDefinition:'CANON_PC_FILE', text:'eu disse para não abrir.', notify:false } }),
  event('IMPOSSIBLE_MESSAGE_REMOVE',3,{ group:'mutation', cooldown:320000, payload:{ kind:'mutation', operation:'remove-message', targetDefinition:'CANON_PC_FILE', notify:false } }),
  event('IMPOSSIBLE_MISSING_CALL',3,{ group:'call', payload:{ kind:'call', person:'Sem número', callState:'ringing', duration:'00:00', signal:'silence', notify:true, expiresAfter:16000, vanish:true } }),
  event('IMPOSSIBLE_TEMP_CONTACT',3,{ group:'contact', payload:{ kind:'contact', name:'VOCÊ', number:'agora', notify:true, expiresAfter:42000 } }),
  event('IMPOSSIBLE_GALLERY_CHANGE',3,{ group:'gallery', payload:{ kind:'gallery', name:'IMG_1008_3.jpg', label:'Estante', meta:'amanhã · 03:17', src:'./assets/evidence/books/shelf-cam-01.jpg', variant:true, notify:true } }),
  event('IMPOSSIBLE_OLD_TIMESTAMP',3,{ group:'time', payload:{ kind:'message', thread:'unknown', sender:'Número não salvo', side:'in', text:'você ainda não tinha aberto.', timestamp:'ontem', notify:true } })
]);

export const PHONE_CANONICAL = freeze({
  'computer.event.isolated':{ definition:'CANON_PC_FILE', payload:{ kind:'message', thread:'unknown', sender:'Número não salvo', side:'in', text:'você abriu justamente esse.', notify:true } },
  'tv.channel.04.locked':{ definition:'CANON_RECEIVER_SIGNAL', payload:{ kind:'call', person:'Número não salvo', callState:'ringing', duration:'00:00', signal:'source.03', notify:true, expiresAfter:18000 } },
  'computer.event.rewritten':{ definition:'CANON_FILE_CHANGED', payload:{ kind:'message', thread:'unknown', sender:'Número não salvo', side:'in', text:'você demorou para perceber que mudou.', notify:true } },
  'computer.clock.0317':{ definition:'CANON_CLOCK_0317', payload:{ kind:'message', thread:'unknown', sender:'Número não salvo', side:'in', text:'você já viu esse horário.', timestamp:'03:17', notify:true } },
  'room.node.validated':{ definition:'CANON_LOCAL', payload:{ kind:'message', thread:'unknown', sender:'Número não salvo', side:'in', text:'local não significa seu.', notify:true } },
  'computer.integrity.ruptured':{ definition:'CANON_STATION', payload:{ kind:'message', thread:'unknown', sender:'Número não salvo', side:'in', text:'a estação ainda está respondendo.', notify:true } },
  'computer.reboot.completed':{ definition:'CANON_REBOOT', payload:{ kind:'message', thread:'unknown', sender:'Número não salvo', side:'in', text:'você chamou isso de reiniciar.', notify:true } }
});

export const PHASE12_ENTRIES = freeze([
  freeze({ id:'phase12:j:01', definition:'PHASE12_J', kind:'message', source:'canonical', status:'visible', payload:{ thread:'j', sender:'J.', side:'in', text:'achei outra cópia daquela foto.', timestamp:'10:06', notify:false, visibleFrom:'12' } }),
  freeze({ id:'phase12:j:02', definition:'PHASE12_J', kind:'message', source:'canonical', status:'visible', payload:{ thread:'j', sender:'J.', side:'in', text:'o anexo não abre aqui. vê os detalhes dele.', timestamp:'10:07', notify:true, visibleFrom:'12', attachment:{ name:'IMG_1010.jpg', state:'corrupt', reference:'OBJETO_C.thumb' } } }),
  freeze({ id:'phase12:file', definition:'PHASE12_FILE', kind:'file', source:'canonical', status:'visible', payload:{ name:'OBJETO_C.thumb', fileType:'IMG', size:'18 KB', location:'CAM Archive', detail:'cache parcial · origem FRAME_0317.BMP', visibleFrom:'12' } }),
  freeze({ id:'phase12:frame', definition:'PHASE12_FRAME', kind:'gallery', source:'canonical', status:'visible', payload:{ name:'FRAME_0317.BMP', label:'Cópia preservada', meta:'17/04/2019 · objeto: CURITIBA', src:'./assets/images/camera-02.svg', archive:true, visibleFrom:'12' } })
]);
