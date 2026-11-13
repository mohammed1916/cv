
import { useEffect, useId, useRef, useState } from 'react';
import IndexedSequence from '../../components/shared/IndexedSequence';
import './CountNonDecreasingVisual.css';

const NODE_IDS = ['array', 'window', 'operations', 'deque', 'budget', 'matrix'];

function useConnections(rootRef, approach) {
    const [geometry, setGeometry] = useState({ nodes: {}, width: 0, height: 0 });

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        let observer;

        const measure = () => {
            const outer = root.getBoundingClientRect();
            const nodes = {};

            for (const id of NODE_IDS) {
                const element = root.querySelector(`[data-cs-node="${id}"]`);
                if (!element) continue;

                const r = element.getBoundingClientRect();
                nodes[id] = {
                    x: r.left - outer.left,
                    y: r.top - outer.top,
                    w: r.width,
                    h: r.height,
                };
            }

            setGeometry({
                nodes,
                width: root.clientWidth,
                height: root.clientHeight,
            });
        };

        measure();

        if (typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(measure);
            observer.observe(root);

            for (const id of NODE_IDS) {
                const el = root.querySelector(`[data-cs-node="${id}"]`);
                if (el) observer.observe(el);
            }
        }

        window.addEventListener('resize', measure);

        return () => {
            observer?.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [rootRef, approach]);

    return geometry;
}

function connect(a, b) {
    const ax = a.x + a.w / 2;
    const ay = a.y + a.h / 2;
    const bx = b.x + b.w / 2;
    const by = b.y + b.h / 2;
    const dx = bx - ax;
    const dy = by - ay;

    let p, q, c1, c2;

    if (Math.abs(dx) > Math.abs(dy) * 1.4) {
        const dir = Math.sign(dx) || 1;
        p = { x: ax + dir * a.w / 2, y: ay };
        q = { x: bx - dir * b.w / 2, y: by };
        const bend = Math.max(10, Math.min(75, Math.abs(q.x - p.x) * 0.4));
        c1 = { x: p.x + dir * bend, y: p.y };
        c2 = { x: q.x - dir * bend, y: q.y };
    } else {
        const dir = Math.sign(dy) || 1;
        p = { x: ax, y: ay + dir * a.h / 2 };
        q = { x: bx, y: by - dir * b.h / 2 };
        const bend = Math.max(10, Math.min(75, Math.abs(q.y - p.y) * 0.4));
        c1 = { x: p.x, y: p.y + dir * bend };
        c2 = { x: q.x, y: q.y - dir * bend };
    }

    return {
        d: `M ${p.x} ${p.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${q.x} ${q.y}`,
        center: {
            x: (p.x + 3 * c1.x + 3 * c2.x + q.x) / 8,
            y: (p.y + 3 * c1.y + 3 * c2.y + q.y) / 8,
        },
    };
}

function Connections({ geometry, transfer, phase }) {
    const markerId = useId().replace(/:/g, '');
    const { nodes, width, height } = geometry;
    if (!transfer || !width || !height) return null;

    const a = nodes[transfer.from];
    const b = nodes[transfer.to];
    if (!a || !b) return null;

    const { d, center } = connect(a, b);
    const value = String(transfer.value ?? '');
    const short = value.length > 30 ? `${value.slice(0, 29)}…` : value;
    const labelWidth = Math.max(62, Math.min(220, short.length * 6.7 + 16));

    return (
        <svg className="cs-connections" viewBox={`0 0 ${width} ${height}`}
            width={width} height={height} aria-hidden="true">
            <defs>
                <marker id={markerId} viewBox="0 0 10 10"
                    refX="9" refY="5" markerWidth="6" markerHeight="6"
                    orient="auto">
                    <path d="M0 0L10 5L0 10Z" fill="#0d9488" />
                </marker>
            </defs>
            <path d={d} className="cs-connection-line"
                markerEnd={`url(#${markerId})`} />
            <rect x={center.x - labelWidth / 2} y={center.y - 25}
                width={labelWidth} height="21" rx="7"
                className="cs-connection-label-bg" />
            <text x={center.x} y={center.y - 11}
                textAnchor="middle" className="cs-connection-label">
                {short}
            </text>
            <circle key={`${phase}-${value}`} r="5" className="cs-flow-dot">
                <animateMotion dur="1.5s" repeatCount="indefinite" path={d} />
            </circle>
        </svg>
    );
}

function Panel({ id, title, detail, active, children }) {
    return (
        <section data-cs-node={id}
            className={`cs-panel ${active ? 'is-active' : ''}`}>
            <header className="cs-panel-header">
                <strong>{title}</strong>
                {detail && <span>{detail}</span>}
            </header>
            {children}
        </section>
    );
}

