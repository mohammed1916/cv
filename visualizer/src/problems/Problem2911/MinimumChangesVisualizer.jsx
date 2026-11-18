
import React from "react";
import "./MinimumChangesVisualizer.css";

const number = value =>
    value === null || value === undefined || value >= 1000000
        ? "∞"
        : value;

function Section({ title, subtitle, children, className = "" }) {
    return (
        <section className={`mc-panel ${className}`}>
            <div className="mc-panel-heading">
                <div>
                    <h3>{title}</h3>
                    {subtitle && <p>{subtitle}</p>}
                </div>
            </div>
            {children}
        </section>
    );
}

function StringStrip({ s, active = [], secondary = [] }) {
    return (
        <div className="mc-string-strip">
            {s.split("").map((char, i) => (
                <div
                    key={i}
                    className={[
                        "mc-char",
                        active.includes(i) ? "is-active" : "",
                        secondary.includes(i) ? "is-secondary" : ""
                    ].filter(Boolean).join(" ")}
                >
                    <span className="mc-char-index">{i}</span>
                    <strong>{char}</strong>
                </div>
            ))}
        </div>
    );
}

function Metric({ label, value, color = "purple", detail }) {
    return (
        <div className={`mc-metric mc-${color}`}>
            <span>{label}</span>
            <strong>{value}</strong>
            {detail && <small>{detail}</small>}
        </div>
    );
}

function BufferCard({
    name,
    description,
    values = [],
    activeIndex = -1,
    layer,
    role
}) {
    return (
        <div className={`mc-buffer-card mc-buffer-${name}`}>
            <div className="mc-buffer-heading">
                <div>
                    <strong>{name}</strong>
                    <span>{description}</span>
                </div>
                <span className="mc-layer-badge">
                    {layer === null || layer === undefined
                        ? "Scratch"
                        : `B${layer}`}
                </span>
            </div>

            <div className="mc-buffer-cells">
                {values.map((value, index) => (
                    <div
                        key={index}
                        className={[
                            "mc-buffer-cell",
                            index === activeIndex ? "is-pointed" : "",
                            role === "write" && index === activeIndex ? "is-write" : ""
                        ].filter(Boolean).join(" ")}
                    >
                        <span>{index}</span>
                        <strong>{value}</strong>
                    </div>
                ))}
            </div>

            <div className="mc-buffer-role">{role === "write"
                ? "← Current write position"
                : role === "read"
                    ? "← Inner recurrence read"
                    : "Rolling recurrence storage"}
            </div>
        </div>
    );
}

function BufferVisualizer({ step }) {
    const buffers = step.buffers || {};
    const layers = step.bufferLayers || {};
    const d = step.d ?? 1;
    const left = step.left ?? 0;
    const innerIndex = step.innerIndex ?? -1;

    const currentIndex = step.phase === "offset"
        || step.phase === "store"
        ? left
        : -1;

    return (
        <Section
            title="Three-buffer recurrence"
            subtitle={`Fixed divisor d = ${d} · block count = ${step.blocks ?? "—"}`}
            className="mc-buffer-section"
        >
            <div className="mc-buffer-explanation">
                <div className="mc-formula">
                    <span>Cost for B blocks</span>
                    <strong>
                        inner cost from B − 2 blocks + outer comparisons
                    </strong>
                </div>
                <p>
                    We retain three rolling arrays. The algorithm reads the
                    B − 2 layer from <code>two_back</code>, writes the B layer
                    into <code>current</code>, and rotates references after
                    finishing a block count.
                </p>
            </div>

            <div className="mc-buffer-stack">
                <BufferCard
                    name="two_back"
                    description="Inner result"
                    values={buffers.twoBack || []}
                    activeIndex={step.blocks >= 4 ? innerIndex : -1}
                    layer={layers.twoBack}
                    role="read"
                />

                <BufferCard
                    name="one_back"
                    description="Intermediate layer"
                    values={buffers.oneBack || []}
                    layer={layers.oneBack}
                />

                <BufferCard
                    name="current"
                    description="New results"
                    values={buffers.current || []}
                    activeIndex={currentIndex}
                    layer={layers.current}
                    role="write"
                />
            </div>

            <div className="mc-buffer-pointer-explanation">
                {step.blocks >= 4 ? (
                    <>
                        <span className="mc-pointer-dot" />
                        Reading <code>two_back[{innerIndex}]</code> =
                        {" "}
                        <strong>{step.innerCost ?? 0}</strong>
                    </>
                ) : (
                    <>
                        <span className="mc-pointer-dot mc-dot-muted" />
                        Base case: no inner contribution for two or three blocks.
                    </>
                )}
            </div>

            {step.phase === "rotate" && (
                <div className="mc-rotation">
                    <div className="mc-rotation-title">
                        <span>REFERENCE ROTATION</span>
                        <strong>After finishing this block count</strong>
                    </div>
                    <div className="mc-rotation-flow">
                        <div>
                            <span>old one_back</span>
                            <strong>→ two_back</strong>
                        </div>
                        <div>
                            <span>old current</span>
                            <strong>→ one_back</strong>
                        </div>
                        <div>
                            <span>old two_back</span>
                            <strong>→ current</strong>
                        </div>
                    </div>
                    <p>
                        No array contents are copied. Only the references rotate.
                        The old buffer is recycled as scratch storage.
                    </p>
                </div>
            )}
        </Section>
    );
}

