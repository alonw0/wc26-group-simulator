import { useLayoutEffect, useRef } from "react";

/**
 * FLIP animation for reorderable lists: register each row with a stable key;
 * when a row's vertical position changes between renders, it slides from its
 * old position to the new one. Respects prefers-reduced-motion.
 */
export function useFlip(): (key: string) => (el: HTMLElement | null) => void {
  const nodes = useRef(new Map<string, HTMLElement>());
  const prevTops = useRef(new Map<string, number>());

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (const [key, el] of nodes.current) {
      const top = el.getBoundingClientRect().top;
      const prev = prevTops.current.get(key);
      if (!reduced && prev !== undefined && Math.abs(prev - top) > 2) {
        el.animate(
          [{ transform: `translateY(${prev - top}px)` }, { transform: "translateY(0)" }],
          { duration: 420, easing: "cubic-bezier(0.22, 0.9, 0.24, 1)" },
        );
      }
      prevTops.current.set(key, top);
    }
  });

  return (key: string) => (el: HTMLElement | null) => {
    if (el) nodes.current.set(key, el);
    else nodes.current.delete(key);
  };
}
