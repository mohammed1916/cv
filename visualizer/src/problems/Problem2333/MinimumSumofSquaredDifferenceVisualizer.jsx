import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

import CodeTracePanel from '../../components/CodeTracePanel';
import PlaybackControls from '../../components/PlaybackControls';
import PatternOverlay from '../../components/PatternOverlay';
import LuminoDockPanel from '../../components/LuminoDockPanel';
import FloatingPanel from '../../components/shared/FloatingPanel';
import PointerRail from '../../components/shared/PointerRail';
import AlgorithmNarrative from '../../components/shared/AlgorithmNarrative';
import { usePlaybackState } from '../../hooks/usePlaybackState';
import { usePatternOverlay } from '../../hooks/usePatternOverlay';
import { useAutoScroll } from '../../hooks/useAutoScroll';

import EXAMPLES from './minimumSumSquaredDifferenceExamples';
import { minimumSumSquaredDifferenceNarrative } from './minimumSumSquaredDifferenceNarrative';
import './MinimumSumofSquaredDifferenceVisualizer.css';

const CODE = [
  { line: 1, text: 'def minSumSquareDiff(nums1, nums2, k1, k2):' },
  { line: 2, text: '    diff = [abs(a - b) for a, b in zip(nums1, nums2)]' },
  { line: 3, text: '    k = k1 + k2' },
  { line: 4, text: '    if sum(diff) <= k:' },
  { line: 5, text: '        return 0' },
  { line: 6, text: '    low, high = 0, max(diff)' },
  { line: 7, text: '    while low < high:' },
  { line: 8, text: '        mid = (low + high) // 2' },
  { line: 9, text: '        needed = sum(max(0, d - mid) for d in diff)' },
  { line: 10, text: '        if needed <= k:' },
  { line: 11, text: '            high = mid' },
  { line: 12, text: '        else:' },
  { line: 13, text: '            low = mid + 1' },
  { line: 14, text: '    ceiling = low' },
  { line: 15, text: '    remaining = k - sum(max(0, d - ceiling) for d in diff)' },
  { line: 16, text: '    diff = [min(d, ceiling) for d in diff]' },
  { line: 17, text: '    for i in range(len(diff)):' },
  { line: 18, text: '        if remaining > 0 and diff[i] == ceiling:' },
  { line: 19, text: '            diff[i] -= 1' },
  { line: 20, text: '            remaining -= 1' },
  { line: 21, text: '    return sum(d * d for d in diff)' },
];

const MAX_ITEMS = 30;
const MAX_VALUE = 100000;
const MAX_BUDGET = 1000000000;
const number = (n) => typeof n === 'string' && /^-?\d+$/.test(n) ? BigInt(n).toLocaleString('en-US') : Number(n).toLocaleString('en-US');
const squaredSum = (arr) => arr.reduce((acc, d) => acc + BigInt(d) * BigInt(d), 0n).toString();
const makeBuckets = (arr) => {
  const counts = new Map();
  arr.forEach((d) => counts.set(d, (counts.get(d) || 0) + 1));
  return [...counts].sort((a, b) => b[0] - a[0]).map(([difference, count]) => ({ difference, count }));
};

