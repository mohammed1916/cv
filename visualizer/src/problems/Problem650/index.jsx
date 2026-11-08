import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'One A on the screen and no operations yet.' },
    { id: 'factor', label: 'Divide by a factor', description: 'Each factor d costs d operations: one copy and d − 1 pastes.' },
    { id: 'done', label: 'Answer', description: 'The sum of the factors is the minimum.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Target count n (JSON integer)',
  url: 'https://leetcode.com/problems/2-keys-keyboard/',
  complexity: 'O(n) time for this simple divisor scan, with O(1) extra space. Trial division up to √n would be faster for large n.',
  examples: [
    { label: 'Prime', input: '7' },
    { label: 'Square', input: '16' },
    { label: 'Mixed', input: '18' },
    { label: 'Already one', input: '1' },
    { label: 'Powers of two', input: '512' },
    { label: 'Long run: largest n', input: '1000' },
  ],
}

export default function TwoKeysKeyboard() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const rows = run.frames.slice(0, run.frames.indexOf(step) + 1).filter(f => f.phase === 'factor')
      .map(f => ({ factor: f.factor, 'operations added': f.factor, 'copies left to find': f.rest, total: f.steps }))
    return <>
      <RecordStateTable label="Factors taken so far" columns={['factor', 'operations added', 'copies left to find', 'total']} rows={rows} activeRow={rows.length - 1} />
      <output aria-label="Screen length">{`Screen holds ${run.input} A's; remaining factor ${step.rest}; operations ${step.steps}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why factors:</strong> the best plan builds the length from its prime factors in the cheapest order, so each prime p costs p operations.</p>
  </>} />
}
