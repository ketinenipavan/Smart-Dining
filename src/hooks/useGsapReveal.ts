/**
 * useGsapReveal – tiny GSAP scroll/mount reveal hook.
 * Usage: attach the returned ref to a container and all
 * direct children will stagger-fade-up on mount / scroll-into-view.
 */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useGsapReveal(stagger = 0.08) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!ref.current) return;
      const children = Array.from(ref.current.children) as HTMLElement[];
      gsap.fromTo(
        children,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          stagger,
          duration: 0.55,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 90%',
            once: true,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [stagger]);

  return ref;
}
