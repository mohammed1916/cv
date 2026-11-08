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
    { label: 'Tight cans', input: '{"plants":[1,2,4,4,1],"capacityA":4,"capacityB":4}' }, { label: "Single plant", input: "{\"plants\":[1],\"capacityA\":1,\"capacityB\":1}" }, { label: "Capacity equals biggest plant", input: "{\"plants\":[4,4,4],\"capacityA\":4,\"capacityB\":4}" }, { label: "Largest plants", input: "{\"plants\":[50,1,50],\"capacityA\":100,\"capacityB\":50}" }, { label: "Long run: 40 plants", input: "{\"plants\":[10,28,8,18,49,17,11,10,10,35,9,40,5,14,6,42,23,48,1,28,44,43,24,30,50,31,3,33,15,41,21,41,18,9,4,32,4,7,25,10],\"capacityA\":50,\"capacityB\":100}" },
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
