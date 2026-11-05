import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2105',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with plants, capacityA and capacityB',
  url: 'https://leetcode.com/problems/watering-plants-ii/',
  complexity: 'O(n) time with two pointers and O(1) extra space.',
  examples: [
    { label: 'Two refills', input: '{"plants":[2,2,3,3],"capacityA":5,"capacityB":5}' },
    { label: 'Meeting plant', input: '{"plants":[2,3,5,4,1],"capacityA":5,"capacityB":6}' },
    { label: 'Tight cans', input: '{"plants":[1,2,4,4,1],"capacityA":4,"capacityB":4}' },
  ],
}

export default function Problem2105Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Plants (Alice from the left, Bob from the right)" length={run.input.plants.length} valueAt={i => run.input.plants[i]} active={step.l} roleAt={i => step.marks[i] ?? ''} />
          <RecordStateTable label="Water and refills" columns={['who', 'water', 'refills']} rows={[{ who: 'Alice', water: step.a, refills: step.count }, { who: 'Bob', water: step.b, refills: step.count }]} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
