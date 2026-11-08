import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1509',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers (JSON)',
  url: 'https://leetcode.com/problems/minimum-difference-between-largest-and-smallest-value-in-three-moves/',
  complexity: 'O(n log n) time for the sort, then four constant-time windows.',
  examples: [
    { label: 'Sample A', input: '[1,20,3,22,2,21]' },
    { label: 'Spread out', input: '[9,4,1,7,15,8]' },
    { label: 'Short', input: '[5,1,9]' },
    { label: 'Single value', input: '[7]' },
    { label: 'Two values', input: '[4,2]' },
    { label: 'Repeated values', input: '[3,3,3,3]' },
    { label: 'Value limits', input: '[-1000,1000,-999,999,0]' },
    { label: 'Long run: 20 values', input: '[-933,-372,-118,-117,290,-517,-803,189,451,921,-745,257,169,272,-589,-652,681,165,707,233]' },
  ],
}

const KEPT = 'color-mix(in srgb, var(--success) 35%, var(--surface2))'
const REMOVED = 'var(--surface)'

export default function MinDifferenceThreeMoves() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { sorted, left, right, best } = step.snapshot
    const hasWindow = left !== null && left !== undefined
    return <>
      <section aria-label="Sorted values">
        <h3>Sorted values: the kept window runs from l to r</h3>
        {sorted ? <div role="img" aria-label="Sorted values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {sorted.map((v, i) => {
            const kept = hasWindow && i >= left && i <= right
            return <div key={i} style={{
              minWidth: 44, padding: '4px 8px', fontFamily: 'monospace', textAlign: 'center', boxSizing: 'border-box', color: 'var(--text)',
              border: `${hasWindow && (i === left || i === right) ? 2 : 1}px solid ${hasWindow && (i === left || i === right) ? 'var(--text)' : 'var(--border)'}`,
              background: kept ? KEPT : REMOVED, opacity: hasWindow && !kept ? 0.5 : 1,
            }}>
              <div>{v}</div>
              <small style={{ display: 'block', height: 14, fontWeight: 700, color: 'var(--text-muted)' }}>
                {hasWindow && i === left ? 'l' : ''}{hasWindow && i === right ? 'r' : ''}
              </small>
            </div>
          })}
        </div> : <p>Values are read but not sorted yet.</p>}
      </section>
      {hasWindow && <p>Changes: {left} smallest and {3 - left} largest values are moved into the window. Kept window: l = {left} to r = {right}; width {sorted[right] - sorted[left]}.</p>}
      <p>Narrowest width so far: <strong>{best === Infinity || best === null || best === undefined ? 'none yet' : best}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Three changes remove at most three values.</strong> Changing a value to any other is best when it moves an extreme value inward, so only the smallest and largest values matter.</p>
    <p><strong>Four splits.</strong> Remove a smallest and 3 - a largest, for a from 0 to 3. The kept values are one contiguous window of the sorted list.</p>
  </>} />
}
