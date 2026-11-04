import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1652',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with code and k (JSON)',
  url: 'https://leetcode.com/problems/defuse-the-bomb/',
  complexity: 'O(n * |k|) time with O(n) output: each position sums up to |k| neighbours from the unchanged input.',
  examples: [
    { label: 'Forward window', input: '{"code":[6,1,3,8],"k":2}' },
    { label: 'Backward window', input: '{"code":[2,9,4],"k":-1}' },
    { label: 'Zero window', input: '{"code":[1,5,2,7],"k":0}' },
  ],
}

export default function DefuseTheBomb() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { values, index, window, sum, output } = step.snapshot
    return <>
      <div role="img" aria-label="Circular values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {values.map((v, i) => {
          const chosen = window?.includes(i)
          return <div key={i} data-index={i} style={{
            minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
            background: chosen ? 'color-mix(in srgb, var(--info) 30%, transparent)' : 'transparent', color: 'var(--text)',
          }}><div>{v}</div><small>{i}{window?.length && i === window[0] ? ' l' : ''}{window?.length && i === window[window.length - 1] ? ' r' : ''}</small></div>
        })}
      </div>
      <p>{index === null ? 'Each position reads the unchanged input.' : `Position ${index} reads ${window.length ? `indices ${window.join(', ')}` : 'nothing'}${sum !== null ? `, sum ${sum}` : ''}.`}</p>
      <p style={{ color: 'var(--text)' }}>Output so far: [{output.map(o => (o === null ? '_' : o)).join(', ')}]</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Read the original:</strong> every position reads only from the input values, never from already written output.</p>
    <p><strong>Circular neighbours:</strong> indices wrap around the ends, so forward and backward windows use modular positions.</p>
  </>} />
}
