"use client";

import { useEffect, type RefObject } from "react";

/**
 * Applies dynamic CSS values via the DOM style API instead of a JSX `style`
 * prop. React's `style={{...}}` renders as an HTML `style=""` attribute,
 * which a strict CSP `style-src` (no `unsafe-inline`) blocks — CSP nonces
 * can only cover `<style>`/`<script>` elements, never attributes. Setting
 * `element.style.x` from JS isn't parsed as an HTML attribute, so it's
 * unaffected by that restriction.
 */
export function useInlineStyle<T extends HTMLElement>(
  ref: RefObject<T | null>,
  styles: Partial<Record<keyof CSSStyleDeclaration, string>>,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    for (const [key, value] of Object.entries(styles)) {
      if (value !== undefined) {
        (el.style as unknown as Record<string, string>)[key] = value;
      }
    }
  });
}