function generateSteps(input) {
  const { nums1, nums2, k1, k2 } = input;
  const original = nums1.map((value, i) => Math.abs(value - nums2[i]));
  const budget = k1 + k2;
  const totalDifference = original.reduce((a, b) => a + b, 0);
  const initialSum = squaredSum(original);
  const steps = [];
  let current = [...original];
  let low = null;
  let high = null;
  let mid = null;
  let required = 0;
  let remaining = budget;
  let ceiling = null;
  let inspectedIndex = null;
  let result = null;
  let sum = '0';
  let iteration = 0;
  let contributions = original.map(() => 0);
  const push = (phase, activeLine, message, extra = {}) => {
    steps.push({
      phase, activeLine, message, original: [...original], current: [...current],
      budget, totalDifference, initialSum, low, high, mid, required, remaining,
      ceiling, inspectedIndex, result, sum, iteration,
      contributions: [...contributions], buckets: makeBuckets(current), ...extra,
    });
  };
  push('differences', 2, 'Compute |nums1[i] − nums2[i]| for each index. Only the absolute differences affect the squared error.');
  push('budget', 3, `Combine the two budgets: ${k1} + ${k2} = ${budget} available unit operations.`);
  push('capacity', 4, `Eliminating every difference would require ${totalDifference} operations.`);
  if (totalDifference <= budget) {
    current = original.map(() => 0);
    remaining = budget - totalDifference;
    sum = '0';
    result = '0';
    contributions = original.map(() => 0);
    push('zero', 5, `Budget ${budget} covers all ${totalDifference} required reductions. Every difference becomes zero; unused operations are allowed.`);
    push('done', 5, 'The minimum squared difference is zero.');
    return steps;
  }
  low = 0;
  high = Math.max(...original);
  push('search-init', 6, `Search for the smallest feasible ceiling between ${low} and ${high}.`);
  while (low < high) {
    iteration += 1;
    push('loop', 7, `Binary-search iteration ${iteration}: search interval [${low}, ${high}].`);
    mid = Math.floor((low + high) / 2);
    push('mid', 8, `Try ceiling ${mid}. Every difference greater than ${mid} must be reduced to ${mid}.`);
    required = 0;
    push('cost-init', 9, `Calculate the total number of operations required to cap every difference at ${mid}.`, { testedCeiling: mid });
    for (let i = 0; i < original.length; i += 1) {
      inspectedIndex = i;
      const cost = Math.max(0, original[i] - mid);
      required += cost;
      push('cost-item', 9, `Index ${i}: max(0, ${original[i]} − ${mid}) = ${cost}; running cost = ${required}.`, { cost, testedCeiling: mid });
    }
    inspectedIndex = null;
    const feasible = required <= budget;
    push('decision', 10, feasible
      ? `${required} ≤ ${budget}: ceiling ${mid} is feasible. Try an even smaller ceiling.`
      : `${required} > ${budget}: ceiling ${mid} is too small. Raise the lower bound.`, { feasible, testedCeiling: mid });
    if (feasible) {
      high = mid;
      push('bounds', 11, `Keep [${low}, ${high}]; we can afford ceiling ${mid}.`, { feasible });
    } else {
      low = mid + 1;
      push('bounds', 13, `Keep [${low}, ${high}]; all ceilings up to ${mid} are unaffordable.`, { feasible });
    }
  }
  ceiling = low;
  mid = null;
  inspectedIndex = null;
  push('threshold', 14, `The smallest affordable maximum difference is ${ceiling}.`);
  const used = original.reduce((a, d) => a + Math.max(0, d - ceiling), 0);
  remaining = budget - used;
  push('remaining', 15, `Capping at ${ceiling} uses ${used} operations; ${remaining} operations remain.`);
  current = original.map((d) => Math.min(d, ceiling));
  push('clamp', 16, `Apply the ceiling: [${current.join(', ')}]. These are the new absolute differences.`);
  for (let i = 0; i < current.length; i += 1) {
    inspectedIndex = i;
    push('leftover-check', 18, `Index ${i}: remaining = ${remaining}; current difference = ${current[i]}; ceiling = ${ceiling}.`);
    if (remaining > 0 && current[i] === ceiling) {
      const before = current[i];
      current[i] -= 1;
      push('leftover', 19, `Reduce index ${i}: ${before} → ${current[i]}. This saves ${2 * before - 1} squared-error units.`);
      remaining -= 1;
      push('leftover-budget', 20, `One operation was spent. Remaining budget: ${remaining}.`);
    } else {
      push('leftover-skip', 18, remaining === 0
        ? 'No operations remain.'
        : `Skip index ${i}: its difference is below the optimal ceiling.`);
    }
    if (remaining === 0) break;
  }
  inspectedIndex = null;
  let running = 0n;
  contributions = current.map(() => 0);
  for (let i = 0; i < current.length; i += 1) {
    inspectedIndex = i;
    contributions[i] = current[i] ** 2;
    running += BigInt(current[i]) * BigInt(current[i]);
    sum = running.toString();
    push('square', 21, `Index ${i}: ${current[i]}² = ${contributions[i]}; accumulated squared error = ${sum}.`);
  }
  inspectedIndex = null;
  result = running.toString();
  push('done', 21, `Return ${result}, the minimum possible sum of squared differences.`);
  return steps;
}

