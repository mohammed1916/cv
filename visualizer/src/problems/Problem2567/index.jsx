import { useLayoutEffect, useMemo, useRef, useState } from "react";
import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import TabSwitch from "../../components/shared/TabSwitch";
import "./MinimumScore.css";
import {
  code,
  python,
  trackerCode,
  trackerPython,
  phases,
  trackerPhases,
  parseInput,
  buildTrace,
  buildTrackerTrace,
} from "./algorithm";

const examples = [
  { label: "[1,4,7,8,5]", input: '{"nums": [1, 4, 7, 8, 5]}' },
  { label: "Three values", input: '{"nums":[1,2,3]}' },
  { label: "Equal values", input: '{"nums":[5,5,5]}' },
  { label: "All negative", input: '{"nums":[-5,-4,-3]}' },
  { label: "Largest magnitudes", input: '{"nums":[1000000000,-1000000000,0]}' },
  { label: "Long run: 40 values", input: '{"nums":[141395,-589275,299298,-937862,362668,-340355,593046,-450703,-72239,-2783,-793675,-126151,685236,860697,928714,329022,-54162,943907,-933408,-308844,-794623,-157655,929089,202258,-166776,629247,895869,-573982,-786568,-80760,-900647,-273201,704121,-959336,347117,51080,617213,-525667,368894,-974761]}' },
];

const COMPLEXITY = {
  sort: "O(n log n) time and O(n) space for n = nums.length, because the visualization sorts a copy. The visualization caps nums at 40 values.",
  tracker: "O(n) time and O(1) extra space: one pass keeps three smallest and three largest values. The visualization caps nums at 40 values.",
};

function makeDefinition(approach) {
  const tracker = approach === "tracker";
  return {
    number: "2567",
    phases: tracker ? trackerPhases : phases,
    parse: parseInput,
    build: tracker ? buildTrackerTrace : buildTrace,
    code: tracker ? trackerCode : code,
    python: tracker ? trackerPython : python,
    inputLabel: 'JSON object with nums (e.g. {"nums": [1, 4, 7, 8, 5]})',
    url: "https://leetcode.com/problems/minimum-score-by-changing-two-elements/",
    complexity: COMPLEXITY[approach],
    examples,
  };
}

function TrackerPyramid({ label, values, changed, side, phase, domain, current, hot = -1 }) {
  const [min, max] = domain;
  const span = Math.max(1, max - min);
  const finite = value => Number.isFinite(value);
  // Ascending group reads left to right as a rising pyramid; the largest group runs in reverse, an inverted pyramid.
  const order = side === "smallest" ? values.map((value, slot) => ({ value, slot })) : values.map((value, slot) => ({ value, slot })).reverse();
  const entering = phase === side;
  const hasRead = current !== null && current !== undefined;
  return (
    <section className={`ms-pyramid ms-pyramid--${side}`} aria-label={label}>
      <h3>{label}</h3>
      <div className="ms-pyramid__chart">
        {order.map(({ value, slot }) => {
          const isNew = entering && changed[slot];
          const isHot = slot === hot;
          const height = finite(value) ? Math.max(6, ((value - min) / span) * 100) : 0;
          const relation = hasRead && finite(value) ? (current < value ? "<" : "≥") : "";
          return (
            <div className={`ms-pyramid__col ${isHot ? "is-hot" : ""}`} key={`${side}-${slot}`} data-slot={slot} data-side={side}>
              <span className={`ms-pyramid__value ${isNew ? "is-entering" : ""}`}>{show(value)}</span>
              <div className={`ms-pyramid__bar ${isNew ? "is-entering" : ""}`} style={{ height: `${height}%` }} data-role={isNew ? "changed" : ""} />
              <span className="ms-pyramid__tag">{side === "smallest" ? `s${slot + 1}` : `l${slot + 1}`}</span>
              {relation && <span className={`ms-pyramid__cmp ${isNew ? "is-entering" : ""}`} aria-hidden="true">{current} {relation} {show(value)} {relation === "<" ? "↑" : "→"}</span>}
            </div>
          );
        })}
      </div>
      <p className="ms-pyramid__axis">{side === "smallest" ? "small → large" : "large → small"}</p>
    </section>
  );
}

// Which tracker slot each candidate compares: one = largest3 - smallest3, two = largest2 - smallest2, three = largest1 - smallest1.
const SLOT_OF = { one: 2, two: 1, three: 0 };
function hotSlot(step, side) {
  if (step.phase === "candidate" && step.candidate) return SLOT_OF[step.candidate];
  if (step.phase === "smallest" && side === "smallest") return step.changedSmall.findIndex(Boolean);
  if (step.phase === "largest" && side === "largest") return step.changedLarge.findIndex(Boolean);
  return -1;
}

