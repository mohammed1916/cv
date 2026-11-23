import ZoomControls from './ZoomControls';
import ThemeToggle from './ThemeToggle';
import LayoutControls from './LayoutControls';
import './ViewMenu.css';

export default function ViewMenu({layoutWidth,onLayoutChange,showTheme=false}) {
  return <details className="view-menu">
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