function PanelBody({ children, className = '' }) {
  return <div className={`mssd-panel-body ${className}`}>{children}</div>;
}
function Section({ title, meta, children }) {
  return <section className="mssd-section"><div className="mssd-section-heading"><strong>{title}</strong>{meta != null && <span>{meta}</span>}</div>{children}</section>;
}
function Stat({ label, value, detail, tone = '' }) {
  return <div className={`mssd-stat ${tone}`}><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div>;
}
function parseArray(raw) {
  const value = JSON.parse(raw);
  if (!Array.isArray(value) || !value.length || value.length > MAX_ITEMS || value.some((x) => !Number.isInteger(x) || x < 1 || x > MAX_VALUE)) {
    throw new Error(`Enter a JSON array containing 1–${MAX_ITEMS} positive integers, each at most ${MAX_VALUE}.`);
  }
  return value;
}
function parseInput(form) {
  const nums1 = parseArray(form.nums1);
  const nums2 = parseArray(form.nums2);
  if (nums1.length !== nums2.length) throw new Error('nums1 and nums2 must have equal lengths.');
  const k1 = Number(form.k1);
  const k2 = Number(form.k2);
  if (![k1, k2].every((k) => Number.isSafeInteger(k) && k >= 0 && k <= MAX_BUDGET)) {
    throw new Error(`k1 and k2 must be integers from 0 to ${MAX_BUDGET}.`);
  }
  return { nums1, nums2, k1, k2 };
}
function formOf(example) {
  return { nums1: JSON.stringify(example.nums1), nums2: JSON.stringify(example.nums2), k1: String(example.k1), k2: String(example.k2) };
}
function InputEditor({ form, setForm, apply, exampleIndex, applyExample, error }) {
  return <div className="mssd-input-card">
    <div className="mssd-examples">{EXAMPLES.map((e, i) => <button key={e.label} type="button" className={`mssd-chip ${i === exampleIndex ? 'active' : ''}`} onClick={() => applyExample(i)}>{e.label}</button>)}</div>
    <div className="mssd-input-grid">{['nums1', 'nums2', 'k1', 'k2'].map((field) => <label className="mssd-field" key={field}><span>{field}</span><input spellCheck={false} value={form[field]} onChange={(e) => setForm((old) => ({ ...old, [field]: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') apply(); }} /></label>)}</div>
    <div className="mssd-apply-row"><button className="mssd-apply" type="button" onClick={apply}>Apply input and reset trace</button><small>Arrays: JSON syntax · up to {MAX_ITEMS} elements</small></div>
    {error && <div className="mssd-error" role="alert">{error}</div>}
  </div>;
}
function DifferenceChart({ input, step }) {
  const original = input.nums1.map((a, i) => Math.abs(a - input.nums2[i]));
  const current = step?.current ?? original;
  const max = Math.max(1, ...original);
  return <div className="mssd-chart"><div className="mssd-chart-legend"><span><i className="mssd-key original" /> Initial</span><span><i className="mssd-key current" /> Current</span><span><i className="mssd-key focus" /> Active index</span></div>
    <div className="mssd-chart-scroll"><div className="mssd-bars">{original.map((d, i) => <div className={`mssd-bar-cell ${step?.inspectedIndex === i ? 'focused' : ''}`} key={i}><div className="mssd-bar-values"><span>{d}</span><strong>{current[i]}</strong></div><div className="mssd-bar-track"><div className="mssd-bar-before" style={{ height: `${100 * d / max}%` }} /><motion.div className="mssd-bar-after" initial={false} animate={{ height: `${100 * current[i] / max}%` }} transition={{ duration: 0.24 }} /></div><span className="mssd-bar-index">{i}</span></div>)}</div></div>
    <p className="mssd-chart-caption">Each column represents one array index. The lighter bar is the original absolute difference; the solid bar is its current value.</p>
  </div>;
}
function BucketView({ values, highlight }) {
  const buckets = makeBuckets(values);
  const maxCount = Math.max(1, ...buckets.map((b) => b.count));
  return <div className="mssd-buckets">{buckets.map(({ difference, count }) => <div className={`mssd-bucket ${highlight === difference ? 'active' : ''}`} key={difference}><span>Difference {number(difference)}</span><div className="mssd-bucket-track"><motion.div initial={false} animate={{ width: `${100 * count / maxCount}%` }} /></div><strong>× {count}</strong></div>)}</div>;
}
function Formula({ step }) {
  if (!step) return <div className="mssd-explanation">Start playback to see each formula with its actual values.</div>;
  if (step.mid != null) return <div className="mssd-formula"><span>Operations required at ceiling {step.mid}</span><strong>Σ max(0, difference − {step.mid}) = {number(step.required)}</strong><small>{step.required <= step.budget ? 'Feasible: enough operations' : 'Infeasible: not enough operations'}</small></div>;
  if (step.ceiling != null) return <div className="mssd-formula"><span>Optimal maximum difference</span><strong>{number(step.ceiling)}</strong><small>Remaining unit operations: {number(step.remaining)}</small></div>;
  return <div className="mssd-formula"><span>Marginal improvement from reducing d by one</span><strong>d² − (d − 1)² = 2d − 1</strong><small>Larger differences provide greater savings.</small></div>;
}
function BinarySearchExplorer({ input, step }) {
  const differences = input.nums1.map((v, i) => Math.abs(v - input.nums2[i]));
  const max = Math.max(0, ...differences);
  const low = step?.low;
  const high = step?.high;
  const mid = step?.mid;
  const active = low != null && high != null;
  const candidate = mid ?? step?.ceiling;
  const needed = mid == null ? null : differences.reduce((sum, d) => sum + Math.max(0, d - mid), 0);
  const feasible = needed == null ? null : needed <= input.k1 + input.k2;
  const positions = max <= 24 ? Array.from({ length: max + 1 }, (_, i) => i) : [...new Set([0, low, mid, high, max].filter(v => v != null))].sort((a, b) => a - b);
  return <div className="mssd-search-explorer">
    <div className="mssd-search-heading"><strong>Binary search — find the smallest affordable ceiling</strong><span>{active ? `Iteration ${step.iteration || 0}` : 'Waiting for search'}</span></div>
    <p>We want the smallest ceiling <code>mid</code> such that reducing every difference above it costs at most <code>k1 + k2</code> operations.</p>
    <div className="mssd-search-values">
      <div><span>low · minimum candidate</span><strong>{low ?? '—'}</strong></div>
      <div className="candidate"><span>mid · test ceiling</span><strong>{candidate ?? '—'}</strong></div>
      <div><span>high · maximum candidate</span><strong>{high ?? '—'}</strong></div>
    </div>
    {active && <div className="mssd-search-scale">
      <div className="mssd-search-track"><div className="mssd-search-range" style={{left:`${100*low/Math.max(1,max)}%`,width:`${100*(high-low)/Math.max(1,max)}%`}} />{mid != null && <div className="mssd-search-mid" style={{left:`${100*mid/Math.max(1,max)}%`}} title={`mid = ${mid}`} />}</div>
      <div className="mssd-search-ticks">{positions.map(n => <span key={n} className={`${n===mid?'is-mid':''} ${n===low?'is-low':''} ${n===high?'is-high':''}`} style={{left:`${100*n/Math.max(1,max)}%`}}>{n}</span>)}</div>
    </div>}
    {mid != null && <>
      <div className="mssd-search-equation"><span>mid = floor((low + high) / 2)</span><strong>⌊({step.low} + {step.high}) / 2⌋ = {mid}</strong></div>
      <div className="mssd-search-costs"><strong>Cost to cap each difference at {mid}</strong>{differences.map((d,i) => <div key={i} className={step.inspectedIndex===i?'is-active':''}><span>Index {i}: max(0, {d} − {mid})</span><b>{Math.max(0,d-mid)}</b></div>)}</div>
      <div className={`mssd-search-verdict ${feasible?'feasible':'infeasible'}`}><strong>{needed} {feasible?'≤':'>'} {input.k1+input.k2} operations</strong><span>{feasible ? `Affordable: high becomes ${mid}. Search smaller ceilings.` : `Too expensive: low becomes ${mid+1}. Search larger ceilings.`}</span></div>
    </>}
    {step?.ceiling != null && <div className="mssd-search-verdict feasible"><strong>Optimal ceiling = {step.ceiling}</strong><span>The binary search has converged. Apply the cap, then spend any leftover operations.</span></div>}
    {!active && <span className="mssd-search-placeholder">Step forward until the binary-search initialization to see low, mid and high.</span>}
  </div>;
}

function DifferencePanel({ input, step, form, setForm, apply, exampleIndex, applyExample, error }) {
  const original = input.nums1.map((a, i) => Math.abs(a - input.nums2[i]));
  const current = step?.current ?? original;
  const spent = step ? step.budget - step.remaining : 0;
  return <PanelBody>
    <InputEditor form={form} setForm={setForm} apply={apply} exampleIndex={exampleIndex} applyExample={applyExample} error={error} />
    <AlgorithmNarrative definition={minimumSumSquaredDifferenceNarrative} step={step} input={input} />
    <Section title="Core intuition" meta="greedy optimization"><div className="mssd-concept"><strong>Reduce the largest difference first</strong><p>Reducing difference <code>d</code> to <code>d − 1</code> saves <code>2d − 1</code> squared-error units. A larger difference always yields a larger immediate saving. Binary search efficiently finds the level to which we can lower the largest differences.</p><div className="mssd-concept-flow"><span>Absolute differences</span><b>→</b><span>Optimal ceiling</span><b>→</b><span>Leftover reductions</span><b>→</b><span>Square + sum</span></div></div></Section>
    <Section title="Binary search — low / mid / high" meta="live search"><BinarySearchExplorer input={input} step={step} /></Section>
    <Section title="Difference histogram" meta={`${current.length} indices`}><DifferenceChart input={input} step={step} /></Section>
    <div className="mssd-stat-grid"><Stat label="Original squared error" value={number(squaredSum(original))} /><Stat label="Current squared error" value={number(squaredSum(current))} tone="accent" /><Stat label="Operations spent" value={`${number(spent)} / ${number(input.k1 + input.k2)}`} /><Stat label="Operations left" value={number(step?.remaining ?? input.k1 + input.k2)} /></div>
    <Section title="Array comparison" meta="original values"><div className="mssd-array-grid"><div><strong>nums1</strong><PointerRail values={input.nums1} pointers={step?.inspectedIndex == null ? [] : [{ id: 'i', label: 'i', index: step.inspectedIndex, tone: 'primary' }]} /></div><div><strong>nums2</strong><PointerRail values={input.nums2} pointers={step?.inspectedIndex == null ? [] : [{ id: 'i', label: 'i', index: step.inspectedIndex, tone: 'primary' }]} /></div></div></Section>
    <Section title="Current step" meta={step?.phase?.replaceAll('-', ' ') ?? 'ready'}><div className="mssd-status"><span className="mssd-phase">{step?.phase?.replaceAll('-', ' ') ?? 'ready'}</span><span>{step?.message ?? 'Press play or step forward to start the algorithm.'}</span></div></Section>
    {step?.result != null && <Section title="Minimum sum of squared difference" meta="final result"><div className="mssd-result"><strong>{number(step.result)}</strong><span>Final differences: [{step.current.join(', ')}]</span></div></Section>}
  </PanelBody>;
}
function OptimizationPanel({ input, step }) {
  const original = input.nums1.map((a, i) => Math.abs(a - input.nums2[i]));
  const current = step?.current ?? original;
  const biggest = Math.max(0, ...current);
  return <PanelBody>
    <Section title="Why the greedy choice works" meta="marginal savings"><div className="mssd-concept"><strong>One reduction at a time, conceptually</strong><p>For a positive difference <code>d</code>, reducing it by one changes its contribution from <code>d²</code> to <code>(d − 1)²</code>. The saved error is <code>2d − 1</code>. So the biggest difference is the most valuable one to reduce.</p><div className="mssd-savings"><Stat label="Largest current difference" value={number(biggest)} /><Stat label="Saving from one reduction" value={number(biggest > 0 ? 2 * biggest - 1 : 0)} tone="accent" /></div><p>The optimized implementation groups many such greedy reductions into a binary search rather than performing billions of individual operations.</p></div></Section>
    <Section title="Search interval and midpoint" meta="visual bounds"><BinarySearchExplorer input={input} step={step} /></Section>
    <Section title="Binary search state" meta={step?.iteration ? `iteration ${step.iteration}` : 'not started'}><div className="mssd-stat-grid"><Stat label="Lower bound" value={step?.low ?? '—'} /><Stat label="Upper bound" value={step?.high ?? '—'} /><Stat label="Candidate ceiling" value={step?.mid ?? step?.ceiling ?? '—'} tone="accent" /><Stat label="Operations needed" value={step?.mid != null ? number(step.required) : '—'} /></div><Formula step={step} /></Section>
    <Section title="Original difference frequencies" meta="value × count"><BucketView values={original} highlight={step?.mid} /></Section>
    <Section title="Current difference frequencies" meta="after applied reductions"><BucketView values={current} highlight={step?.ceiling} /></Section>
    <Section title="Reduction accounting" meta="operations"><div className="mssd-budget"><div className="mssd-budget-top"><span>Used {number(step ? step.budget - step.remaining : 0)}</span><span>Budget {number(input.k1 + input.k2)}</span></div><div className="mssd-budget-track"><motion.div initial={false} animate={{ width: `${input.k1 + input.k2 ? 100 * (step ? step.budget - step.remaining : 0) / (input.k1 + input.k2) : 0}%` }} /></div><p>Unused operations are permitted. Once all differences reach zero, spending more cannot improve the answer.</p></div></Section>
    <Section title="Squared contribution by index" meta="d²"><div className="mssd-contributions">{current.map((d, i) => <div key={i} className={`mssd-contribution ${step?.inspectedIndex === i ? 'active' : ''}`}><span>Index {i}</span><code>{d}²</code><strong>{number(d * d)}</strong></div>)}</div><div className="mssd-formula"><span>Current squared-error total</span><strong>{number(squaredSum(current))}</strong></div></Section>
    <Section title="Execution detail" meta="code ↔ visualization"><div className="mssd-status"><span className="mssd-phase">{step?.phase ?? 'ready'}</span><span>{step?.message ?? 'The search state will update as code executes.'}</span></div></Section>
  </PanelBody>;
}

export default function MinimumSumofSquaredDifferenceVisualizer() {
  const [form, setForm] = useState(() => formOf(EXAMPLES[0]));
  const [input, setInput] = useState(() => parseInput(formOf(EXAMPLES[0])));
  const [exampleIndex, setExampleIndex] = useState(0);
  const [error, setError] = useState('');
  const steps = useMemo(() => generateSteps(input), [input]);
  const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll();
  const [panelDivs, setPanelDivs] = useState(null);
  const apply = useCallback(() => {
    try {
      const parsed = parseInput(form);
      setInput(parsed);
      setError('');
      setExampleIndex(EXAMPLES.findIndex((e) => JSON.stringify(e.nums1) === JSON.stringify(parsed.nums1) && JSON.stringify(e.nums2) === JSON.stringify(parsed.nums2) && e.k1 === parsed.k1 && e.k2 === parsed.k2));
      handleReset();
    } catch (e) { setError(e.message); }
  }, [form, handleReset]);
  const applyExample = useCallback((index) => {
    const example = EXAMPLES[index];
    setForm(formOf(example));
    setInput({ nums1: [...example.nums1], nums2: [...example.nums2], k1: example.k1, k2: example.k2 });
    setExampleIndex(index);
    setError('');
    handleReset();
  }, [handleReset]);
  const panels = useMemo(() => [
    { id: 'differences', title: 'Difference Explorer' },
    { id: 'optimization', title: 'Greedy Optimization', dockMode: 'split-bottom', ratio: 0.54 },
    { id: 'code', title: 'Code Trace', dockMode: 'split-left', ratio: 0.62 },
  ], []);
  const onPanelReady = useCallback((divs) => setPanelDivs(divs), []);
  return <div className="problem-shell mssd-problem-shell">
    <LuminoDockPanel panels={panels} onPanelReady={onPanelReady} />
    {panelDivs && <>
      {panelDivs.differences && createPortal(<DifferencePanel input={input} step={step} form={form} setForm={setForm} apply={apply} exampleIndex={exampleIndex} applyExample={applyExample} error={error} />, panelDivs.differences)}
      {panelDivs.optimization && createPortal(<OptimizationPanel input={input} step={step} />, panelDivs.optimization)}
      {panelDivs.code && createPortal(<div className="mssd-code-panel"><CodeTracePanel step={step} codeLines={CODE} onActiveLineDomChange={setActiveLineDom} autoScroll={autoScrollCode} /></div>, panelDivs.code)}
    </>}
    {showPatternOverlay && step && activeLineDom && <div className="mssd-pattern-overlay-host"><PatternOverlay step={step} activeLineDom={activeLineDom} /></div>}
    {createPortal(<FloatingPanel title="Playback Controls"><PlaybackControls
      isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay}
      onPrev={stepBack} onNext={stepForward} onReset={handleReset}
      prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0}
      onSpeedChange={(e) => setSpeed(Number(e.target.value))}
      showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay}
      patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle
      autoScroll={autoScrollCode} onAutoScrollChange={setAutoScrollCode}
      autoScrollLabel="Auto-scroll code" showAutoScroll
    /></FloatingPanel>, document.body)}
  </div>;
}
