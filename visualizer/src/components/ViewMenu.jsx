import { useEffect, useRef } from 'react';
import ZoomControls from './ZoomControls';
import ThemeToggle from './ThemeToggle';
import LayoutControls from './LayoutControls';
import './ViewMenu.css';

export default function ViewMenu({layoutWidth,onLayoutChange,showTheme=false}) {
  const ref = useRef(null);
  // Tapping anywhere outside the popover, or pressing Escape, closes it.
  useEffect(() => {
    const close = event => { if (ref.current?.open && !ref.current.contains(event.target)) ref.current.open = false; };
    const escape = event => { if (event.key === 'Escape' && ref.current) ref.current.open = false; };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
  }, []);
  return <details ref={ref} className="view-menu">
    <summary>View</summary>
    <div className="view-menu__popover">
      <span className="layout-label">Zoom</span>
      <ZoomControls embedded />
      <LayoutControls layoutWidth={layoutWidth} onChange={onLayoutChange} />
      {showTheme && <>
        <span className="layout-label">Theme</span>
        <ThemeToggle />
      </>}
    </div>
  </details>;
}
