import { useRef, useState, useLayoutEffect } from "react";
import "./FloatingPanel.css";
import PanelScaleControl from './PanelScaleControl';

export default function FloatingPanel({
  title = "Panel",
  children,
  defaultPosition = null,
}) {
  const panelRef = useRef(null);
  const dragState = useRef(null);
  const [position, setPosition] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [controlScale, setControlScale] = useState(100);
  const [size, setSize] = useState(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem("floating-playback-size"));
      if (stored?.width >= 220 && stored?.height >= 92) return stored;
    } catch {
      // A sensible default is preferable to a broken persisted value.
    }
    return { width: 460, height: 148 };
  });
  const resizeState = useRef(null);

  useLayoutEffect(() => {
    if (position) return;
    const node = panelRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setPosition(
      defaultPosition ?? {
        x: (window.innerWidth - rect.width) / 2,
        y: window.innerHeight - rect.height - 84,
      },
    );
  }, [position, defaultPosition]);

  useLayoutEffect(() => {
    const onMove = (event) => {
      if (!resizeState.current) return;
      const { startX, startY, width, height } = resizeState.current;
      setSize({
        width: Math.min(Math.max(220, width + event.clientX - startX), window.innerWidth - 16),
        height: Math.min(Math.max(92, height + event.clientY - startY), window.innerHeight - 16),
      });
    };
    const onUp = () => {
      if (!resizeState.current) return;
      resizeState.current = null;
      document.body.classList.remove("resizing-playback");
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  useLayoutEffect(() => {
    try {
      window.localStorage.setItem("floating-playback-size", JSON.stringify(size));
    } catch {
      // Storage can be unavailable in private/embedded contexts.
    }
  }, [size]);

  const startResize = (event) => {
    event.preventDefault();
    event.stopPropagation();
    resizeState.current = { startX: event.clientX, startY: event.clientY, ...size };
    document.body.classList.add("resizing-playback");
  };

  const clampToViewport = (point) => {
    const rect = panelRef.current.getBoundingClientRect();
    return {
      x: Math.min(Math.max(point.x, 8), window.innerWidth - rect.width - 8),
      y: Math.min(Math.max(point.y, 8), window.innerHeight - rect.height - 8),
    };
  };

  const handlePointerDown = (event) => {
    if (isPinned || event.target.closest("button")) return;
    const rect = panelRef.current.getBoundingClientRect();
    dragState.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragState.current) return;
    setPosition(
      clampToViewport({
        x: event.clientX - dragState.current.offsetX,
        y: event.clientY - dragState.current.offsetY,
      }),
    );
  };

  const handlePointerUp = (event) => {
    if (!dragState.current) return;
    dragState.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div
      ref={panelRef}
      className={`floating-panel ${collapsed ? "collapsed" : ""} ${isPinned ? "pinned" : ""} ${title === 'Playback Controls' ? 'has-size-control' : ''}`}
      style={{
        ...(position ? { top: position.y, left: position.x } : {}),
        width: size.width,
        height: collapsed ? undefined : size.height,
        '--playback-ui-scale': controlScale / 100,
      }}
    >
      <div
        className="floating-panel-handle"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <span className="floating-panel-grip" aria-hidden="true">
          :::
        </span>
        <span className="floating-panel-title">{title}</span>
        <button
          type="button"
          className="floating-panel-pin"
          onClick={() => setIsPinned(!isPinned)}
          title={isPinned ? "Unpin panel" : "Pin panel"}
          aria-label={isPinned ? "Unpin panel" : "Pin panel"}
        >
          {isPinned ? "📌" : "📍"}
        </button>
        <button
          type="button"
          className="floating-panel-collapse"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? "Expand panel" : "Collapse panel"}
        >
          {collapsed ? "▲" : "▼"}
        </button>
      </div>
      {!collapsed && <div className="floating-panel-body">{children}</div>}
      {!collapsed && title === 'Playback Controls' && (
        <PanelScaleControl
          value={controlScale}
          onChange={setControlScale}
          ariaLabel="Playback controls scale"
        />
      )}
      {!collapsed && (
        <div
          className="floating-panel-resizer"
          role="separator"
          aria-label="Resize playback controls"
          aria-orientation="both"
          onPointerDown={startResize}
        />
      )}
    </div>
  );
}