function LoopStatus({ step }) {
    const loop = step.loop;
    if (!loop) return null;

    const names = {
        left: 'Outer loop · l',
        right: 'Subarray loop · r',
        scan: 'Increment scan · i',
        'left-reverse': 'Reverse sliding window · left',
        merge: 'Monotonic deque merge',
        shrink: 'Budget contraction',
    };

    return (
        <div className={`cs-loop ${loop.condition ? 'is-repeat' : 'is-exit'}`}>
            <div className="cs-loop-symbol">{loop.condition ? '↶' : '↳'}</div>
            <div className="cs-loop-description">
                <strong>{names[loop.id] ?? loop.id}</strong>
                <span>
                    Iteration {loop.iteration + 1} · Condition: {String(loop.condition)}
                </span>
            </div>
            <span className="cs-loop-decision">
                {loop.condition ? '↻ REPEAT' : '→ EXIT'}
            </span>
        </div>
    );
}

function WindowPanel({ nums, step }) {
    const start = step.l;
    const end = step.r;
    const valid = start >= 0 && end >= start;

    return (
        <div className="cs-window">
            <IndexedSequence
                label="nums"
                length={nums.length}
                valueAt={i => nums[i]}
                roleAt={i => {
                    if (!valid) return '';
                    if (i === step.i) return 'active';
                    if (i === start) return 'l';
                    if (i === end) return 'r';
                    if (i > start && i < end) return 'window';
                    return '';
                }}
            />
            <div className="cs-window-labels">
                <span>left: {start >= 0 ? start : '—'}</span>
                <span>right: {end >= start ? end : '—'}</span>
                <span>scan: {step.i >= 0 ? step.i : '—'}</span>
            </div>
            {valid && (
                <div className="cs-window-selection">
                    {nums.map((v, i) => (
                        <div key={i}
                            className={[
                                'cs-window-value',
                                i >= start && i <= end ? 'is-in' : 'is-out',
                                i === step.i ? 'is-scanning' : '',
                            ].join(' ')}>
                            <small>[{i}]</small>
                            <strong>{v}</strong>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function IncrementPanel({ nums, step }) {
    const start = step.l;
    const end = step.r;
    const valid = start >= 0 && end >= start;
    const values = valid ? nums.slice(start, end + 1) : [];
    const raised = step.raised ?? [];
    const max = Math.max(1, ...nums);

    return (
        <div className="cs-increments">
            <div className="cs-bars">
                {values.map((value, j) => {
                    const target = raised[j] ?? value;
                    const increase = Math.max(0, target - value);
                    const current = start + j === step.i;

                    return (
                        <div className={`cs-bar-column ${current ? 'is-current' : ''}`}
                            key={start + j}>
                            <div className="cs-bar-values">
                                <strong>{target}</strong>
                                {increase > 0 && <small>+{increase}</small>}
                            </div>
                            <div className="cs-bar-track">
                                <div className="cs-bar-original"
                                    style={{ height: `${value / max * 100}%` }} />
                                {increase > 0 && (
                                    <div className="cs-bar-added"
                                        style={{
                                            height: `${increase / max * 100}%`,
                                            bottom: `${value / max * 100}%`,
                                        }}
                                    />
                                )}
                            </div>
                            <span>[{start + j}]</span>
                        </div>
                    );
                })}
                {!valid && <p className="cs-muted">Select a window to see its increments.</p>}
            </div>
            <div className="cs-increment-summary">
                <span>Running maximum: {step.high ?? '—'}</span>
                <strong>Current change: {step.delta >= 0 ? '+' : ''}{step.delta}</strong>
            </div>
        </div>
    );
}

function DequePanel({ step, nums }) {
    const blocks = step.blocks ?? [];

    return (
        <div className="cs-deque-content">
            <div className="cs-deque-queue">
                {step.deque.length ? step.deque.map((index, i) => (
                    <div className="cs-deque-cell" key={index}>
                        <small>{i === 0 ? 'front' : i === step.deque.length - 1 ? 'back' : 'index'}</small>
                        <strong>[{index}]</strong>
                        <span>height {nums[index]}</span>
                    </div>
                )) : <span className="cs-muted">Deque is empty</span>}
            </div>
            <div className="cs-blocks">
                {blocks.map(block => (
                    <div className="cs-block" key={block.start}>
                        <strong>[{block.start}..{block.end}]</strong>
                        <span>raised to {block.height}</span>
                    </div>
                ))}
            </div>
            <p className="cs-muted">
                Front blocks are merged when a new left value is taller.
                The back block loses values when the right boundary shrinks.
            </p>
        </div>
    );
}

function BudgetPanel({ step, k }) {
    const cost = step.cost;
    const exceeded = cost !== null && cost > k;
    const ratio = cost === null ? 0 : Math.min(100, cost / Math.max(1, k) * 100);

    return (
        <div className="cs-budget">
            <div className="cs-budget-numbers">
                <strong>{cost ?? '—'} / {k}</strong>
                <span>{cost === null ? 'Waiting' : exceeded ? 'Over budget' : 'Within budget'}</span>
            </div>
            <div className={`cs-budget-track ${exceeded ? 'is-exceeded' : ''}`}>
                <div className="cs-budget-fill" style={{ width: `${ratio}%` }} />
            </div>
            <div className="cs-budget-bottom">
                <span>Cost change: {step.delta >= 0 ? '+' : ''}{step.delta}</span>
                <span>Valid count: <strong>{step.count}</strong></span>
            </div>
        </div>
    );
}

function MatrixPanel({ nums, step }) {
    const n = nums.length;
    const matrix = step.matrix ?? {};

    return (
        <div className="cs-matrix-wrap">
            <div className="cs-matrix"
                style={{ gridTemplateColumns: `52px repeat(${n}, minmax(33px, 1fr))` }}>
                <div className="cs-matrix-head">l \ r</div>
                {nums.map((_, i) => (
                    <div className="cs-matrix-head" key={`h-${i}`}>{i}</div>
                ))}
                {nums.map((_, l) => (
                    <div className="cs-matrix-row" key={l}>
                        <div className="cs-matrix-head">{l}</div>
                        {nums.map((_, r) => {
                            const cell = matrix[`${l}-${r}`];
                            const current = step.l === l && step.r === r;

                            return (
                                <div key={r}
                                    title={cell ? `Cost ${cell.cost}` : ''}
                                    className={[
                                        'cs-matrix-cell',
                                        r < l ? 'is-impossible' : '',
                                        cell?.valid === true ? 'is-valid' : '',
                                        cell?.valid === false ? 'is-invalid' : '',
                                        current ? 'is-current' : '',
                                    ].join(' ')}>
                                    {r < l ? '—' : !cell ? '·' : cell.valid ? '✓' : '✕'}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className="cs-matrix-footer">
                <span>✓ Valid</span>
                <span>✕ Over budget</span>
                <strong>Total: {step.count}</strong>
            </div>
        </div>
    );
}

export default function CountNonDecreasingVisual({ run, step }) {
    const rootRef = useRef(null);
    const geometry = useConnections(rootRef, step.approach);
    const { nums, k } = run.input;
    const optimized = step.approach === 'optimized';

    const active = id =>
        step.transfer?.from === id || step.transfer?.to === id;

    return (
        <div className="cs-visual">
            <div className="cs-visual-heading">
                <div>
                    <strong>Non-decreasing subarray simulator</strong>
                    <span>{optimized
                        ? 'Sliding window + monotonic deque'
                        : 'Nested loops + running maximum'}</span>
                </div>
                <div className="cs-count-pill">Count <strong>{step.count}</strong></div>
            </div>

            <LoopStatus step={step} />

            <div className="cs-flow-canvas" ref={rootRef}>
                <div className="cs-flow-grid">
                    <Panel id="array" title="1 · Original array"
                        detail="Source values and current indices"
                        active={active('array')}>
                        <div className="cs-array-row">
                            {nums.map((value, i) => (
                                <div key={i}
                                    className={[
                                        'cs-array-cell',
                                        i >= step.l && i <= step.r ? 'is-window' : '',
                                        i === step.i ? 'is-scanning' : '',
                                    ].join(' ')}>
                                    <small>[{i}]</small>
                                    <strong>{value}</strong>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <Panel id="window" title="2 · Current subarray"
                        detail={optimized ? 'Sliding [left, right) window' : 'Nested l and r loops'}
                        active={active('window')}>
                        <WindowPanel nums={nums} step={step} />
                    </Panel>

                    <Panel id="operations" title="3 · Increment operations"
                        detail="Original heights + required increments"
                        active={active('operations')}>
                        <IncrementPanel nums={nums} step={step} />
                    </Panel>

                    {optimized && (
                        <Panel id="deque" title="4 · Monotonic deque"
                            detail="Block starts and merged heights"
                            active={active('deque')}>
                            <DequePanel step={step} nums={nums} />
                        </Panel>
                    )}

                    <Panel id="budget"
                        title={`${optimized ? '5' : '4'} · Increment budget`}
                        detail="Cost versus k"
                        active={active('budget')}>
                        <BudgetPanel step={step} k={k} />
                    </Panel>

                    <Panel id="matrix"
                        title={`${optimized ? '6' : '5'} · Subarray count matrix`}
                        detail="Each cell represents nums[l..r]"
                        active={active('matrix')}>
                        <MatrixPanel nums={nums} step={step} />
                    </Panel>
                </div>

                <Connections geometry={geometry}
                    transfer={step.transfer} phase={step.phase} />
            </div>

            <div className="cs-narration">
                <strong>{step.phase.replaceAll('-', ' ')}</strong>
                <p>{step.message}</p>
            </div>
        </div>
    );
}
