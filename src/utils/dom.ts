/**
 * DOM utility helpers.
 */

/** Check if the user prefers reduced motion */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Check if the user prefers a dark color scheme */
export function prefersDarkColorScheme(): Boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Add a class to body */
export function setBodyClass(name: string, active: boolean = true): void {
  if (active) {
    document.body.classList.add(name);
  } else {
    document.body.classList.remove(name);
  }
}

/** Lock/unlock body scroll */
export function setBodyScrollLock(locked: boolean): void {
  if (locked) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}
