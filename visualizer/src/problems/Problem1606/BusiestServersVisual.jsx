
import { useEffect, useId, useRef, useState } from 'react';
import HeapView from '../../components/shared/HeapView';
import './BusiestServersVisual.css';

const NODES = ['request', 'free', 'busy', 'servers', 'timeline', 'result'];

function useGeometry(ref, step) {
    const [geometry, setGeometry] = useState({ positions: {}, width: 0, height: 0 });

    useEffect(() => {
        const root = ref.current;
        if (!root) return;
        let observer;

        function measure() {
            const outer = root.getBoundingClientRect();
            const positions = {};
            for (const id of NODES) {
                const element = root.querySelector(`[data-flow-node="${id}"]`);
                if (!element) continue;
                const r = element.getBoundingClientRect();
                positions[id] = {
                    x: r.left - outer.left,
                    y: r.top - outer.top,
                    width: r.width,
                    height: r.height,
                };
            }
            setGeometry({
                positions,
                width: root.clientWidth,
                height: root.clientHeight,
            });
        }

        measure();
        if (typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(measure);
            observer.observe(root);
            for (const id of NODES) {
                const element = root.querySelector(`[data-flow-node="${id}"]`);
                if (element) observer.observe(element);
            }
        }
        window.addEventListener('resize', measure);
        return () => {
            observer?.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [ref, step.approach]);

    return geometry;
}

function anchor(rect, side) {
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    if (side === 'left') return { x: rect.x, y: cy };
    if (side === 'right') return { x: rect.x + rect.width, y: cy };
    if (side === 'top') return { x: cx, y: rect.y };
    return { x: cx, y: rect.y + rect.height };
}

function route(a, b) {
    const ac = { x: a.x + a.width / 2, y: a.y + a.height / 2 };
    const bc = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    const dx = bc.x - ac.x;
    const dy = bc.y - ac.y;

    // Choose the nearest appropriate edge, not panel centers.
    const horizontal = Math.abs(dx) > Math.abs(dy) * 1.3;
    const sideA = horizontal ? (dx >= 0 ? 'right' : 'left') : (dy >= 0 ? 'bottom' : 'top');
    const sideB = horizontal ? (dx >= 0 ? 'left' : 'right') : (dy >= 0 ? 'top' : 'bottom');
    const p = anchor(a, sideA);
    const q = anchor(b, sideB);

    const distance = horizontal ? Math.abs(q.x - p.x) : Math.abs(q.y - p.y);
    const bend = Math.max(12, Math.min(75, distance * .45));

    const sign = horizontal
        ? (dx >= 0 ? 1 : -1)
        : (dy >= 0 ? 1 : -1);

    const c1 = horizontal
        ? { x: p.x + sign * bend, y: p.y }
        : { x: p.x, y: p.y + sign * bend };
    const c2 = horizontal
        ? { x: q.x - sign * bend, y: q.y }
        : { x: q.x, y: q.y - sign * bend };

    const path = `M${p.x} ${p.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${q.x} ${q.y}`;

    const point = t => {
        const u = 1 - t;
        return {
            x: u * u * u * p.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * q.x,
            y: u * u * u * p.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * q.y,
        };
    };

    return { path, point };
}

function FlowOverlay({ geometry, transfer, phase }) {
    const markerId = useId().replace(/:/g, '');
    const { positions, width, height } = geometry;
    if (!transfer || !width || !height) return null;

    const a = positions[transfer.from];
    const b = positions[transfer.to];
    if (!a || !b) return null;

    // A self-transfer is a visible curved feedback loop.
    let path, point;
    if (transfer.from === transfer.to) {
        const x = a.x + a.width * .7;
        const y = a.y;
        path = `M${x - 42} ${y} C${x - 42} ${y - 42} ${x + 42} ${y - 42} ${x + 42} ${y}`;
        point = t => ({
            x: x - 42 + 84 * t,
            y: y - 28 * Math.sin(Math.PI * t),
        });
    } else {
        ({ path, point } = route(a, b));
    }

    const center = point(.5);
    const label = String(transfer.value ?? '');
    const short = label.length > 28 ? `${label.slice(0, 27)}…` : label;
    const labelWidth = Math.max(68, Math.min(225, short.length * 6.7 + 18));

    return (
        <svg className="bs-overlay" width={width} height={height}
            viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
            <defs>
                <marker id={markerId} viewBox="0 0 10 10"
                    refX="9" refY="5" markerWidth="6" markerHeight="6"
                    orient="auto">
                    <path d="M0 0L10 5L0 10Z" fill="#0d9488" />
                </marker>
            </defs>
            <path d={path} className="bs-active-arrow"
                markerEnd={`url(#${markerId})`} />
            <rect x={center.x - labelWidth / 2} y={center.y - 25}
                width={labelWidth} height="21" rx="7"
                className="bs-arrow-label-bg" />
            <text x={center.x} y={center.y - 11}
                textAnchor="middle" className="bs-arrow-label">{short}</text>
            <circle key={`${phase}-${transfer.from}-${transfer.to}-${label}`}
                r="5" className="bs-moving-token">
                <animateMotion dur="1.4s" repeatCount="indefinite" path={path} />
            </circle>
        </svg>
    );
}

function Panel({ id, title, subtitle, active, children }) {
    return (
        <section data-flow-node={id}
            className={`bs-panel ${active ? 'is-active' : ''}`}>
            <header className="bs-panel-header">
                <strong>{title}</strong>
                <span>{subtitle}</span>
            </header>
            {children}
        </section>
    );
}

function Requests({ input, step }) {
    return (
        <div className="bs-requests">
            {input.arrival.map((t, i) => (
                <div key={i}
                    className={`bs-request ${i === step.request ? 'is-current' : ''} ${i < step.request ? 'is-complete' : ''}`}>
                    <strong>R{i}</strong>
                    <span>t = {t}</span>
                    <span>load = {input.load[i]}</span>
                    <small>prefers S{i % input.k}</small>
                </div>
            ))}
        </div>
    );
}

function LoopIndicator({ step }) {
    const loop = step.loop;
    if (!loop) return null;

    const labels = {
        requests: 'FOR each request',
        release: 'WHILE earliest finish ≤ arrival',
        'bisect-select': 'WHILE left < right',
        'bisect-insert': 'WHILE left < right (insert)',
    };

    return (
        <div className={`bs-loop ${loop.branch === 'repeat' ? 'is-repeat' : 'is-exit'}`}>
            <div className="bs-loop-icon">↶</div>
            <div>
                <strong>{labels[loop.id] ?? loop.id}</strong>
                <span>
                    Iteration {loop.iteration + 1} · Condition{' '}
                    <b>{String(loop.condition)}</b> ·{' '}
                    {loop.branch === 'repeat' ? 'Loop back / execute body' : 'Exit loop'}
                </span>
            </div>
            <div className="bs-loop-branch">
                {loop.branch === 'repeat' ? '↻ REPEAT' : '→ EXIT'}
            </div>
        </div>
    );
}

function BisectPanel({ step }) {
    const s = step.search;
    const free = step.free;
    const active = !!s;
    const mid = s?.mid ?? -1;
    const left = s?.left ?? 0;
    const right = s?.right ?? free.length;
    const selected = s?.position;

    return (
        <div className="bs-bisect">
            <div className="bs-bisect-formula">
                <code>bisect_left(free, target)</code>
                <span>target = {active ? s.target : '—'}</span>
            </div>

            <div className="bs-bisect-array">
                {free.length === 0 && <span className="bs-muted">Empty free list</span>}
                {free.map((value, i) => {
                    const inRange = !active || (i >= left && i < right);
                    const isMid = i === mid;
                    const isSelected = i === selected;
                    return (
                        <div key={value}
                            className={[
                                'bs-bisect-cell',
                                inRange ? 'in-range' : 'is-eliminated',
                                isMid ? 'is-mid' : '',
                                isSelected ? 'is-selected' : '',
                            ].join(' ')}>
                            <small>[{i}]</small>
                            <strong>{value}</strong>
                            <span>{isMid ? 'MID' : isSelected ? 'PICK' : ' '}</span>
                        </div>
                    );
                })}
            </div>

            {active && (
                <>
                    <div className="bs-search-range">
                        <span>left = {left}</span>
                        <span>mid = {mid >= 0 ? mid : '—'}</span>
                        <span>right = {right}</span>
                    </div>
                    {mid >= 0 && (
                        <div className="bs-bisect-comparison">
                            <strong>free[{mid}] = {s.value ?? free[mid]}</strong>
                            <span>Target = {s.target}</span>
                            <span>
                                Next bounds: [{s.nextLeft ?? left}, {s.nextRight ?? right})
                            </span>
                        </div>
                    )}
                    {s.wrapped && (
                        <div className="bs-wrap">↶ No server ≥ target. Wrap to index 0.</div>
                    )}
                </>
            )}
        </div>
    );
}

function VirtualPanel({ step, k }) {
    return (
        <div className="bs-virtual">
            <div className="bs-formula">
                <code>key = i + (server - i) mod k</code>
                <span>
                    {step.key === null
                        ? 'The heap root is the earliest circular turn.'
                        : `Key ${step.key} → server ${step.key % k}`}
                </span>
            </div>
            <HeapView
                title="Free virtual-key min-heap"
                items={step.freeHeap?.items ?? []}
                ops={step.freeHeap?.ops ?? []}
                order="min"
            />
        </div>
    );
}

function BusyPanel({ step }) {
    return (
        <div className="bs-busy">
            <div className="bs-formula">
                <code>(finish time, server ID)</code>
                <span>Release while earliest finish ≤ current arrival.</span>
            </div>
            <HeapView
                title="Busy finish-time min-heap"
                items={step.busyHeap?.items ?? []}
                ops={step.busyHeap?.ops ?? []}
                order="min"
            />
        </div>
    );
}

function Servers({ input, step }) {
    const busy = new Map(step.busy.map(j => [j.server, j.end]));
    return (
        <div className="bs-server-list">
            {Array.from({ length: input.k }, (_, s) => {
                const end = busy.get(s);
                const isBusy = end !== undefined && end > step.clock;
                const active = step.server === s || step.released === s;
                return (
                    <div key={s}
                        className={`bs-server ${active ? 'is-selected' : ''} ${isBusy ? 'is-busy' : ''}`}>
                        <div className="bs-server-name">S{s}</div>
                        <div className="bs-server-info">
                            <strong>Server {s}</strong>
                            <small>{isBusy ? `Busy until ${end}` : 'Available'}</small>
                        </div>
                        <div className="bs-server-count">
                            <strong>{step.handled[s]}</strong>
                            <small>handled</small>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function Timeline({ input, step }) {
    const start = Math.min(...input.arrival);
    const end = Math.max(...input.arrival.map((t, i) => t + input.load[i]));
    const span = Math.max(1, end - start);
    const width = 760;
    const left = 66;
    const plot = width - left - 25;
    const row = 43;
    const height = input.k * row + 40;
    const x = t => left + (t - start) / span * plot;
    const activeJob = step.timelineJob;

    return (
        <div className="bs-timeline-scroll">
            <svg viewBox={`0 0 ${width} ${height}`}
                width={width} height={height}
                role="img" aria-label="Request execution intervals by server">
                {Array.from({ length: input.k }, (_, s) => (
                    <g key={s}>
                        <text x="8" y={s * row + 27} className="bs-svg-label">S{s}</text>
                        <line x1={left} x2={left + plot}
                            y1={s * row + 22} y2={s * row + 22}
                            className="bs-timeline-grid" />
                    </g>
                ))}
                {step.jobs.map(job => {
                    const isActive = job.request === activeJob;
                    const w = Math.max(3, x(job.end) - x(job.start));
                    return (
                        <g key={job.request}>
                            <rect
                                x={x(job.start)} y={job.server * row + 8}
                                width={w} height="28" rx="5"
                                className={`bs-job ${isActive ? 'is-new' : ''}`}
                            />
                            {w > 22 && (
                                <text x={x(job.start) + w / 2}
                                    y={job.server * row + 26}
                                    textAnchor="middle"
                                    className="bs-job-label">R{job.request}</text>
                            )}
                            {isActive && (
                                <rect x={x(job.start)} y={job.server * row + 6}
                                    width={w} height="32" rx="6"
                                    className="bs-job-outline" />
                            )}
                        </g>
                    );
                })}
                {step.request >= 0 && (
                    <g>
                        <line x1={x(step.clock)} x2={x(step.clock)}
                            y1="0" y2={input.k * row + 3}
                            className="bs-clock-line" />
                        <text x={x(step.clock)}
                            y={height - 7} textAnchor="middle"
                            className="bs-svg-label">t={step.clock}</text>
                    </g>
                )}
            </svg>
        </div>
    );
}

function Results({ step }) {
    const max = Math.max(1, ...step.handled);
    const show = step.best !== null;
    return (
        <div className="bs-results">
            <div className="bs-count-bars">
                {step.handled.map((count, s) => (
                    <div key={s}
                        className={`bs-count-column ${step.server === s ? 'is-selected' : ''}`}>
                        <strong>{count}</strong>
                        <div className="bs-count-track">
                            <div className={`bs-count-fill ${show && count === step.best ? 'is-winner' : ''}`}
                                style={{ height: `${count / max * 100}%` }} />
                        </div>
                        <span>S{s}</span>
                    </div>
                ))}
            </div>
            {show && (
                <div className="bs-answer">
                    <span>Maximum frequency: {step.best}</span>
                    <strong>
                        Multimode: [
                        {step.handled.map((v, s) => v === step.best ? s : null)
                            .filter(v => v !== null).join(', ')}
                        ]
                    </strong>
                </div>
            )}
        </div>
    );
}

export default function BusiestServersVisual({ input, step }) {
    const ref = useRef(null);
    const geometry = useGeometry(ref, step);
    const transfer = step.transfer;
    const active = id => transfer?.from === id || transfer?.to === id;

    return (
        <div className="bs-visual">
            <div className="bs-heading">
                <div>
                    <strong>Server scheduling simulator</strong>
                    <span>{step.approach === 'virtual'
                        ? 'Two min-heaps'
                        : 'Sorted free list + busy min-heap'}</span>
                </div>
                <div className="bs-time">Current time <b>{step.clock}</b></div>
            </div>

            <LoopIndicator step={step} />

            <div className="bs-flow-canvas" ref={ref}>
                <div className="bs-flow-grid">
                    <Panel id="request" title="1 · Incoming requests"
                        subtitle="Outer loop · arrival · duration · preferred server"
                        active={active('request')}>
                        <Requests input={input} step={step} />
                    </Panel>

                    <Panel id="free" title="2 · Free servers"
                        subtitle={step.approach === 'virtual'
                            ? 'Virtual-key min-heap'
                            : 'Binary search with shrinking bounds'}
                        active={active('free')}>
                        {step.approach === 'virtual'
                            ? <VirtualPanel step={step} k={input.k} />
                            : <BisectPanel step={step} />}
                    </Panel>

                    <Panel id="busy" title="3 · Busy servers"
                        subtitle="Finish-time min-heap · release loop"
                        active={active('busy')}>
                        <BusyPanel step={step} />
                    </Panel>

                    <Panel id="servers" title="4 · Server pool"
                        subtitle="Selected server · availability · counts"
                        active={active('servers')}>
                        <Servers input={input} step={step} />
                    </Panel>

                    <Panel id="timeline" title="5 · Execution timeline"
                        subtitle="Request start → finish; selected row highlighted"
                        active={active('timeline')}>
                        <Timeline input={input} step={step} />
                    </Panel>

                    <Panel id="result" title="6 · Frequencies and multimode"
                        subtitle="All servers tied for maximum"
                        active={active('result')}>
                        <Results step={step} />
                    </Panel>
                </div>

                <FlowOverlay geometry={geometry}
                    transfer={transfer} phase={step.phase} />
            </div>

            <div className="bs-explanation">
                <strong>{step.phase.replaceAll('-', ' ')}</strong>
                <p>{step.message}</p>
            </div>
        </div>
    );
}
