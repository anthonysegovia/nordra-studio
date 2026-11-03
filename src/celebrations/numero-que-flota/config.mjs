export const invitation = {
  name:'Camila', balloons:'30', phrase:'Treinta y con ganas de bailar',
  date:'2027-07-24', hour:'19:00', zone:'America/Mexico_City', place:'Terraza Aurora',
  palette:{night:'#1d1a2e',plum:'#30283c',gold:'#dfb66d',ivory:'#f4e9d3',highlight:'#e6c98e',inkGold:'#74531b'},
  poster:'/artwork/numero-que-flota/camila', openingMs:2150,
  photos:[
    [5,'Los 5','Con harina hasta en la nariz.','Camila de niña mezclando masa'],
    [15,'Los 15','Me cambié los tacones por tenis.','Camila con vestido azul atándose los tenis'],
    [18,'Los 18','El diploma casi sale volando.','Camila con toga y diploma al aire libre'],
    [25,'Los 25','Mi primera mudanza, planta incluida.','Camila entrando a su departamento con una planta'],
    [29,'Los 29','Dije que era una caminata corta.','Camila con chaqueta roja en el bosque'],
    [30,'Hoy','Mi pista sigue siendo la cocina.','Camila riendo y bailando en la cocina']
  ].map(([age,label,caption,alt])=>({src:'/artwork/birthday-camila-fotos/'+age,label,caption,alt})),
  cards:[
    {label:'Vestimenta',title:'Un toque de brillo',detail:'Dorado, negro, champaña o lo que te haga brillar.',colors:['#ba924a','#19171d','#e9d4a5','#c1a6ad']},
    {label:'Regalos',title:'Tu presencia es el regalo',detail:'Si te nace dejarme un sobre, habrá una cajita junto al pastel.'},
    {label:'Notas',title:'Antes de salir',detail:'Noche solo para adultos. Habrá valet parking.'}
  ],
  copy:{
    posterAlt:'Globos de foil dorado en forma de',sampleMeta:'Invitación de muestra',unavailable:'Pase no disponible',brand:'NORDRA STUDIO',edition:'INVITACIÓN DE CUMPLEAÑOS',coverTitle:'EL NÚMERO QUE FLOTA',
    open:'Abrir invitación',skip:'Entrar sin animación',pause:'Pausar globos',resume:'Reanudar globos',
    nav:['Inicio','Cuándo','Camila','Detalles','Pase'],navLabel:'Recorrido de la fiesta',
    when:'Nos vemos a las siete',clockLabel:'Falta para la fiesta',units:['Días','Horas','Min','Seg'],
    today:'Hoy celebramos',past:'Gracias por venir',location:'Ubicación general, sin dirección publicada',
    calendar:'Agregar al calendario',directions:'Ubicación por confirmar',album:'30 años en 6 fotos',know:'Lo que debes saber',
    ticket:'Tu pase',admission:'ENTRADA PERSONAL',stub:'Talón',guestPlaceholder:'Tu nombre aquí',loadingGuest:'Buscando tu pase…',
    seat:'lugar',seats:'lugares',reserved:'Por confirmar',accepted:'Confirmado',declined:'Esta vez no',
    notice:'Las respuestas de esta vista no se envían',personalNotice:'Este enlace es personal. Confirma por cada persona invitada.',
    guest:'Tu nombre',guestHint:'Escribe tu nombre',answer:'¿Vienes a bailar?',yes:'Sí, asistiré',no:'Esta vez no',
    testReply:'Probar confirmación',saveReply:'Guardar mi respuesta',saved:'Tu respuesta ya está en el panel de muestra.',
    yesMessage:'Te guardo un lugar en la pista.',noMessage:'Te voy a extrañar. Nos debemos ese baile.',
    sampleResult:'Es una muestra: no se ha enviado ni guardado ninguna respuesta.',
    personPicker:'Persona que responde',companion:'Acompañante',invalidLink:'El enlace personal está incompleto.',qrPass:'Ver mi pase QR',
    credit:'Un diseño de Nordra',back:'Ver invitaciones',noScript:'Activa JavaScript para abrir esta invitación.'
  }
};
