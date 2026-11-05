import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1064',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of strictly increasing integers',
  url: 'https://leetcode.com/problems/fixed-point/',
  complexity: 'O(log n) time and O(1) extra space. Each probe discards one side of the window.',
  examples: [
    { label: 'Run of fixed points', input: '[-3,1,2,3,7]' },
    { label: 'Single fixed point', input: '[-2,0,1,3,5]' },
    { label: 'None', input: '[-6,-2,1,4,9]' },
  ],
}

export default function FixedPoint() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { values, lo, hi, mid, answer } = step.state
    return <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} role="img" aria-label="Array values with indices">
        {values.map((value, index) => {
          const inWindow = index >= lo && index <= hi
          const fixed = value - index === 0
          return <div key={index} data-index={index} style={{
            minWidth: 58, padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace',
            border: `2px solid ${index === mid ? 'var(--primary)' : 'var(--border)'}`,
            opacity: inWindow ? 1 : 0.35,
            background: fixed ? 'var(--surface2)' : 'transparent', color: 'var(--text)',
          }}>
            <div>{value}</div>
            <small>index {index}</small>
            <div style={{ fontSize: '.7rem', color: 'var(--primary)', minHeight: '1em' }}>{index === mid ? 'mid' : index === lo ? 'lo' : index === hi ? 'hi' : ''}</div>
            <div style={{ fontSize: '.75rem' }}>{`gap ${value - index}`}</div>
          </div>
        })}
      </div>
      <output aria-label="Search window">{lo <= hi ? `Search range lo = ${lo}, hi = ${hi}${mid !== null ? `, middle tested mid = ${mid}` : ''}` : 'Search range empty'} · answer {answer}</output>
    </div>
  }} renderReasoning={() => <>
    <p><strong>Gap idea:</strong> the gap value minus index never decreases, because consecutive integers differ by at least one.</p>
    <p><strong>Discard rule:</strong> a negative gap rules out everything left of mid, a positive gap rules out everything right of mid.</p>
    <p><strong>Earlier answers:</strong> a zero gap is recorded, then the left side is searched for an earlier zero.</p>
  </>} />
}
