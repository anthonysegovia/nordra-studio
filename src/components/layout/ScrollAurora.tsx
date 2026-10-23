import { useLayoutEffect, useRef } from "react";

const stops = [
  { id: "inicio", color: [0, 191, 214], secondary: [58, 99, 230] },
  { id: "paquetes", color: [64, 105, 240], secondary: [136, 77, 230] },
  { id: "eventos", color: [153, 80, 224], secondary: [210, 85, 170] },
  { id: "temporada", color: [144, 81, 203], secondary: [203, 132, 64] },
  { id: "nosotros", color: [26, 187, 171], secondary: [50, 110, 233] },
  { id: "contacto", color: [0, 159, 181], secondary: [52, 86, 181] },
];

export function ScrollAurora() {
  const layer = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let activeStops: (typeof stops[number] & { top: number })[] = [];
    const measure = () => {
      activeStops = stops.flatMap(stop => {
        const element = document.getElementById(stop.id);
        return element ? [{ ...stop, top: element.getBoundingClientRect().top + window.scrollY }] : [];
      }).sort((first, second) => first.top - second.top);
    };
    const render = () => {
      frame = 0;
      if (!layer.current || !activeStops.length) return;
      const y = window.scrollY;
      let index = 0;
      while (index < activeStops.length - 1 && y > activeStops[index + 1].top) index++;
      const current = activeStops[index];
      const next = activeStops[Math.min(index + 1, activeStops.length - 1)];
      const progress = Math.min(1, Math.max(0, (y - current.top) / Math.max(1, next.top - current.top)));
      const mix = (first: number[], second: number[]) => first.map((value, channel) => Math.round(value + (second[channel] - value) * progress)).join(" ");
      layer.current.style.setProperty("--aurora-color", mix(current.color, next.color));
      layer.current.style.setProperty("--aurora-secondary", mix(current.secondary, next.secondary));
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(render); };
    const resize = () => { measure(); schedule(); };
    const observer = new ResizeObserver(resize);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    // Match the destination before paint, rather than switching colors a frame later.
    measure();
    render();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frame);
    };
  }, []);
  return <div ref={layer} className="scroll-aurora" aria-hidden="true"><div className="scroll-aurora-curtain" /></div>;
}
