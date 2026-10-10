import { useEffect, useState } from 'react';

// Follow the actual scroll containers, including nested code and table views.
// The overlay is a sibling of the portal host so it never changes scroll size.
export default function ScrollHints({ host, active }) {
  const [hints, setHints] = useState([]);

  useEffect(() => {
    if (!host || !active) return undefined;
    const slot = host.parentElement;
    let frame = 0, rescan = true, stopped = false;
    let candidates = [];
    const observed = new Set();
    const schedule = (scan = false) => {
      rescan ||= scan;
      if (!frame && !stopped) frame = requestAnimationFrame(measure);
    };
    const resize = new ResizeObserver(() => schedule());
    function measure() {
      frame = 0;
      if (rescan) {
        rescan = false;
        candidates = [host, ...host.querySelectorAll('*')].filter(element => {
          const style = getComputedStyle(element);
          return /(auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`);
        });
        const next = new Set([slot, host, ...candidates, ...candidates.flatMap(element => [...element.children])]);
        for (const element of observed) if (!next.has(element)) { resize.unobserve(element); observed.delete(element); }
        for (const element of next) if (!observed.has(element)) { resize.observe(element); observed.add(element); }
      }
      const bounds = slot.getBoundingClientRect();
      const nextHints = [];
      for (const element of candidates) {
        if (!element.clientWidth || !element.clientHeight) continue;
        const rect = element.getBoundingClientRect();
        let left = Math.max(bounds.left, rect.left + element.clientLeft);
        let top = Math.max(bounds.top, rect.top + element.clientTop);
        let right = Math.min(bounds.right, rect.left + element.clientLeft + element.clientWidth);
        let bottom = Math.min(bounds.bottom, rect.top + element.clientTop + element.clientHeight);
        // Respect clipping by intermediate scroll areas and hidden wrappers.
        for (let parent = element.parentElement; parent && parent !== slot; parent = parent.parentElement) {
          const style = getComputedStyle(parent), clip = parent.getBoundingClientRect();
          if (style.overflowX !== 'visible') { left = Math.max(left, clip.left); right = Math.min(right, clip.right); }
          if (style.overflowY !== 'visible') { top = Math.max(top, clip.top); bottom = Math.min(bottom, clip.bottom); }
        }
        if (right - left < 24 || bottom - top < 24) continue;
        const style = getComputedStyle(element);
        const y = /(auto|scroll)/.test(style.overflowY), x = /(auto|scroll)/.test(style.overflowX);
        const maxX = element.scrollWidth - element.clientWidth;
        const offsetX = style.direction === 'rtl' ? maxX + element.scrollLeft : element.scrollLeft;
        const directions = [
          y && element.scrollTop > 2 && 'up',
          y && element.scrollHeight - element.clientHeight - element.scrollTop > 2 && 'down',
          x && offsetX > 2 && 'left',
          x && maxX - offsetX > 2 && 'right',
        ].filter(Boolean);
        if (directions.length) nextHints.push({ left: left - bounds.left, top: top - bounds.top, width: right - left, height: bottom - top, directions });
      }
      setHints(previous => JSON.stringify(previous) === JSON.stringify(nextHints) ? previous : nextHints);
    }
    const mutation = new MutationObserver(() => schedule(true));
    mutation.observe(host, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class', 'style', 'hidden', 'open'] });
    const onScroll = () => schedule();
    const onLoad = () => schedule(true);
    slot.addEventListener('scroll', onScroll, true);
    host.addEventListener('load', onLoad, true);
    window.addEventListener('resize', onLoad);
    schedule(true);
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      slot.removeEventListener('scroll', onScroll, true);
      host.removeEventListener('load', onLoad, true);
      window.removeEventListener('resize', onLoad);
    };
  }, [host, active]);

  if (!active) return null;
  return <div className="local-dock-scroll-hints" aria-hidden="true">
    {hints.map(({ directions, ...style }, index) => <div className="local-dock-scroll-region" key={index} style={style}>
      {directions.map(direction => <div key={direction} className={`local-dock-scroll-edge is-${direction}`}>
        <span>{({ up: '↑', down: '↓ Scroll', left: '‹', right: '›' })[direction]}</span>
      </div>)}
    </div>)}
  </div>;
}
