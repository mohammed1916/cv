import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '165',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with version1 and version2 (JSON)',
  url: 'https://leetcode.com/problems/compare-version-numbers/',
  complexity: 'O(n + m) time and O(n + m) space for n and m parts: split both versions, then compare position by position.',
  examples: [
    { label: 'Two-digit part', input: '{"version1":"2.10.1","version2":"2.9"}' },
    { label: 'Missing parts', input: '{"version1":"1.0","version2":"1.0.0.0"}' },
    { label: 'Leading part', input: '{"version1":"0.3","version2":"0.10"}' },
  ],
}

const partCell = (active, on) => ({
  minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
  border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}`,
  background: on ? '#fde68a' : 'transparent', color: 'var(--text)',
})

export default function CompareVersionNumbers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { parts1, parts2, index, a, b, result } = step.snapshot
    const row = (label, parts, value) => <div>
      <p>{label}</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {parts.map((p, i) => <div key={i} data-index={i} style={partCell(i === index, false)}>
          <div>{p}</div><small>part {i}</small>
        </div>)}
      </div>
      {value !== undefined && value !== null && <p>{value}</p>}
    </div>
    return <>
      <div role="img" aria-label="Version parts">
        {row('version1', parts1, null)}
        {row('version2', parts2, null)}
      </div>
      <p>{index === null ? 'Parts are split and ready to compare.'
        : `Position ${index}: ${a} against ${b}${a === b ? ', equal so far.' : ', decides the answer.'}`}</p>
      <p>Result: <strong>{result === null ? 'not decided yet' : result}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Missing parts are zero:</strong> 1.0 and 1.0.0 are equal, so a shorter version is padded with zeros.</p>
    <p><strong>Numbers, not text:</strong> each part is compared as an integer, so 10 is greater than 9.</p>
  </>} />
}
