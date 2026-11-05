import { useLayoutEffect, useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { accessLabel } from "../access/policy";
import "./VirtualCardGrid.css";

// Mirrors `.cards-grid` (minmax(290px, 1fr), 1.25rem gap) so the number of
// columns matches what the CSS grid would have produced.
const CARD_MIN = 290;
const GAP = 20;
const ESTIMATED_ROW = 300;

// Renders only the rows on screen. Search and filters still work on the full
// list because the caller passes every matching problem in `items`.
export default function VirtualCardGrid({ items, pro, onSelect }) {
  const gridRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(el.clientWidth);
      setScrollMargin(el.getBoundingClientRect().top + window.scrollY);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const columns = Math.max(1, Math.floor((width + GAP) / (CARD_MIN + GAP)));
  const rowCount = Math.ceil(items.length / columns);
  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => ESTIMATED_ROW + GAP,
    overscan: 4,
    scrollMargin,
  });

  return (
    <main
      className="cards-grid cards-grid--virtual"
      ref={gridRef}
      style={{ height: virtualizer.getTotalSize() }}
    >
      {virtualizer.getVirtualItems().map((row) => {
        const start = row.index * columns;
        return (
          <div
            key={row.key}
            data-index={row.index}
            ref={virtualizer.measureElement}
            className="cards-row"
            style={{
              transform: `translateY(${row.start - scrollMargin}px)`,
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {items.slice(start, start + columns).map((p) => (
              <button
                key={p.id}
                className="problem-card"
                style={{ "--accent": p.accent }}
                onClick={() => onSelect(p)}
              >
                <div className="card-top">
                  <span className={`badge difficulty-${p.difficulty.toLowerCase()}`}>
                    {p.difficulty}
                  </span>
                  <span className="card-access-label">{accessLabel(p, pro)}</span>
                  <span className="card-num">#{p.number}</span>
                </div>
                <h2 className="card-title">{p.title}</h2>
                <p className="card-desc">{p.description}</p>
                <div className="card-footer">
                  <div className="card-tags">
                    {p.tags.map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </div>
                  {p.implemented ? (
                    <span className="card-arrow">→</span>
                  ) : (
                    <span className="card-access-label">Not implemented yet</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        );
      })}
    </main>
  );
}
