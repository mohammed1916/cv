
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { accessLabel } from "../access/policy";

import RangeNavigator from "./RangeNavigator";

import "./VirtualCardGrid.css";

const CARD_MIN = 290;
const GAP = 20;
const ESTIMATED_ROW = 300;

export default function VirtualCardGrid({
  items,
  pro,
  onSelect
}) {
  const gridRef = useRef(null);

  const [width, setWidth] = useState(0);
  const [scrollMargin, setScrollMargin] = useState(0);
  const [scroller, setScroller] = useState(null);

  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return undefined;

    const container =
      el.closest(".home-page") || el.parentElement;

    setScroller(container);

    const measure = () => {
      setWidth(el.clientWidth);

      setScrollMargin(
        el.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop
      );
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

  const columns = Math.max(
    1,
    Math.floor((width + GAP) / (CARD_MIN + GAP))
  );

  const rowCount = Math.ceil(items.length / columns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scroller,
    estimateSize: () => ESTIMATED_ROW + GAP,
    overscan: 4,
    scrollMargin
  });

  useEffect(() => {
    virtualizer.measure();
  }, [columns, virtualizer]);

  const virtualRows = virtualizer.getVirtualItems();


  const visibleIndex = useMemo(() => {
    if (!virtualRows.length || !items.length) return 0;

    const viewportTop =
      (virtualizer.scrollOffset ?? 0) - scrollMargin;

    const firstVisible =
      virtualRows.find(row => row.end > viewportTop) ??
      virtualRows[0];

    return Math.min(
      items.length - 1,
      firstVisible.index * columns
    );
  }, [
    virtualRows,
    virtualizer.scrollOffset,
    scrollMargin,
    columns,
    items.length
  ]);


  return (
    <>
      <main
        className="cards-grid cards-grid--virtual"
        ref={gridRef}
        style={{
          height: virtualizer.getTotalSize()
        }}
      >
        {virtualRows.map(row => {
          const start = row.index * columns;

          return (
            <div
              key={row.key}
              data-index={row.index}
              ref={virtualizer.measureElement}
              className="cards-row"
              style={{
                transform: `translateY(${row.start - scrollMargin
                  }px)`,
                gridTemplateColumns:
                  `repeat(${columns}, minmax(0, 1fr))`
              }}
            >
              {items
                .slice(start, start + columns)
                .map((p, index) => (
                  <button
                    key={`${p.id}-${start + index}`}
                    className="problem-card"
                    style={{
                      "--accent": p.accent
                    }}
                    onClick={() => onSelect(p)}
                  >
                    <div className="card-top">
                      <span
                        className={`badge difficulty-${p.difficulty.toLowerCase()}`}
                      >
                        {p.difficulty}
                      </span>

                      <span className="card-access-label">
                        {accessLabel(p, pro)}
                      </span>

                      <span className="card-num">
                        #{p.number}
                      </span>
                    </div>

                    <h2 className="card-title">
                      {p.title}
                    </h2>

                    <p className="card-desc">
                      {p.description}
                    </p>

                    <div className="card-footer">
                      <div className="card-tags">
                        {p.tags.map((tag, tagIndex) => (
                          <span
                            key={`${tag}-${tagIndex}`}
                            className="tag"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {p.implemented ? (
                        <span className="card-arrow">
                          →
                        </span>
                      ) : (
                        <span className="card-access-label">
                          Not implemented yet
                        </span>
                      )}
                    </div>
                  </button>
                ))}
            </div>
          );
        })}
      </main>

      <RangeNavigator
        scrollElement={scroller}
        virtualizer={virtualizer}
        itemCount={items.length}
        columns={columns}
        visibleIndex={Math.max(0, visibleIndex)}
      />
    </>
  );
}
