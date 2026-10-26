import IndexedSequence from '../../../components/shared/IndexedSequence';

export default function ExtendedBasicsScene({ kind, step, input }) {
  if (kind === 'gcd') return <>
    <p>Current pair: <strong>a = {step.a}, b = {step.b}</strong>. Remainder: {step.remainder ?? 'not computed'}.</p>
    <table><caption>Euclidean divisions: a = quotient × b + remainder</caption>
      <thead><tr>{['a', 'b', 'Quotient', 'Remainder'].map(label => <th key={label}>{label}</th>)}</tr></thead>
      <tbody>{step.rows.map((row, i) => <tr key={i}>{row.map((value, j) => <td key={j}>{value}</td>)}</tr>)}</tbody>
    </table>
  </>;
  if (!['pair', 'window', 'insertion', 'greater'].includes(kind)) return null;
  const role = i => {
    if (kind === 'pair') return [i === step.left ? 'left pointer' : '', i === step.right ? 'right pointer' : '', i < step.left || i > step.right ? 'excluded' : ''].filter(Boolean).join(' / ');
    if (kind === 'window') return i === step.leaving ? 'leaving' : i === step.entering ? 'entering' : i >= step.left && i <= step.right ? 'in window' : '';
    if (kind === 'insertion') return i === step.hole ? 'hole' : i < step.sorted ? 'sorted prefix' : 'not inserted';
    return step.stack.includes(i) ? 'waiting on stack' : i <= step.index || step.phase === 'done' ? 'resolved' : 'unvisited';
  };
  return <>
    <IndexedSequence label={kind === 'insertion' ? 'Working array: the held key fills the hole' : 'Source array'} length={step.nums.length}
      valueAt={i => kind === 'insertion' && i === step.hole ? '□' : step.nums[i]}
      active={kind === 'greater' ? step.index : kind === 'insertion' ? step.index : -1} roleAt={role} />
    {!step.nums.length && <p>The array is empty.</p>}
    {kind === 'pair' && <p>Target: {input.target} · endpoint sum: {step.sum ?? 'no distinct pair'} · left: {step.left}, right: {step.right}</p>}
    {kind === 'window' && <p>Window [{step.left}, {step.right}] · size {Math.max(0, step.right - step.left + 1)} / {input.k} · running sum: <strong>{step.sum}</strong> · best complete window: {step.best ?? 'none yet'}</p>}
    {kind === 'insertion' && <p>Held key: <strong>{step.key ?? 'none'}</strong> · sorted prefix length: {step.sorted}. The square marks the temporary hole, not another value.</p>}
    {kind === 'greater' && <>
      <IndexedSequence label="Waiting stack: index → value, top on the right" length={step.stack.length} valueAt={i => `${step.stack[i]} → ${step.nums[step.stack[i]]}`} active={step.stack.length - 1} />
      <IndexedSequence label="First greater values: empty means none found" length={step.output.length} valueAt={i => step.output[i] ?? '∅'} active={step.resolved} />
    </>}
  </>;
}
