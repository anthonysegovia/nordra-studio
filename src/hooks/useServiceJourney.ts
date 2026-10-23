import { useEffect, useRef } from "react";
import type { MouseEvent, RefObject } from "react";

/** A single, interruptible gesture from the intro illustration to a service section. */
export function useServiceJourney(root: RefObject<HTMLDivElement | null>, paused: boolean) {
  const cancelJourney = useRef<(() => void) | null>(null);
  useEffect(() => () => cancelJourney.current?.(), []);

  return (event: MouseEvent<HTMLAnchorElement>) => {
    const link = event.currentTarget;
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.search !== window.location.search || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    const intro = root.current;
    if (!target || !intro) return;
    event.preventDefault();
    // Repeated taps keep the current gesture and create only one history entry.
    if (cancelJourney.current) {
      if (window.location.hash === url.hash) return;
      cancelJourney.current();
    }

    const destination = link.dataset.serviceJourney ?? "examples";
    const arrival = target.querySelector<HTMLElement>("[data-service-arrival-anchor], .universes-heading") ?? target.closest<HTMLElement>("[data-service-arrival-anchor]") ?? target;
    const focusTarget = target.querySelector<HTMLElement>("h2, [data-service-focus]") ?? target;
    const keyboard = event.detail === 0;
    const focusArrival = () => {
      focusTarget.dataset.serviceKeyboard = String(keyboard);
      focusTarget.focus({ preventScroll: true });
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const destinationY = () => {
      const header = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
      const inset = Math.max(0, header) + 28;
      return Math.max(0, Math.min(target.getBoundingClientRect().top + window.scrollY - inset, document.documentElement.scrollHeight - window.innerHeight));
    };
    const setHash = () => {
      if (window.location.hash !== url.hash) window.history.pushState(window.history.state, "", url.hash);
    };
    if (paused || reduce.matches) {
      setHash();
      window.scrollTo({ top: destinationY(), behavior: "instant" });
      focusArrival();
      return;
    }

    const startY = window.scrollY;
    const endY = destinationY();
    const width = window.innerWidth;
    const distance = Math.abs(endY - startY);
    const duration = destination === "packages"
      ? Math.min(1800, Math.max(1000, distance * .25 + 720))
      : Math.min(1100, Math.max(760, distance * .45 + 640));
    const started = performance.now();
    let frame = 0;
    let arrivalStarted = false;
    let arrivalAt = 0;
    let landed = false;
    let stopped = false;
    let expectedY = startY;

    const cleanup = () => {
      stopped = true;
      window.cancelAnimationFrame(frame);
      delete intro.dataset.journey;
      delete intro.dataset.journeyDestination;
      delete arrival.dataset.serviceArrival;
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("scroll", scrollInterrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("pointerdown", pointerInterrupt);
      window.removeEventListener("keydown", keyInterrupt);
      window.removeEventListener("resize", resize);
      window.removeEventListener("popstate", interrupt);
      window.removeEventListener("hashchange", interrupt);
      window.removeEventListener("pagehide", interrupt);
      document.removeEventListener("visibilitychange", visibility);
      reduce.removeEventListener("change", motionChange);
      cancelJourney.current = null;
    };
    const interrupt = () => cleanup();
    // Also respect scrollbar dragging and assistive navigation that do not emit a wheel event.
    const scrollInterrupt = () => { if (Math.abs(window.scrollY - expectedY) > 2) cleanup(); };
    const pointerInterrupt = (input: PointerEvent) => {
      if (!(input.target instanceof Element) || !input.target.closest("[data-service-journey]")) cleanup();
    };
    const keyInterrupt = (input: KeyboardEvent) => {
      if (!["Shift", "Control", "Alt", "Meta"].includes(input.key)) cleanup();
    };
    // Mobile browser chrome may change height while scrolling; only reflow cancels.
    const resize = () => { if (window.innerWidth !== width) cleanup(); };
    const visibility = () => { if (document.hidden) cleanup(); };
    const motionChange = () => {
      if (!reduce.matches) return;
      cleanup();
      window.scrollTo({ top: destinationY(), behavior: "instant" });
      focusArrival();
    };
    const tick = (now: number) => {
      if (stopped) return;
      const progress = Math.min(1, Math.max(0, (now - started - 150) / duration));
      // Zero velocity and acceleration at both ends, without a sudden scroll start.
      const eased = progress ** 3 * (progress * (progress * 6 - 15) + 10);
      if (!landed) {
        expectedY = startY + (endY - startY) * eased;
        window.scrollTo({ top: expectedY, behavior: "instant" });
      }
      if (!arrivalStarted && progress >= .65 && (arrival.getBoundingClientRect().top < window.innerHeight * .85 || progress === 1)) {
        arrivalStarted = true;
        arrivalAt = now;
        arrival.dataset.serviceArrival = intro.classList.contains("service-intro-invitation") ? "invitation" : "business";
      }
      if (progress === 1 && !landed) {
        landed = true;
        focusArrival();
      }
      if (landed && now - arrivalAt >= 900) { cleanup(); return; }
      frame = window.requestAnimationFrame(tick);
    };

    cancelJourney.current = cleanup;
    setHash();
    intro.dataset.journey = "departing";
    intro.dataset.journeyDestination = destination;
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("scroll", scrollInterrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("pointerdown", pointerInterrupt, { passive: true });
    window.addEventListener("keydown", keyInterrupt);
    window.addEventListener("resize", resize);
    window.addEventListener("popstate", interrupt);
    window.addEventListener("hashchange", interrupt);
    window.addEventListener("pagehide", interrupt);
    document.addEventListener("visibilitychange", visibility);
    reduce.addEventListener("change", motionChange);
    frame = window.requestAnimationFrame(tick);
  };
}
