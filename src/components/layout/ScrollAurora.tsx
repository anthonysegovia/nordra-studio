import { useEffect, useRef } from "react";

const stops = [
  { id: "inicio", color: [0, 191, 214], secondary: [58, 99, 230] },
  { id: "temporada", color: [144, 81, 203], secondary: [203, 132, 64] },
  { id: "nosotros", color: [26, 187, 171], secondary: [50, 110, 233] },
  { id: "paquetes", color: [64, 105, 240], secondary: [136, 77, 230] },
  { id: "eventos", color: [153, 80, 224], secondary: [210, 85, 170] },
  { id: "contacto", color: [0, 159, 181], secondary: [52, 86, 181] },
];

export function ScrollAurora() {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    let positions: number[] = [];
    const measure = () => {
      positions = stops.map(stop => {
        const element = document.getElementById(stop.id);
        return element ? element.getBoundingClientRect().top + window.scrollY : 0;
      });
    };
    const render = () => {
      frame = 0;
      if (!layer.current) return;
      const y = window.scrollY + window.innerHeight * .35;
      let index = 0;
      while (index < stops.length - 2 && y > positions[index + 1]) index++;
      const progress = Math.min(1, Math.max(0, (y - positions[index]) / Math.max(1, positions[index + 1] - positions[index])));
      const mix = (first: number[], second: number[]) => first.map((value, channel) => Math.round(value + (second[channel] - value) * progress)).join(" ");
      layer.current.style.setProperty("--aurora-color", mix(stops[index].color, stops[index + 1].color));
      layer.current.style.setProperty("--aurora-secondary", mix(stops[index].secondary, stops[index + 1].secondary));
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(render); };
    const resize = () => { measure(); schedule(); };
    const observer = new ResizeObserver(resize);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    resize();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frame);
    };
  }, []);
  return <div ref={layer} className="scroll-aurora" aria-hidden="true"><div className="scroll-aurora-curtain" /></div>;
}
