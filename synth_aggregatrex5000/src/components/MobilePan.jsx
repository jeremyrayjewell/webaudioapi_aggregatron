import React, { useEffect, useRef, useState, useCallback } from 'react';

// Horizontally pan child content when it overflows the visible rail in mobile portrait.
export default function MobilePan({ children }) {
  const railRef = useRef(null);
  const panRef = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const [offset] = useState(0); // kept for potential transform fallback
  const dragState = useRef({
    maybeDown: false,
    dragging: false,
    startX: 0,
    startY: 0,
    startOffset: 0,
    startScrollLeft: 0,
  });

  const measure = useCallback(() => {
    const mql = window.matchMedia('(orientation: portrait) and (max-width: 900px)');
    const rail = railRef.current;
    if (!rail) return;

    const railW = rail.clientWidth;
    const pan = panRef.current;
    // Force the scroll area to match the actual visual width of the scaled inner content
    const inner = pan ? pan.querySelector('.instrument-inner') : null;
    if (inner) {
      const visualW = inner.getBoundingClientRect().width;
      if (visualW && pan) {
        pan.style.width = `${Math.ceil(visualW)}px`;
      }
    }
    const scrollW = rail.scrollWidth;
    const shouldEnable = mql.matches && scrollW > railW + 1;
    setEnabled(shouldEnable);

    // Center using the real scrollable range; defer to next frame so layout settles
    const center = () => {
      const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
      rail.scrollLeft = Math.floor(maxScroll / 2);
    };
    if (shouldEnable) {
      if ('requestAnimationFrame' in window) {
        requestAnimationFrame(() => requestAnimationFrame(center));
      } else {
        center();
      }
    } else {
      rail.scrollLeft = 0;
    }
  }, []);

  useEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    let ro;
    const pan = panRef.current;
    if (pan && 'ResizeObserver' in window) {
      ro = new ResizeObserver(() => measure());
      ro.observe(pan);
    }
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      if (ro) ro.disconnect();
    };
  }, [measure]);

  // Pointer handlers
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

  const onPointerDown = (e) => {
      if (!enabled) return;
      dragState.current = {
        maybeDown: true,
        dragging: false,
        startX: e.clientX,
        startY: e.clientY,
    startOffset: offset,
    startScrollLeft: rail.scrollLeft,
      };
    };

    const onPointerMove = (e) => {
      if (!enabled || !dragState.current.maybeDown) return;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      if (!dragState.current.dragging) {
        // Require small threshold before activating drag to avoid interfering with taps/controls
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
        dragState.current.dragging = true;
        try { rail.setPointerCapture?.(e.pointerId); } catch {}
      }
      // Prefer natural horizontal gesture; fallback to vertical due to rotation if it's dominant
      const dominant = Math.abs(dx) >= Math.abs(dy) ? dx : -dy; // swipe right => positive dx => move view right
  const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
      const next = Math.max(0, Math.min(maxScroll, dragState.current.startScrollLeft + dominant));
      rail.scrollLeft = next;
      e.preventDefault();
    };

    const end = () => {
      dragState.current.maybeDown = false;
      dragState.current.dragging = false;
    };

    rail.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      rail.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, [enabled, offset]);

  return (
    <div
      className="instrument-rail"
      ref={railRef}
  style={{ touchAction: enabled ? 'none' : 'auto' }}
    >
  <div className="instrument-pan" ref={panRef}>
        {children}
      </div>
    </div>
  );
}
