import IndexedSequence from '../../components/shared/IndexedSequence'

// Both strings with the current start positions i (in s) and j (in t); the compared characters are marked.
export default function View({ run, step }) {
  const { s, t } = run.input
  const { i, j, len } = step
  const hasPair = i >= 0 && j >= 0
  return <div className="one-diff-view">
    <IndexedSequence label="String s" length={s.length} active={hasPair ? i : -1}
      valueAt={k => s[k]} roleAt={k => (!hasPair ? '' : k >= i && k < i + (len ?? 0) ? 'compared' : k === i ? 'i' : '')} />
    <IndexedSequence label="String t" length={t.length} active={hasPair ? j : -1}
      valueAt={k => t[k]} roleAt={k => (!hasPair ? '' : k >= j && k < j + (len ?? 0) ? 'compared' : k === j ? 'j' : '')} />
    {hasPair && <p>Pair starts: i = {i}, j = {j}{len ? `, length ${len}, mismatches ${step.diffs}` : ''}</p>}
    <p>Count so far: {step.snapshot.count}</p>
  </div>
}