// Column centre (in % of the stage width) for slot k on one side. Largest group is drawn reversed.
const colX = (side, k) => {
  const display = side === "smallest" ? k : 2 - k;
  const group = side === "smallest" ? 0 : 50;
  return group + ((display + 0.5) / 3) * 50;
};

function CompareStrip({ step }) {
  if (step.phase === "candidate" && step.candidate) {
    const k = SLOT_OF[step.candidate];
    return (
      <div className="ms-compare">
        <p className="ms-compare__text">
          Span {step.candidate}: largest {k + 1} − smallest {k + 1} = {step.span[1]} − {step.span[0]} = {step.spanOptions.find(o => o.name === step.candidate)?.value ?? ""}
        </p>
      </div>
    );
  }
  if (step.phase === "pick" || step.phase === "done") {
    const values = step.spanOptions;
    return (
      <div className="ms-compare">
        <p className="ms-compare__text">
          min( {values.map(o => `${o.name} ${o.value}`).join(", ")} ) = {step.best}
        </p>
        <div className="ms-compare__chips">
          {values.map(o => (
            <span key={o.name} className={`ms-compare__chip ${o.value === step.best ? "is-winner" : ""}`}>{o.name} {o.value}</span>
          ))}
          <span className="ms-compare__arrow" aria-hidden="true">→</span>
          <span className="ms-compare__chip is-winner">{step.best}</span>
        </div>
      </div>
    );
  }
  if ((step.phase === "smallest" || step.phase === "largest") && step.current !== null) {
    const side = step.phase;
    const k = hotSlot(step, side);
    const value = side === "smallest" ? step.smallest[k] : step.largest[k];
    const rel = step.current < value ? "<" : "≥";
    return (
      <div className="ms-compare">
        <p className="ms-compare__text">{step.current} {rel} {show(value)} in {side === "smallest" ? "s" : "l"}{k + 1}, so {step.current} takes that slot.</p>
      </div>
    );
  }
  return null;
}

// Connector drawn in pixels from the measured bar tops, so the arc lands on the compared bars at any width.
function CompareOverlay({ step, wrapRef }) {
  const [geometry, setGeometry] = useState(null);
  const active = step.phase === "candidate" && step.candidate ? SLOT_OF[step.candidate] : null;
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || active === null) { setGeometry(null); return undefined; }
    const measure = () => {
      const base = wrap.getBoundingClientRect();
      const point = side => {
        const bar = wrap.querySelector(`.ms-pyramid__col[data-side="${side}"][data-slot="${active}"] .ms-pyramid__bar`);
        if (!bar) return null;
        const box = bar.getBoundingClientRect();
        return { x: box.left - base.left + box.width / 2, y: box.top - base.top - 4 };
      };
      const from = point("smallest"), to = point("largest");
      const next = from && to ? { width: base.width, height: base.height, from, to } : null;
      setGeometry(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    measure();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(wrap);
    window.addEventListener("resize", measure);
    return () => { observer?.disconnect(); window.removeEventListener("resize", measure); };
  });
  if (!geometry) return null;
  const { width, height, from, to } = geometry;
  const lift = Math.min(from.y, to.y) - 34;
  const d = `M ${from.x} ${from.y} C ${from.x} ${lift}, ${to.x} ${lift}, ${to.x} ${to.y}`;
  return (
    <svg className="ms-compare__overlay" width={width} height={height} aria-hidden="true">
      <path className="ms-compare__flow" d={d} />
      <circle cx={from.x} cy={from.y} r="4" className="ms-compare__node" />
      <circle cx={to.x} cy={to.y} r="4" className="ms-compare__node" />
    </svg>
  );
}

function TrackerStage({ nums, step }) {
  const wrapRef = useRef(null);
  const pointerX = step.index >= 0 ? step.index * 50 : 0;
  return (
    <div className="ms-stage">
      <div className="ms-input" aria-label="Input values">
        <div className="ms-pointer" style={{ transform: `translateX(${pointerX}px)`, opacity: step.index >= 0 ? 1 : 0 }}>
          <span className="ms-pointer__arrow">▼</span>
          <span>i = {step.index}</span>
        </div>
        <div className="ms-input__cells">
          {nums.map((value, index) => {
            const read = index === step.index;
            const done = step.index >= 0 && index < step.index;
            return (
              <div key={index} className={`ms-cell ${read ? "is-read" : ""} ${done ? "is-done" : ""}`}>
                <small>[{index}]</small>
                {value}
              </div>
            );
          })}
        </div>
      </div>
      <p className="ms-caption">{step.current === null ? "No value is being read yet." : `Reading ${step.current}: ${step.message}`}</p>
      <div className="ms-trackers">
        <div className="ms-trackers-wrap" ref={wrapRef}>
          <div className="ms-trackers">
            <TrackerPyramid label="Three smallest, ascending" values={step.smallest} changed={step.changedSmall} side="smallest" phase={step.phase} domain={step.domain} current={step.current} hot={hotSlot(step, "smallest")} />
            <TrackerPyramid label="Three largest, descending" values={step.largest} changed={step.changedLarge} side="largest" phase={step.phase} domain={step.domain} current={step.current} hot={hotSlot(step, "largest")} />
          </div>
          <CompareOverlay step={step} wrapRef={wrapRef} />
          <CompareStrip step={step} />
        </div>
      </div>
    </div>
  );
}

