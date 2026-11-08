import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1287',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Sorted array (JSON)',
  url: 'https://leetcode.com/problems/element-appearing-more-than-25-in-sorted-array/',
  complexity: 'O(n) time and O(1) extra space: one left-to-right pass over the sorted runs.',
  examples: [
    { label: 'Clear majority run', input: '[1,1,2,3,3,3,4,5]' },
    { label: 'Early run', input: '[7,7,7,7,9]' },
    { label: 'No long run', input: '[1,2,4,4,5,6,7,8]' },
    { label: 'Single value', input: '[5]' },
    { label: 'Negative values', input: '[-1000,-1000,-3,0,0,0,7,1000]' },
    { label: 'Long run: 100 values', input: '[-969,-940,-917,-901,-882,-875,-872,-865,-828,-808,-773,-757,-742,-739,-726,-685,-675,-650,-631,-597,-592,-531,-527,-522,-452,-433,-429,-403,-375,-311,-303,-301,-293,-268,-246,-142,-133,-130,-126,-111,-105,-92,-64,-52,5,19,34,123,124,161,179,182,185,191,204,215,246,251,275,300,319,329,338,344,352,384,393,396,422,453,454,461,470,483,488,502,514,523,523,542,569,573,576,603,610,673,697,736,754,768,774,799,841,844,846,857,879,896,901,938]' },
  ],
}

export default function QuarterValue() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { start, end, found, n } = step.snapshot
    return <>
      <div role="img" aria-label="Sorted array with the current run" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {run.input.map((v, i) => {
          const inRun = start !== null && i >= start && i < end
          return <div key={i} data-index={i} style={{
            minWidth: 40, padding: '6px 4px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${inRun ? 2 : 1}px solid ${found !== null && i >= start && i < end ? 'var(--success)' : inRun ? 'var(--primary)' : 'var(--border)'}`,
            background: found !== null && i >= start && i < end ? 'var(--surface)' : inRun ? 'var(--surface2)' : 'var(--surface)', color: 'var(--text)',
          }}><div>{v}</div><small style={{ color: 'var(--text-muted)' }}>{i}</small><div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700 }}>{start === i ? 'i' : ''}{start !== null && end - 1 === i ? ' j-1' : ''}</div></div>
        })}
      </div>
      {start !== null && <p>Window for the current run: i = {start}, j = {end} (the run is arr[i] to arr[j-1]).</p>}
      <p>{start === null ? 'No run is being measured.' : `Run of ${end - start} equal values (threshold: more than ${n / 4}).`}</p>
      {found !== null && <p><strong>Answer:</strong> {found}</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Sorted means runs:</strong> equal values sit next to each other, so each value is a single block that can be measured.</p>
    <p><strong>Strict quarter:</strong> a run qualifies only when 4 times its length exceeds the array length, so exactly 25% does not count.</p>
  </>} />
}
