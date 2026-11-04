import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

export default function EqualSubstringVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { cost, left, right, window, spent, maxCost, best } = step.snapshot
    const hasWindow = window.length === 2
    const roleAt = i => {
      if (!hasWindow) return ''
      if (i === left && i === right) return 'l, r'
      if (i === left) return 'l'
      if (i === right) return 'r'
      return i > left && i < right ? 'in window' : ''
    }
    return <>
      <IndexedSequence label="Cost of each position, |s[i] - t[i]|" length={cost.length} valueAt={i => cost[i]} active={right} roleAt={roleAt} />
      <div aria-label="Budget" role="img" style={{ marginTop: 12, height: 14, border: '1px solid var(--border)', background: 'var(--surface2)' }}>
        <div style={{ width: `${Math.min(100, (spent / maxCost) * 100)}%`, height: '100%', background: spent > maxCost ? 'var(--text-dim)' : 'var(--primary)' }} />
      </div>
      <p>Spent {spent} of {maxCost}. Window from l = {hasWindow ? left : '-'} to r = {hasWindow ? right : '-'}. Best window length: {best}.</p>
    </>
  }} renderReasoning={() => <p><strong>Sliding window:</strong> costs are nonnegative, so r only moves right and l moves right only while the window is over budget.</p>} />
}
