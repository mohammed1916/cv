import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1921',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with dist and speed arrays (e.g. {"dist":[1,3,4],"speed":[1,1,1]})',
  url: 'https://leetcode.com/problems/eliminate-maximum-number-of-monsters/',
  complexity: 'O(n log n) time to sort the arrival minutes; the scan is linear.',
  examples: [
    { label: 'All eliminated', input: '{"dist":[1,3,4],"speed":[1,1,1]}' },
    { label: 'Second monster too early', input: '{"dist":[1,1,2,3],"speed":[1,1,1,1]}' },
    { label: 'Single monster', input: '{"dist":[5],"speed":[1]}' },
    { label: 'Equal arrival times', input: '{"dist":[4,8],"speed":[2,4]}' },
    { label: 'Largest values, eight monsters', input: '{"dist":[100,100,100,100,100,100,100,100],"speed":[1,1,1,1,1,1,1,1]}' },
    { label: 'Long run: 8 monsters', input: '{"dist":[15,64,29,82,75,96,29,2],"speed":[27,80,13,38,47,52,85,6]}' },
  ],
}

export default function Problem1921Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      <table aria-label="Arrival race" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th>Shot</th><th>Shot minute</th><th>Arrival minute</th><th>Outcome</th></tr></thead>
        <tbody>{step.sorted.map((t, i) => {
          const current = i === step.i
          return <tr key={i} style={{ background: current ? 'color-mix(in srgb, var(--primary) 18%, transparent)' : 'transparent' }}>
            <td>{i}</td><td>{i}</td><td>{t}</td><td>{current ? (step.lost ? 'arrives first: loss' : 'shot first') : (i < step.i || step.i < 0 ? 'eliminated' : '')}</td>
          </tr>
        })}</tbody>
      </table>
      {step.result !== null && <output aria-label="Eliminated">Eliminated: {step.result}</output>}
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
