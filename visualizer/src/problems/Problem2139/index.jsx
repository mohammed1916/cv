import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2139',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with target and maxDoubles',
  url: 'https://leetcode.com/problems/minimum-moves-to-reach-target-score/',
  complexity: 'O(log target) time: each halving removes a doubling, and odd values cost one increment each.',
  examples: [
    { label: 'Mixed moves', input: '{"target":26,"maxDoubles":3}' },
    { label: 'No doublings', input: '{"target":7,"maxDoubles":0}' },
    { label: 'Plenty of doublings', input: '{"target":40,"maxDoubles":10}' },
    { label: 'Smallest target', input: '{"target":1,"maxDoubles":0}' },
    { label: 'Exact powers of two', input: '{"target":16,"maxDoubles":4}' },
    { label: 'Largest target', input: '{"target":1000000000,"maxDoubles":100}' },
    { label: 'Long run: random large target', input: '{"target":109695608,"maxDoubles":10}' },
  ],
}

export default function Problem2139Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <RecordStateTable label="Working backwards from the target" columns={['move', 'from', 'to', 'action', 'doublesLeft']} rows={step.rows} activeRow={step.rows.length - 1} />
          <p>Current value: {step.t} · doublings left: {step.doubles} · moves so far: {step.moves}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
