import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2125',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Bank rows as a JSON array of binary strings',
  url: 'https://leetcode.com/problems/number-of-laser-beams-in-a-bank/',
  complexity: 'O(m n) time to count the devices in an m x n bank; O(1) extra space.',
  examples: [
    { label: 'Empty row between', input: '["0110","0000","1001","1110"]' },
    { label: 'Adjacent rows', input: '["10","10"]' },
  ],
}

export default function Problem2125Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <RecordStateTable label="Rows: devices and beams added" columns={['row', 'devices', 'beams', 'note']} rows={step.rows} activeRow={step.i} />
          <p>Total beams so far: {step.total}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
