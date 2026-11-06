export const dictionary = {
  "es": {
    "posterParty":"FIESTA", "posterDJ":"DJ · SÁB",
    "sign": "Letrero: {name} {age}",
    "lit": "Letrero encendido con {name} {age}.",
    "signOn": "Letrero encendido",
    "signOff": "Letrero apagado",
    "on": "Prender",
    "off": "Apagar",
    "active": "Estilo activo ✓",
    "tryStyle": "Probar este estilo",
    "styleNotice": "Estilo {style}.",
    "cocktail": "El {name}",
    "countdown": "FALTAN {n} DÍAS PARA EL DESPEGUE",
    "quince": "MIS XV AÑOS",
    "birthday": "MI CUMPLEAÑOS",
    "fourStyles": "en cuatro estilos",
    "pause": "Pausar movimiento",
    "resume": "Reproducir movimiento",
    "worlds": {
      "neon": {
        "label": "Neón",
        "hint": "Tubos de luz sobre ladrillo",
        "dot": "#ff3f99"
      },
      "caja": {
        "label": "Caja de regalo",
        "hint": "Etiqueta dorada y papel de seda",
        "dot": "#c98a2e"
      },
      "bar": {
        "label": "Bar clandestino",
        "hint": "Latón, madera y luz ámbar",
        "dot": "#d6b26a"
      },
      "xv": {
        "label": "Gala de XV",
        "hint": "Plata, tiara y noche estrellada",
        "dot": "#b9a6ff"
      },
      "espacio": {
        "label": "Misión espacial",
        "hint": "Cabina, planetas y despegue",
        "dot": "#ffd84a"
      }
    },
    "forms": {
      "neon": {
        "tryT": "PRUÉBALO CON TU NOMBRE",
        "ph": "Tu nombre",
        "btn": "Prender"
      },
      "caja": {
        "tryT": "ESCRIBE PARA QUIÉN ES",
        "ph": "Para…",
        "btn": "Envolver"
      },
      "bar": {
        "tryT": "LA CONTRASEÑA ES TU NOMBRE",
        "ph": "Di la contraseña",
        "btn": "Entrar"
      },
      "xv": {
        "tryT": "TU NOMBRE EN LA GALA",
        "ph": "Tu nombre",
        "btn": "Brillar"
      },
      "espacio": {
        "tryT": "NOMBRE DEL PILOTO",
        "ph": "Piloto",
        "btn": "Despegar"
      }
    }
  },
  "en": {
    "posterParty":"PARTY", "posterDJ":"DJ · SAT",
    "sign": "Sign: {name} {age}",
    "lit": "Sign lit with {name} {age}.",
    "signOn": "Sign on",
    "signOff": "Sign off",
    "on": "Turn on",
    "off": "Turn off",
    "active": "Active style ✓",
    "tryStyle": "Try this style",
    "styleNotice": "{style} style.",
    "cocktail": "The {name}",
    "countdown": "{n} DAYS TO LIFTOFF",
    "quince": "MY QUINCEAÑERA",
    "birthday": "MY BIRTHDAY",
    "fourStyles": "in four styles",
    "pause": "Pause motion",
    "resume": "Resume motion",
    "worlds": {
      "neon": {
        "label": "Neon",
        "hint": "Light tubes on brick",
        "dot": "#ff3f99"
      },
      "caja": {
        "label": "Gift box",
        "hint": "Gold tag and tissue paper",
        "dot": "#c98a2e"
      },
      "bar": {
        "label": "Speakeasy",
        "hint": "Brass, wood and amber light",
        "dot": "#d6b26a"
      },
      "xv": {
        "label": "Quinceañera gala",
        "hint": "Silver, tiara and a starry night",
        "dot": "#b9a6ff"
      },
      "espacio": {
        "label": "Space mission",
        "hint": "Cockpit, planets and liftoff",
        "dot": "#ffd84a"
      }
    },
    "forms": {
      "neon": {
        "tryT": "TRY IT WITH YOUR NAME",
        "ph": "Your name",
        "btn": "Light up"
      },
      "caja": {
        "tryT": "WRITE WHO IT’S FOR",
        "ph": "For…",
        "btn": "Wrap it"
      },
      "bar": {
        "tryT": "THE PASSWORD IS YOUR NAME",
        "ph": "Say the password",
        "btn": "Enter"
      },
      "xv": {
        "tryT": "YOUR NAME AT THE GALA",
        "ph": "Your name",
        "btn": "Shine"
      },
      "espacio": {
        "tryT": "PILOT NAME",
        "ph": "Pilot",
        "btn": "Lift off"
      }
    }
  }
};
export function format(template,values){return template.replace(/\{(\w+)\}/g,(_,key)=>String(values[key]??''));}
