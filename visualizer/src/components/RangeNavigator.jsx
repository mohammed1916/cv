
import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

import "./RangeNavigator.css";

const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, value));

export default function RangeNavigator({
    scrollElement,
    virtualizer,
    itemCount,
    columns,
    visibleIndex
}) {
    const railRef = useRef(null);
    const hideTimerRef = useRef(null);
    const draggingRef = useRef(false);
    const frameRef = useRef(null);
    const lastJumpRef = useRef(-1);

    const [active, setActive] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(null);
    const [position, setPosition] = useState({
        top: 0,
        ready: false
    });

    const total = Math.max(0, itemCount);
    const lastIndex = Math.max(0, total - 1);
    const currentIndex = clamp(visibleIndex ?? 0, 0, lastIndex);

    const displayIndex =
        previewIndex === null ? currentIndex : previewIndex;

    const progress =
        total <= 1 ? 0 : displayIndex / lastIndex;

    const show = useCallback(() => {
        setActive(true);

        clearTimeout(hideTimerRef.current);

        if (!draggingRef.current) {
            hideTimerRef.current = setTimeout(() => {
                setActive(false);
            }, 1700);
        }
    }, []);

    const updatePosition = useCallback(() => {
        if (!scrollElement) return;

        const grid = scrollElement.querySelector(
            ".cards-grid--virtual"
        );

        if (!grid) {
            setPosition({ top: 0, ready: false });
            return;
        }

        const gridRect = grid.getBoundingClientRect();
        const viewportRect = scrollElement.getBoundingClientRect();

        const visibleTop = Math.max(
            gridRect.top,
            viewportRect.top
        );

        const visibleBottom = Math.min(
            gridRect.bottom,
            viewportRect.bottom
        );

        const visibleHeight = Math.max(
            0,
            visibleBottom - visibleTop
        );

        // Do not show over the hero, catalogue heading,
        // search bar, or filter controls.
        const gridEntered =
            gridRect.top < viewportRect.bottom - 100 &&
            gridRect.bottom > viewportRect.top + 100;

        const enoughSpace = visibleHeight >= 220;

        const ready =
            gridEntered &&
            enoughSpace &&
            scrollElement.scrollTop > 100;

        const top = clamp(
            visibleTop + visibleHeight / 2,
            180,
            window.innerHeight - 180
        );

        setPosition(previous => {
            if (
                previous.ready === ready &&
                Math.abs(previous.top - top) < 1
            ) {
                return previous;
            }

            return { top, ready };
        });

        if (!ready && !draggingRef.current) {
            setActive(false);
        }
    }, [scrollElement]);

    useEffect(() => {
        if (!scrollElement) return undefined;

        const scheduleUpdate = () => {
            if (frameRef.current !== null) {
                cancelAnimationFrame(frameRef.current);
            }

            frameRef.current = requestAnimationFrame(() => {
                frameRef.current = null;
                updatePosition();
            });
        };

        const onScroll = () => {
            scheduleUpdate();

            const grid = scrollElement.querySelector(
                ".cards-grid--virtual"
            );

            if (!grid) return;

            const gridRect = grid.getBoundingClientRect();
            const viewportRect = scrollElement.getBoundingClientRect();

            if (
                gridRect.top < viewportRect.bottom - 100 &&
                gridRect.bottom > viewportRect.top + 220
            ) {
                show();
            }
        };

        scheduleUpdate();

        scrollElement.addEventListener("scroll", onScroll, {
            passive: true
        });

        window.addEventListener("resize", scheduleUpdate);

        const observer = new ResizeObserver(scheduleUpdate);

        observer.observe(scrollElement);

        const grid = scrollElement.querySelector(
            ".cards-grid--virtual"
        );

        if (grid) observer.observe(grid);

        return () => {
            scrollElement.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", scheduleUpdate);
            observer.disconnect();

            if (frameRef.current !== null) {
                cancelAnimationFrame(frameRef.current);
            }

            clearTimeout(hideTimerRef.current);
        };
    }, [scrollElement, show, updatePosition]);

    const indexFromPointer = useCallback(
        clientY => {
            const rail = railRef.current;

            if (!rail || total <= 1) return 0;

            const rect = rail.getBoundingClientRect();

            const ratio = clamp(
                (clientY - rect.top) / Math.max(1, rect.height),
                0,
                1
            );

            return Math.round(ratio * lastIndex);
        },
        [total, lastIndex]
    );

    const jumpToIndex = useCallback(
        index => {
            if (!virtualizer || total === 0) return;

            const safeIndex = clamp(index, 0, lastIndex);
            const rowIndex = Math.floor(
                safeIndex / Math.max(1, columns)
            );

            if (lastJumpRef.current === rowIndex) return;

            lastJumpRef.current = rowIndex;

            virtualizer.scrollToIndex(rowIndex, {
                align: "start",
                behavior: "auto"
            });
        },
        [virtualizer, total, lastIndex, columns]
    );

    const onPointerDown = event => {
        if (total <= 1) return;

        event.preventDefault();

        draggingRef.current = true;
        lastJumpRef.current = -1;

        setDragging(true);
        setActive(true);

        clearTimeout(hideTimerRef.current);

        event.currentTarget.setPointerCapture(event.pointerId);

        const next = indexFromPointer(event.clientY);
        setPreviewIndex(next);
        jumpToIndex(next);
    };

    const onPointerMove = event => {
        if (!draggingRef.current) return;

        const next = indexFromPointer(event.clientY);

        setPreviewIndex(next);
        jumpToIndex(next);
    };

    const finishDrag = event => {
        if (!draggingRef.current) return;

        const next = indexFromPointer(event.clientY);

        draggingRef.current = false;
        lastJumpRef.current = -1;

        setDragging(false);
        setPreviewIndex(null);

        jumpToIndex(next);
        show();
    };

    useEffect(() => {
        lastJumpRef.current = -1;
    }, [visibleIndex, columns, itemCount]);

    if (total <= 1) return null;

    const ticks = Array.from({ length: 41 }, (_, i) => i);

    return (
        <aside
            className={[
                "range-navigator",
                position.ready && active ? "is-visible" : "",
                dragging ? "is-dragging" : ""
            ].join(" ")}
            style={{ "--range-top": `${position.top}px` }}
            aria-label="Problem catalogue navigator"
            aria-hidden={!position.ready || !active}
            onPointerEnter={() => {
                if (position.ready) {
                    clearTimeout(hideTimerRef.current);
                    setActive(true);
                }
            }}
            onPointerLeave={() => {
                if (!draggingRef.current) show();
            }}
        >
            <div className="range-navigator-info">
                <span className="range-navigator-eyebrow">
                    CATALOGUE
                </span>

                <span className="range-navigator-number">
                    {(displayIndex + 1).toLocaleString()}
                </span>

                <span className="range-navigator-total">
                    / {total.toLocaleString()}
                </span>
            </div>

            <div
                className="range-navigator-rail"
                ref={railRef}
                role="slider"
                tabIndex={position.ready && active ? 0 : -1}
                aria-label="Catalogue position"
                aria-valuemin={1}
                aria-valuemax={total}
                aria-valuenow={displayIndex + 1}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={finishDrag}
                onPointerCancel={finishDrag}
                onKeyDown={event => {
                    let next = currentIndex;

                    switch (event.key) {
                        case "ArrowDown":
                            next += columns;
                            break;
                        case "ArrowUp":
                            next -= columns;
                            break;
                        case "PageDown":
                            next += columns * 5;
                            break;
                        case "PageUp":
                            next -= columns * 5;
                            break;
                        case "Home":
                            next = 0;
                            break;
                        case "End":
                            next = lastIndex;
                            break;
                        default:
                            return;
                    }

                    event.preventDefault();
                    lastJumpRef.current = -1;
                    jumpToIndex(next);
                    show();
                }}
            >
                <div className="range-navigator-track" />

                <div
                    className="range-navigator-progress"
                    style={{ height: `${progress * 100}%` }}
                />

                <div className="range-navigator-ticks">
                    {ticks.map(tick => (
                        <span
                            key={tick}
                            className={
                                tick % 5 === 0
                                    ? "range-navigator-tick major"
                                    : "range-navigator-tick"
                            }
                            style={{ top: `${tick * 2.5}%` }}
                        />
                    ))}
                </div>

                <div
                    className="range-navigator-indicator"
                    style={{ top: `${progress * 100}%` }}
                >
                    <span className="range-navigator-halo" />
                    <span className="range-navigator-dot" />
                    <span className="range-navigator-beam" />
                </div>
            </div>

            <div className="range-navigator-labels">
                <span>1</span>
                <span>{total.toLocaleString()}</span>
            </div>
        </aside>
    );
}