const CHANGED = {
  one: "change the two smallest",
  two: "change the smallest and largest",
  three: "change the two largest",
};

function SpanBoard({ options, domain, active, chosen = null }) {
  const chosenName = chosen === null ? null : options.find(option => option.value === chosen)?.name ?? null;
  const [min, max] = domain;
  const total = Math.max(1, max - min);
  const pct = value => `${((value - min) / total) * 100}%`;
  return (
    <section className="ms-spans" aria-label="Span left after changing two values">
      <h3>Span left after changing two values</h3>
      {options.map(option => {
        const isActive = option.name === active;
        const isChosen = option.name === chosenName;
        return (
          <div key={option.name} className={`ms-span-row ${isActive ? "is-active" : ""} ${isChosen ? "is-chosen" : ""}`} data-option={option.name}>
            <div className="ms-span-row__label">
              <span>{CHANGED[option.name]}{isChosen ? " · returned" : ""}</span>
              <strong>{option.value}</strong>
            </div>
            <div className="ms-span-track" role="img" aria-label={`Kept values ${option.low} to ${option.high}, span ${option.value}`}>
              <div className="ms-span-bar" style={{ left: pct(option.low), width: `${((option.high - option.low) / total) * 100}%` }} />
              <span className="ms-span-marker" style={{ left: pct(option.low) }}>{show(option.low)}</span>
              <span className="ms-span-marker is-end" style={{ left: pct(option.high) }}>{show(option.high)}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}

const show = value => (value === Infinity ? "∞" : value === -Infinity ? "−∞" : String(value));

function Reasoning({ approach, step }) {
  return (
    <div className="bs-reasoning">
      {approach === "tracker" ? (
        <>
          <h3>Three smallest, three largest</h3>
          <p>
            Changing two values can only help in three ways: the two smallest, the smallest and largest,
            or the two largest. Each way leaves a known span, so only six numbers matter.
          </p>
          <p>
            One pass keeps the three smallest and three largest values in ascending slots. A new value is
            compared with the slot it could replace, then shifted into place.
          </p>
        </>
      ) : (
        <>
          <h3>Sort, then compare three spans</h3>
          <p>
            After sorting, changing the two smallest values leaves the span from index 2 to the end. Changing
            the smallest and largest leaves 1 to n - 2. Changing the two largest leaves 0 to n - 3.
          </p>
          <p>The two changed values can always be made equal to a kept value, so the answer is the smallest of those three spans.</p>
        </>
      )}
      {step && <p className="bs-reasoning__message">{step.message}</p>}
    </div>
  );
}

export default function MinimumScoreVisualizer() {
  const [approach, setApproach] = useState("sort");
  const definition = useMemo(() => makeDefinition(approach), [approach]);

  return (
    <div className="ms-page">
      <TabSwitch
        label="Choose solution"
        value={approach}
        onChange={setApproach}
        options={[
          { value: "sort", label: "Solution 1 · Sort" },
          { value: "tracker", label: "Solution 2 · Three smallest and largest" },
        ]}
      />
      <AlgorithmWorkspace
        key={approach}
        definition={definition}
        renderVisual={({ run, step }) => (
          <>
            {approach === "tracker" ? (
              <TrackerStage nums={run.input.nums} step={step} />
            ) : (
              <IndexedSequence
                label="Sorted values"
                length={step.values.length}
                active={step.pair.length ? step.pair[1] : -1}
                valueAt={index => step.values[index]}
                roleAt={index => (step.pair.includes(index) ? `${step.candidate} pair` : "")}
              />
            )}
            {step.spanOptions && step.spanOptions.length > 0 && step.domain && (
              <SpanBoard options={step.spanOptions} domain={step.domain} active={step.candidate} chosen={step.phase === "pick" || step.phase === "done" ? step.best : null} />
            )}
          </>
        )}
        renderReasoning={({ step }) => <Reasoning approach={approach} step={step} />}
      />
    </div>
  );
}
