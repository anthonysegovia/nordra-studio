export type Occasion = "wedding" | "birthday" | "gathering";

export function getOccasions(english: boolean) {
  return [
    {
      id: "wedding" as const, path: "/bodas.html",
      label: english ? "Weddings" : "Bodas", intro: english ? "Your love, made into an invitation." : "Su amor, hecho invitación.",
      title: english ? "An invitation to" : "Una invitación al",
      titleAccent: english ? "forever" : "para siempre",
      copy: english ? "Your story, your people, your day. A digital invitation as personal as the love you share." : "Su historia, sus personas, su gran día. Una invitación digital tan especial como lo que sienten.",
      mood: english ? "Romantic · timeless · yours" : "Romántica · delicada · suya",
      sampleName: "Valeria & Mateo", sampleDate: "18 · 09 · 2027", samplePlace: "Jardín Magnolia", sampleTime: "17:00",
      sampleLine: english ? "Together is our favorite place." : "Nuestro lugar favorito es juntos.",
      features: english ? ["Your story and photographs", "Ceremony and reception", "Replies in your private panel"] : ["Su historia y fotografías", "Ceremonia y recepción", "Respuestas en su panel privado"],
      experienceTitle: english ? "Every detail tells your story" : "Cada detalle habla de ustedes",
      experienceCopy: english ? "Explore a garden wedding: the story, the schedule and every detail in one invitation." : "Explora una boda en jardín: la historia, los horarios y cada detalle en una misma invitación.",
      steps: english ? ["Tell us about your wedding", "Choose the design together", "Share your invitation"] : ["Cuéntenos sobre su boda", "Elegimos el diseño juntos", "Compartan su invitación"],
      contact: english ? "Let's give your story a beautiful beginning" : "Démosle un inicio bonito a su historia",
    },
    {
      id: "birthday" as const, path: "/cumpleanos.html",
      label: english ? "Birthdays" : "Cumpleaños", intro: english ? "The magic of celebrating your life." : "La magia de celebrar tu vida.",
      title: english ? "The party starts with your invitation" : "La fiesta empieza con tu invitación",
      copy: english ? "Your colors, your photographs and your favorite people. Let's set the mood for your celebration." : "Tus colores, tus fotos y tus personas favoritas. Empecemos a darle ambiente a tu celebración.",
      mood: english ? "Colorful · playful · personal" : "Colorida · divertida · muy tú",
      sampleName: "Sofía · 25", sampleDate: "24 · 07 · 2027", samplePlace: "Terraza Aurora", sampleTime: "19:00",
      sampleLine: english ? "One more trip around the sun." : "Una vuelta más al sol.",
      features: english ? ["Your theme and photographs", "Time, place and dress code", "Replies in your private panel"] : ["Tu temática y fotografías", "Hora, lugar y vestimenta", "Respuestas en tu panel privado"],
      experienceTitle: english ? "A celebration with your personality" : "Una celebración con tu personalidad",
      experienceCopy: english ? "A taste of the look: bold color, your name in the spotlight and the details close at hand." : "Así puede sentirse: color, tu nombre como protagonista y los detalles siempre a la mano.",
      steps: english ? ["Tell us your party idea", "Choose the colors and details", "Send it to your favorite people"] : ["Cuéntanos tu idea de fiesta", "Elegimos colores y detalles", "Invita a tus personas favoritas"],
      contact: english ? "How do you imagine your next celebration?" : "¿Cómo imaginas tu próxima celebración?",
    },
    {
      id: "gathering" as const, path: "/eventos.html",
      label: english ? "Events" : "Eventos", intro: english ? "The wonder of coming together." : "La magia de encontrarnos.",
      title: english ? "Bring people together, from the first impression" : "Conecta desde la primera invitación",
      copy: english ? "For gatherings, launches and special occasions. Give your guests the details they need in one place." : "Para encuentros, lanzamientos y ocasiones especiales. Todo lo que tus invitados necesitan, en un solo lugar.",
      mood: english ? "Clear · contemporary · connected" : "Clara · contemporánea · cercana",
      sampleName: "Conexión / 27", sampleDate: "12 · 06 · 2027", samplePlace: "Espacio Nodo", sampleTime: "10:00",
      sampleLine: english ? "Ideas worth coming together for." : "Ideas que vale la pena compartir.",
      features: english ? ["Your event's visual identity", "Agenda, location and directions", "Replies in your private panel"] : ["La identidad de tu encuentro", "Agenda, ubicación y acceso", "Respuestas en tu panel privado"],
      experienceTitle: english ? "An invitation that gets to the point" : "Una invitación que conecta y orienta",
      experienceCopy: english ? "A visual example for your next gathering: a clear identity, a simple agenda and all the essential details." : "Un ejemplo visual para tu próximo encuentro: identidad clara, agenda sencilla y los detalles esenciales.",
      steps: english ? ["Tell us about your event", "Define the identity and agenda", "Share it with your guests"] : ["Cuéntanos sobre tu evento", "Definimos identidad y agenda", "Compártelo con tus invitados"],
      contact: english ? "Let's create your next meeting point" : "Creemos tu próximo punto de encuentro",
    },
  ];
}

export function invitationQuote(english: boolean, occasion?: string, plan?: string) {
  const message = english
    ? `Hi, Nordra! I'd like a digital invitation${occasion ? ` for ${occasion.toLowerCase()}` : ""}${plan ? ` with the ${plan} plan` : ""}. Can we talk about my event's date and details?`
    : `¡Hola, Nordra! Me gustaría una invitación digital${occasion ? ` para ${occasion.toLowerCase()}` : ""}${plan ? ` con el paquete ${plan}` : ""}. Quisiera platicar sobre la fecha y los detalles de mi evento.`;
  return `https://wa.me/528129022231?text=${encodeURIComponent(message)}`;
}
