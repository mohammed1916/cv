import ZoomControls from './ZoomControls';
import LayoutControls from './LayoutControls';
import './ViewMenu.css';

export default function ViewMenu({layoutWidth,onLayoutChange}) {
  return <details className="view-menu">
    <summary>View</summary>
    <div className="view-menu__popover">
      <span className="layout-label">Zoom</span>
      <ZoomControls embedded />
      <LayoutControls layoutWidth={layoutWidth} onChange={onLayoutChange} />
    </div>
  </details>;
}
