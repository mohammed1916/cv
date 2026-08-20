import {
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import "./FloatingPanel.css";
import PanelScaleControl from "./PanelScaleControl";

export default function FloatingPanel({
  title = "Panel",
  children,
  defaultPosition = null,
}) {
  const panelRef = useRef(null);
  const dragState = useRef(null);
  const resizeState = useRef(null);

  const [position, setPosition] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [controlScale, setControlScale] = useState(100);

  const [size, setSize] = useState(() => {
    try {
      const stored = JSON.parse(
        window.localStorage.getItem("floating-playback-size"),
      );

      if (
        stored?.width >= 220 &&
        stored?.height >= 92
      ) {
        return stored;
      }
    } catch {
      // Ignore invalid persisted values.
    }

    return {
      width: 460,
      height: 148,
    };
  });

  useLayoutEffect(() => {
    if (position) {
      return;
    }

    const node = panelRef.current;

    if (!node) {
      return;
    }

    const rect = node.getBoundingClientRect();

    setPosition(
      defaultPosition ?? {
        x: Math.max(
          8,
          (window.innerWidth - rect.width) / 2,
        ),
        y: Math.max(
          8,
          window.innerHeight - rect.height - 84,
        ),
      },
    );
  }, [position, defaultPosition]);

  useLayoutEffect(() => {
    try {
      window.localStorage.setItem(
        "floating-playback-size",
        JSON.stringify(size),
      );
    } catch {
      // Storage can be unavailable.
    }
  }, [size]);

  const clampToViewport = (point) => {
    const node = panelRef.current;

    if (!node) {
      return point;
    }

    const rect = node.getBoundingClientRect();

    return {
      x: Math.min(
        Math.max(point.x, 8),
        Math.max(8, window.innerWidth - rect.width - 8),
      ),
      y: Math.min(
        Math.max(point.y, 8),
        Math.max(8, window.innerHeight - rect.height - 8),
      ),
    };
  };

  const handlePointerDown = (event) => {
    if (
      isPinned ||
      event.target.closest("button") ||
      event.target.closest(".floating-panel-resizer")
    ) {
      return;
    }

    const node = panelRef.current;

    if (!node) {
      return;
    }

    const rect = node.getBoundingClientRect();

    dragState.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );
  };

  const handlePointerMove = (event) => {
    if (!dragState.current) {
      return;
    }

    setPosition(
      clampToViewport({
        x:
          event.clientX -
          dragState.current.offsetX,
        y:
          event.clientY -
          dragState.current.offsetY,
      }),
    );
  };

  const handlePointerUp = (event) => {
    if (!dragState.current) {
      return;
    }

    dragState.current = null;

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId,
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId,
      );
    }
  };

  const startResize = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const node = panelRef.current;

    if (!node) {
      return;
    }

    const rect = node.getBoundingClientRect();

    resizeState.current = {
      pointerId: event.pointerId,

      startX: event.clientX,
      startY: event.clientY,

      startWidth: rect.width,
      startHeight: rect.height,

      panelLeft: rect.left,
      panelTop: rect.top,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );

    document.body.classList.add(
      "resizing-playback",
    );
  };

  const handleResizeMove = (event) => {
    if (!resizeState.current) {
      return;
    }

    const {
      startX,
      startY,
      startWidth,
      startHeight,
      panelLeft,
      panelTop,
    } = resizeState.current;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    const maxWidth = Math.max(
      220,
      window.innerWidth - panelLeft - 8,
    );

    const maxHeight = Math.max(
      92,
      window.innerHeight - panelTop - 8,
    );

    const nextWidth = Math.min(
      Math.max(
        220,
        startWidth + deltaX,
      ),
      maxWidth,
    );

    const nextHeight = Math.min(
      Math.max(
        92,
        startHeight + deltaY,
      ),
      maxHeight,
    );

    setSize({
      width: nextWidth,
      height: nextHeight,
    });
  };

  const stopResize = (event) => {
    if (!resizeState.current) {
      return;
    }

    resizeState.current = null;

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId,
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId,
      );
    }

    document.body.classList.remove(
      "resizing-playback",
    );
  };

  const isPlaybackPanel =
    title === "Playback Controls";

  return (
    <div
      ref={panelRef}
      className={[
        "floating-panel",
        collapsed ? "collapsed" : "",
        isPinned ? "pinned" : "",
        isPlaybackPanel
          ? "has-size-control"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...(position
          ? {
            top: position.y,
            left: position.x,
          }
          : {}),

        width: size.width,

        height: collapsed
          ? undefined
          : size.height,

        "--playback-ui-scale":
          controlScale / 100,
      }}
    >
      <div
        className="floating-panel-handle"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <span
          className="floating-panel-grip"
          aria-hidden="true"
        >
          :::
        </span>

        <span className="floating-panel-title">
          {title}
        </span>

        <button
          type="button"
          className="floating-panel-pin"
          onClick={() =>
            setIsPinned((current) => !current)
          }
          title={
            isPinned
              ? "Unpin panel"
              : "Pin panel"
          }
          aria-label={
            isPinned
              ? "Unpin panel"
              : "Pin panel"
          }
        >
          {isPinned ? "📌" : "📍"}
        </button>

        <button
          type="button"
          className="floating-panel-collapse"
          onClick={() =>
            setCollapsed(
              (current) => !current,
            )
          }
          aria-label={
            collapsed
              ? "Expand panel"
              : "Collapse panel"
          }
        >
          {collapsed ? "▲" : "▼"}
        </button>
      </div>

      {!collapsed && (
        <div className="floating-panel-body">
          {children}
        </div>
      )}

      {!collapsed &&
        isPlaybackPanel && (
          <div className="floating-panel-scale-area">
            <PanelScaleControl
              value={controlScale}
              onChange={setControlScale}
              ariaLabel="Playback controls scale"
            />
          </div>
        )}

      {!collapsed && (
        <div
          className="floating-panel-resizer"
          role="separator"
          aria-label="Resize panel"
          aria-orientation="both"
          onPointerDown={startResize}
          onPointerMove={handleResizeMove}
          onPointerUp={stopResize}
          onPointerCancel={stopResize}
        />
      )}
    </div>
  );
}