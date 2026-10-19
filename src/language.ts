import { useSyncExternalStore } from "react";

export type Language = "es" | "en";
let language: Language = localStorage.getItem("nordra-language") === "en" ? "en" : "es";
const listeners = new Set<() => void>();
export function setLanguage(next: Language) {
  language = next;
  localStorage.setItem("nordra-language", next);
  document.documentElement.lang = next;
  listeners.forEach(listener => listener());
}
document.documentElement.lang = language;
export function useLanguage() {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => language);
}
const translations: Record<string, string> = {
"Incluye el primer mes de alojamiento y soporte desde la publicación. Después, el alojamiento se paga por separado según el plan acordado.":"Includes the first month of hosting and support from publication. Hosting is then paid separately under the agreed plan.",
"Ver continuidad y costos":"View ongoing plans and costs",
"SEGUIMOS CONTIGO":"WE ARE HERE FOR WHAT COMES NEXT",
"Tu negocio sigue. Nosotros te acompañamos.":"Your business keeps growing. We are here with you.",
"Publicar es el comienzo. Tu paquete incluye el primer mes de alojamiento y soporte técnico; después, elige cómo mantener tu página en línea con nosotros. El plan se paga por separado del desarrollo.":"Going live is just the beginning. Your package includes the first month of hosting and technical support. Then choose how to keep your website online with us. The plan is billed separately from development.",
"Todos los precios incluyen IVA. El primer mes va por nuestra cuenta; tu plan de pago comienza después, sin cargos automáticos.":"All prices include VAT. The first month is included; your paid plan starts afterwards, with no automatic charges.",
"Qué incluye y cómo funciona":"What is included and how it works",
"DESPUÉS DE PUBLICAR":"AFTER PUBLICATION",
"Tu página también necesita un lugar para vivir.":"Your website also needs a place to live.",
"El desarrollo incluye el primer mes de alojamiento y soporte técnico desde la publicación. Después eliges la continuidad; se cobra aparte del desarrollo.":"Development includes the first month of hosting and technical support from publication. You then choose an ongoing plan, billed separately from development.",
"Página informativa sencilla":"Simple informational website",
"Aplicación con panel o registros":"Application with a dashboard or registrations",
"MXN al mes":"MXN per month",
"Desde":"From",
"O $1,495 por 6 meses · $2,990 por 12 meses":"Or $1,495 for 6 months · $2,990 for 12 months",
"Desde $2,995 por 6 meses · $5,990 por 12 meses":"From $2,995 for 6 months · $5,990 for 12 months",
"IVA incluido. Los planes semestrales y anuales se pagan por adelantado; empiezan al terminar el mes incluido. La cotización fija el precio final, la capacidad y las fechas de tu proyecto.":"VAT included. Six-month and annual plans are paid in advance and start after the included month. Your quote specifies the final price, capacity and project dates.",
"Incluye subdominio de Nordra sujeto a disponibilidad, revisión preventiva mensual y mantenimiento de las funciones contratadas. Dominio propio, cambios de contenido, funciones nuevas y servicios externos se cotizan por separado.":"Includes a Nordra subdomain subject to availability, monthly preventive checks and maintenance of contracted features. A custom domain, content updates, new features and external services are quoted separately.",
"Renovación con tu aceptación y pago, sin cargos automáticos. Estos planes corresponden a negocios; los eventos tienen su propia vigencia.":"Renewal requires your acceptance and payment, with no automatic charges. These plans apply to businesses; events have their own hosting terms.",
"Consultar alojamiento, cancelaciones y reembolsos":"View hosting, cancellations and refunds (Spanish)",
"Incluido en tu paquete":"Included in your package",
"Cotizar este paquete":"Request a quote for this package",
"¿Necesitas algo más? Los extras y las funciones a medida se cotizan por separado según el alcance de tu proyecto.":"Need something else? Extras and custom features are quoted separately based on your project's scope.",
"Al confirmar tu cotización, te enviamos un link para pagar con tarjeta de crédito o débito.":"Once your quote is confirmed, we send you a link to pay by credit or debit card.",
"Escríbenos por correo":"Email us",
"Aceptamos pagos con Mercado Pago":"We accept payments through Mercado Pago",
"Al confirmar tu cotización, te compartimos un link de pago para realizar el pago de tu proyecto con tarjeta de crédito o débito.":"Once your quote is confirmed, we send you a payment link to pay for your project by credit or debit card.",
"Temporada":"Seasonal",
"Contactar a Nordra Studio por WhatsApp al +52 81 2902 2231":"Contact Nordra Studio on WhatsApp at +52 81 2902 2231",
"Nordra Studio, ir al inicio":"Nordra Studio, go to home",
"Inicio":"Home","Quiénes somos":"About us","Paquetes":"Packages","Eventos":"Events","Contacto":"Contact","Contáctanos":"Contact us","Cambiar tema":"Switch theme","Navegación principal":"Main navigation",
"IDEAS · DISEÑO · EXPERIENCIAS · RESULTADOS":"IDEAS · DESIGN · EXPERIENCES · RESULTS",
"Creamos experiencias web":"We create web experiences","para":"for","negocios y eventos":"businesses and events",
"Diseño, desarrollo y estrategia digital que conectan marcas con personas. En Nordra Studio creamos sitios modernos, experiencias memorables y soluciones digitales con propósito.":"Design, development and digital strategy that connect brands with people. At Nordra Studio, we create modern websites, memorable experiences and digital solutions with purpose.",
"Ver paquetes":"View packages","Diseño moderno":"Modern design","con propósito":"with purpose","Desarrollo a medida":"Custom development","para tu proyecto":"for your project","Resultados reales":"Real results","que generan valor":"that create value",
"QUIÉNES SOMOS":"ABOUT US","Tu idea tiene":"Your idea has","una historia.":"a story.","Nos gustaría conocerla.":"We would love to hear it.",
"Detrás de un negocio hay esfuerzo, ilusión y mucho por contar. Detrás de un evento, personas y momentos que merecen algo especial. En Nordra Studio queremos ayudarte a llevar esa historia a la web.":"Behind every business is hard work, hope and a story to tell. Behind every event are people and moments that deserve something special. At Nordra Studio, we want to help you bring that story to the web.",
"Desde Monterrey, Nuevo León, creamos páginas para negocios y eventos en México. Nos gusta escuchar lo que tienes en mente, cuidar los detalles y construir contigo un sitio que se sienta tuyo, ya sea para dar a conocer tu negocio, abrir una tienda o compartir una celebración.":"Based in Monterrey, Nuevo León, we create websites for businesses and events in Mexico. We enjoy hearing your ideas, caring for the details and building a website that feels like you, whether you want to introduce your business, open a store or share a celebration.",
"Platiquemos de tu idea":"Let's talk about your idea","LO QUE GUÍA NUESTRO TRABAJO":"WHAT GUIDES OUR WORK","Empezamos escuchándote":"We start by listening",
"Queremos conocer tu idea y lo que la hace especial para encontrar juntos cómo contarla.":"We want to understand your idea and what makes it special, so we can find the best way to tell your story together.",
"Cuidamos lo que te representa":"We care for what represents you","Los colores, las palabras y cada detalle deben sentirse como parte de tu historia.":"The colors, words and every detail should feel like part of your story.",
"Lo hacemos fácil de disfrutar":"We make it a pleasure to explore","Un sitio bonito y sencillo de recorrer, para que las personas conecten con lo que haces.":"A beautiful website that is easy to explore, so people can connect with what you do.",
"UNA OPCIÓN PARA CADA IDEA":"AN OPTION FOR EVERY IDEA","Paquetes para tu negocio":"Packages for your business","Empieza con lo que necesitas hoy. Encontramos contigo la opción que mejor se adapta a tu proyecto.":"Start with what you need today. Together, we will find the right option for your project.",
"Landing Esencial":"Essential Landing Page","Landing Profesional":"Professional Landing Page","Sitio de Negocio":"Business Website","Web a medida":"Custom Website","Tienda en línea":"Online Store",
"El primer paso para que te encuentren.":"The first step toward being found.","Dale a tu negocio espacio para contar más.":"Give your business room to tell its story.","Una casa digital para todo lo que ofreces.":"A digital home for everything you offer.","Funcionalidades que acompañan tu negocio.":"Features that support your business.","Un espacio para vender lo que haces.":"A place to sell what you create.",
"Para emprendedores y negocios que buscan empezar con una presencia sencilla y cuidada.":"For entrepreneurs and businesses starting with a simple, thoughtful online presence.",
"Para presentar tu oferta con más detalle y facilitar que tus visitantes te contacten.":"Show what you offer in more detail and make it easy for visitors to contact you.",
"Para negocios que necesitan organizar más información, mostrar sus servicios y compartir su identidad.":"For businesses that need to organize more information, showcase services and share their identity.",
"Para un proyecto que necesita algo más que una página informativa.":"For projects that need more than an informational website.","Para organizar tus productos y recibir pedidos en internet.":"Organize your products and receive orders online.",
"Una página personalizada":"One custom page","Diseño para celular y computadora":"Mobile and desktop design","Botón de WhatsApp":"WhatsApp button","Mapa, horarios y redes sociales":"Map, opening hours and social media",
"Una página con hasta 3 secciones":"One page with up to 3 sections","Diseño personalizado y adaptable":"Custom responsive design","Formulario de contacto y WhatsApp":"Contact form and WhatsApp","Optimización básica para buscadores":"Basic search engine optimization","2 rondas de cambios":"2 rounds of revisions",
"De 4 a 6 apartados de contenido":"4 to 6 content sections","Galería de fotos":"Photo gallery","Formulario, WhatsApp y redes":"Contact form, WhatsApp and social media","SEO básico y 2 rondas de cambios":"Basic SEO and 2 rounds of revisions",
"Formularios avanzados":"Advanced forms","Catálogo de productos o servicios":"Product or service catalog","Integraciones según el alcance":"Integrations within the agreed scope","WhatsApp, mapa y redes sociales":"WhatsApp, map and social media","SEO y 2 rondas de cambios":"SEO and 2 rounds of revisions",
"Catálogo según el plan":"Catalog according to the plan","Integración de pagos":"Payment integration","Opciones de envío":"Shipping options","Panel de administración":"Management dashboard","Capacitación básica":"Basic training","SEO y 2 a 3 rondas de cambios":"SEO and 2 to 3 rounds of revisions",
"Una landing reúne tu información en una sola página. El contenido y el alcance se acuerdan según lo que necesita tu negocio.":"A landing page brings your information together on a single page. Content and scope are agreed according to your business needs.",
"Las secciones son bloques dentro de una misma página, por ejemplo: inicio, servicios y contacto. También contempla mapa, horarios y enlaces a tus redes sociales.":"Sections are blocks within one page, such as home, services and contact. A map, opening hours and social links are also included.",
"Los apartados pueden incluir servicios, nosotros, galería y contacto. Definimos en la cotización si se organizan como secciones en una página o como páginas independientes. Incluye mapa y horarios.":"Content may include services, about us, a gallery and contact. The quote defines whether these are sections on one page or separate pages. A map and opening hours are included.",
"Reservas, pagos y otras integraciones se definen en la propuesta. El alcance y los servicios externos necesarios se cotizan según tu proyecto.":"Bookings, payments and other integrations are defined in the proposal. Scope and required external services are quoted for your project.",
"La cantidad de productos, cobertura de envíos, pagos y funcionalidades se acuerdan en la cotización. Las comisiones y servicios externos se especifican por separado.":"Product quantities, shipping coverage, payments and features are agreed in the quote. Fees and external services are specified separately.",
"Explorar paquete":"Explore package","¿Qué te gustaría incluir?":"What would you like to include?","Incluido":"Included","Cotizar mi selección":"Get a quote",
"Rango de referencia. La inversión final depende del diseño, contenido y funcionalidades acordadas.":"Estimated range. The final price depends on the agreed design, content and features.",
"Estas opciones están contempladas en el paquete. Tu selección nos ayuda a preparar la propuesta; desmarcarlas no aplica un descuento automático.":"These options are included in the package. Your selection helps us prepare a proposal; deselecting them does not automatically reduce the price.",
"Cada propuesta detalla el alcance y la inversión. Dominio, alojamiento y costos de servicios externos se especifican por separado en la cotización.":"Each proposal details the scope and price. Domain, hosting and external service costs are specified separately in the quote.",
"IVA incluido":"VAT included",
"EVENTOS Y CELEBRACIONES":"EVENTS AND CELEBRATIONS","Hay días que se esperan.":"Some days are eagerly awaited.","Y se recuerdan para siempre.":"And remembered forever.",
"Antes de la primera foto y del primer abrazo, hay una invitación. Hagamos que la tuya se sienta tan especial como lo que estás por celebrar.":"Before the first photo and the first hug comes an invitation. Let's make yours feel as special as the occasion you are celebrating.",
"Bodas":"Weddings","Cumpleaños y celebraciones":"Birthdays and celebrations","Eventos y encuentros":"Events and gatherings","INSPIRACIÓN DE DISEÑO":"DESIGN INSPIRATION",
"El comienzo de una historia juntos.":"The beginning of your story together.","Un espacio para compartir la ilusión de ese día y reunir los detalles que quieres contar a tus invitados.":"A place to share the excitement of your day and all the details you want your guests to know.",
"Hay momentos que merecen algo especial.":"Some moments deserve something special.","Una invitación con tu personalidad, para que la emoción de celebrar empiece desde el primer vistazo.":"An invitation with your personality, so the excitement begins at first sight.",
"Buenas ideas. Personas que conectan.":"Good ideas. People connecting.","Dale a tu encuentro un lugar propio en la web para presentar su esencia y compartir la información del evento.":"Give your gathering a home on the web to express its character and share event information.",
"Planeemos algo especial":"Let's plan something special","Tu historia marca el diseño.":"Your story inspires the design.","Platiquemos sobre el estilo, los detalles y las funciones que necesitas; con eso preparamos una propuesta para tu celebración.":"Let's talk about the style, details and features you need, so we can prepare a proposal for your celebration.",
"Fotografías de ejemplo · Cada proyecto se personaliza":"Sample photographs · Every project is customized",
"HAGAMOS ALGO EXTRAORDINARIO":"LET'S CREATE SOMETHING EXTRAORDINARY","Tu próxima gran idea empieza aquí.":"Your next great idea starts here.","Platiquemos sobre tu proyecto y creemos juntos una experiencia digital inolvidable.":"Let's talk about your project and create an unforgettable digital experience together.",
"Platiquemos por WhatsApp":"Let's chat on WhatsApp","Tu idea merece un lugar en el mundo digital.":"Your idea deserves a place in the digital world.",
"vista previa · negocio":"preview · business","DISEÑO CON PERSONALIDAD":"DESIGN WITH PERSONALITY","DISEÑOS DE EJEMPLO":"SAMPLE DESIGNS","eventos":"events","Nosotros":"About","Soluciones":"Solutions",
"Café":"Coffee","Interiores":"Interiors","Consultoría":"Consulting","CAFÉ DE ESPECIALIDAD":"SPECIALTY COFFEE","DEL ORIGEN A TU TAZA":"FROM ORIGIN TO YOUR CUP","Buen café.":"Good coffee.","Buenos días.":"Good mornings.","Haz de cada mañana un ritual.":"Make every morning a ritual.","Descubre tu próximo café favorito.":"Discover your next favorite coffee.","Explorar el café":"Explore our coffee","Un café para cada momento.":"A coffee for every moment.",
"ESTUDIO DE INTERIORES":"INTERIOR DESIGN STUDIO","DISEÑO PARA HABITAR":"DESIGN FOR LIVING","Tu espacio.":"Your space.","Tu esencia.":"Your essence.","Espacios que se sienten como tú.":"Spaces that feel like you.","Diseño pensado para tu día a día.":"Design for your everyday life.","Conocer el estudio":"Meet the studio","Cada detalle tiene un propósito.":"Every detail has a purpose.",
"CONSULTORÍA DE NEGOCIOS":"BUSINESS CONSULTING","IDEAS QUE AVANZAN":"IDEAS MOVING FORWARD","Tu siguiente":"Your next","gran paso.":"big step.","Claridad para tomar decisiones.":"Clarity for your decisions.","Estrategia para mover tu negocio.":"Strategy to move your business forward.","Conocer soluciones":"Explore solutions","Una visión clara. Nuevas posibilidades.":"A clear vision. New possibilities.",
"Una nueva":"A new","historia juntos.":"story together.","Hoy toca":"It's time to","celebrar.":"celebrate.","Ideas que":"Ideas that","nos conectan.":"connect us.","NOS CASAMOS":"WE'RE GETTING MARRIED","ESTÁS INVITADO":"YOU'RE INVITED","ENCUENTRO CREATIVO":"CREATIVE GATHERING","Una celebración para recordar.":"A celebration to remember.","Confirma tu asistencia":"RSVP","Un año más. Mil nuevos recuerdos.":"Another year. A thousand new memories.","Quiero acompañarte":"Count me in","Un espacio para compartir e inspirar.":"A space to share and inspire.","Quiero asistir":"I'd like to attend",
"Diseños de ejemplo para negocios y eventos":"Sample designs for businesses and events","Elegir diseño de escritorio":"Choose a desktop design","Reanudar diseños":"Resume designs","Pausar diseños":"Pause designs"
};
export function t(text: string): string { return language === "en" ? translations[text.replace(/\s+/g, " ").trim()] ?? text : text; }
