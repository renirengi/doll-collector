import { ElementRef, Signal, effect, viewChild } from '@angular/core';

export function createInfiniteScroll(
  trigger: Signal<ElementRef | undefined>,
  options: {
    canLoad: Signal<boolean>;
    action: () => void;
    threshold?: number;
  },
) {
  effect((onCleanup) => {
    const element = trigger()?.nativeElement;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && options.canLoad()) {
          options.action();
        }
      },
      { threshold: options.threshold ?? 0.1, rootMargin: '200px' },
    );

    observer.observe(element);
    onCleanup(() => observer.disconnect());
  });
}