function OffsetVisualizer({ s, step }) {
    const {
        d,
        blocks,
        left,
        right,
        offset,
        leftIndex,
        rightIndex,
        leftChar,
        rightChar,
        mismatch,
        changes,
        innerCost
    } = step;

    const leftPositions = [];
    const rightPositions = [];

    for (let i = 0; i < (d || 1); i++) {
        leftPositions.push((left ?? 0) + i);
        rightPositions.push((right ?? 0) - (d || 1) + i);
    }

    const active = offset >= 0
        ? [leftIndex, rightIndex]
        : [];

    return (
        <Section
            title="Offset-by-offset comparison"
            subtitle={`Compare the outer blocks for ${blocks} blocks of size ${d}`}
            className="mc-offset-section"
        >
            <div className="mc-offset-progress">
                <div className="mc-offset-step">
                    <span>INNER CONTRIBUTION</span>
                    <strong>{innerCost ?? 0}</strong>
                </div>
                <div className="mc-offset-step">
                    <span>CURRENT OFFSET</span>
                    <strong>
                        {offset < 0 ? "Not started" : `${offset + 1} / ${d}`}
                    </strong>
                </div>
                <div className="mc-offset-step">
                    <span>RUNNING CHANGES</span>
                    <strong className={mismatch ? "mc-danger-text" : ""}>
                        {changes ?? innerCost ?? 0}
                    </strong>
                </div>
            </div>

            <div className="mc-comparison-string">
                <StringStrip s={s} active={active} />
            </div>

            <div className="mc-comparison-detail">
                <div className="mc-compare-side">
                    <span>LEFT CHARACTER</span>
                    <strong>{leftChar ?? "—"}</strong>
                    <small>index {leftIndex ?? "—"}</small>
                </div>

                <div className="mc-compare-symbol">
                    {offset < 0 ? "?" : mismatch ? "≠" : "="}
                </div>

                <div className="mc-compare-side">
                    <span>RIGHT CHARACTER</span>
                    <strong>{rightChar ?? "—"}</strong>
                    <small>index {rightIndex ?? "—"}</small>
                </div>
            </div>

            <div className={`mc-comparison-result ${offset < 0 ? "" : mismatch ? "is-mismatch" : "is-match"
                }`}>
                {offset < 0
                    ? "The offset loop is ready to begin."
                    : mismatch
                        ? `Mismatch: add one change. Running total = ${changes}.`
                        : `Match: add zero changes. Running total = ${changes}.`}
            </div>

            <div className="mc-offset-equation">
                <span>left + offset</span>
                <strong>{leftIndex ?? "—"}</strong>
                <span>versus</span>
                <strong>{rightIndex ?? "—"}</strong>
                <span>right − d + offset</span>
            </div>

            <div className="mc-offset-lanes">
                <div>
                    <span>LEFT BLOCK</span>
                    <div>
                        {leftPositions.map((index, i) => (
                            <span
                                key={index}
                                className={i === offset ? "is-current" : ""}
                            >
                                {s[index]}<small>{index}</small>
                            </span>
                        ))}
                    </div>
                </div>
                <div>
                    <span>RIGHT BLOCK</span>
                    <div>
                        {rightPositions.map((index, i) => (
                            <span
                                key={index}
                                className={i === offset ? "is-current" : ""}
                            >
                                {s[index]}<small>{index}</small>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Section>
    );
}

function CostTable({ costTable, n, selectedStart, selectedEnd }) {
    if (!costTable) return null;

    return (
        <Section
            title="Substring cost matrix"
            subtitle="Each cell stores the cheapest divisor found so far."
            className="mc-cost-section"
        >
            <div className="mc-table-scroll">
                <table className="mc-cost-table">
                    <thead>
                        <tr>
                            <th>l \\ r</th>
                            {Array.from({ length: n + 1 }, (_, i) => (
                                <th key={i}>{i}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {costTable.map((row, l) => (
                            <tr key={l}>
                                <th>{l}</th>
                                {row.map((value, r) => {
                                    const selected =
                                        l === selectedStart && r === selectedEnd;

                                    return (
                                        <td
                                            key={r}
                                            className={[
                                                selected ? "is-selected" : "",
                                                value === 0 ? "is-zero" : ""
                                            ].filter(Boolean).join(" ")}
                                        >
                                            {r <= l + 1 ? "·" : number(value)}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="mc-table-note">
                A dot means the interval is too short to be a valid part.
                Highlighted cells identify the currently evaluated substring.
            </p>
        </Section>
    );
}

function DPVisualizer({ s, k, step }) {
    const {
        pieces,
        end,
        start,
        minStart,
        minEnd,
        previous = [],
        current = [],
        best,
        bestStart,
        previousValue,
        segmentCost,
        candidate,
        dpTable
    } = step;

    const isDP = step.phase?.startsWith("dp");
    const currentRange = start !== undefined && end !== undefined
        ? Array.from({ length: end - start }, (_, i) => start + i)
        : [];

    return (
        <Section
            title="DP partition builder"
            subtitle="One row represents a fixed number of completed pieces."
            className="mc-dp-section"
        >
            <div className="mc-dp-rule">
                <div>
                    <span>MINIMUM START</span>
                    <strong>2 × (pieces − 1)</strong>
                    <small>Previous pieces each need at least 2 characters.</small>
                </div>
                <div>
                    <span>MINIMUM END</span>
                    <strong>2 × pieces</strong>
                    <small>The current piece also needs at least 2 characters.</small>
                </div>
            </div>

            {isDP && pieces !== undefined && (
                <div className="mc-dp-loop">
                    <div className="mc-loop-chip">
                        <span>pieces</span>
                        <strong>{pieces}</strong>
                    </div>
                    <div className="mc-loop-chip">
                        <span>min_start</span>
                        <strong>{minStart}</strong>
                    </div>
                    <div className="mc-loop-chip">
                        <span>end</span>
                        <strong>{end ?? "—"}</strong>
                    </div>
                    <div className="mc-loop-chip">
                        <span>start</span>
                        <strong>{start ?? "—"}</strong>
                    </div>
                </div>
            )}

            <div className="mc-dp-string">
                <StringStrip s={s} active={currentRange} />
            </div>

            {step.phase === "dpCandidate" && (
                <div className="mc-candidate-equation">
                    <div>
                        <span>PREVIOUS PARTS</span>
                        <strong>{previousValue}</strong>
                    </div>
                    <span className="mc-operator">+</span>
                    <div>
                        <span>NEW SEGMENT</span>
                        <strong>{segmentCost}</strong>
                    </div>
                    <span className="mc-operator">=</span>
                    <div className="mc-candidate-total">
                        <span>CANDIDATE</span>
                        <strong>{candidate}</strong>
                    </div>
                </div>
            )}

            {step.phase === "dpCandidate" && (
                <div className={`mc-best-status ${step.improved ? "is-improved" : ""}`}>
                    {step.improved
                        ? `New minimum! best = ${best}, achieved with start = ${bestStart}.`
                        : `Not better. The best candidate remains ${best}.`}
                </div>
            )}

            {(step.phase === "dpEnd" || step.phase === "dpStore") && (
                <div className="mc-best-status">
                    {step.phase === "dpEnd"
                        ? `Searching all legal starts for end = ${end}.`
                        : `Stored ${number(best)} in dp[${pieces}][${end}].`}
                </div>
            )}

            {previous.length > 0 && (
                <div className="mc-dp-arrays">
                    <div>
                        <span>PREVIOUS ROW</span>
                        <div className="mc-array-cells">
                            {previous.map((value, i) => (
                                <div
                                    key={i}
                                    className={i === start ? "is-current" : ""}
                                >
                                    <small>{i}</small>
                                    <strong>{number(value)}</strong>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <span>CURRENT ROW</span>
                        <div className="mc-array-cells">
                            {current.map((value, i) => (
                                <div
                                    key={i}
                                    className={i === end ? "is-current" : ""}
                                >
                                    <small>{i}</small>
                                    <strong>{number(value)}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {dpTable && (
                <div className="mc-dp-matrix">
                    <span>FULL DP HISTORY (FOR LEARNING)</span>
                    <div className="mc-table-scroll">
                        <table className="mc-cost-table">
                            <thead>
                                <tr>
                                    <th>Pieces \\ End</th>
                                    {Array.from({ length: s.length + 1 }, (_, i) => (
                                        <th key={i}>{i}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {dpTable.map((row, r) => (
                                    <tr key={r}>
                                        <th>{r}</th>
                                        {row.map((value, c) => (
                                            <td
                                                key={c}
                                                className={
                                                    r === pieces && c === end
                                                        ? "is-selected"
                                                        : ""
                                                }
                                            >
                                                {number(value)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Section>
    );
}

function ResultVisualizer({ step }) {
    const { result, partitions = [], s } = step;

    return (
        <Section
            title="Optimal partition"
            subtitle="Reconstruct the best boundaries from the completed DP table."
            className="mc-result-section"
        >
            <div className="mc-result-total">
                <span>MINIMUM CHARACTER CHANGES</span>
                <strong>{result}</strong>
            </div>

            <div className="mc-result-partitions">
                {partitions.map((part, i) => (
                    <div className="mc-result-part" key={i}>
                        <span>PART {i + 1}</span>
                        <strong>{part.text}</strong>
                        <small>
                            s[{part.start}:{part.end}] · Cost {part.cost}
                        </small>
                    </div>
                ))}
            </div>

            <div className="mc-result-equation">
                {partitions.map((part, i) => (
                    <React.Fragment key={i}>
                        {i > 0 && <span>+</span>}
                        <strong>{part.cost}</strong>
                    </React.Fragment>
                ))}
                <span>=</span>
                <strong className="mc-result-answer">{result}</strong>
            </div>

            <StringStrip s={s} />
        </Section>
    );
}

export default function MinimumChangesVisualizer({ run, step }) {
    if (!run || !step) return null;

    const s = run.input.s;
    const k = run.input.k;
    const n = s.length;

    const recurrencePhases = [
        "divisor",
        "blocks",
        "recurrence",
        "offset",
        "store",
        "rotate"
    ];

    const dpPhases = [
        "dpSetup",
        "dpPieces",
        "dpEnd",
        "dpSkip",
        "dpCandidate",
        "dpStore",
        "dpRotate"
    ];

    const isRecurrence = recurrencePhases.includes(step.phase);
    const isOffset = step.phase === "offset" || step.phase === "recurrence";
    const isDP = dpPhases.includes(step.phase);
    const isResult = step.phase === "result";

    const active = step.phase === "offset"
        ? [step.leftIndex, step.rightIndex]
        : step.left !== undefined && step.right !== undefined
            ? Array.from(
                { length: step.right - step.left },
                (_, i) => step.left + i
            )
            : [];

    return (
        <div className="mc-visualizer">
            <div className="mc-input-badge">
                    <span>INPUT</span>
                    <strong>{s}</strong>
                    <small>k = {k}</small>
                </div>

            <div className="mc-step-message">
                <div className="mc-step-indicator">
                    <span className="mc-live-dot" />
                    CURRENT OPERATION
                </div>
                <p>{step.message}</p>
            </div>

            <Section
                title="Input string"
                subtitle="Every character has a stable zero-based index."
            >
                <StringStrip s={s} active={active} />
            </Section>

            {isRecurrence && (
                <BufferVisualizer step={step} />
            )}

            {isOffset && (
                <OffsetVisualizer s={s} step={step} />
            )}

            {step.phase === "store" && (
                <div className="mc-store-callout">
                    <strong>Cost stored for this divisor</strong>
                    <span>
                        cost({step.left}, {step.right}) = {step.bestCost}
                    </span>
                    <small>
                        Other divisors may still produce a lower cost for this substring.
                    </small>
                </div>
            )}

            {isDP && (
                <DPVisualizer s={s} k={k} step={step} />
            )}

            {isResult && (
                <ResultVisualizer step={step} />
            )}

            {step.costTable && (
                <CostTable
                    costTable={step.costTable}
                    n={n}
                    selectedStart={step.start ?? step.left}
                    selectedEnd={step.end ?? step.right}
                />
            )}
        </div>
    );
}
