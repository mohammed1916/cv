import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  number: '1482',
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Garden (JSON object with bloomDay, m and k)',
  url: 'https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/',
  complexity: 'O(n log(max day - min day)) time and O(1) extra space. The visualization caps the garden at 60 flowers.',
  examples: [
    { label: 'Feasible', input: '{"bloomDay":[7,3,9,2,8,4,6,5],"m":2,"k":3}' },
    { label: 'Too few', input: '{"bloomDay":[4,9,2],"m":2,"k":2}' },
    { label: 'Single bouquet', input: '{"bloomDay":[5,1,4],"m":1,"k":2}' },
  ],
}

export default function BouquetDaysVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Bloom day of each flower" length={run.input.bloomDay.length}
      valueAt={i => run.input.bloomDay[i]} active={step.scene.index}
      roleAt={i => (step.scene.mid !== null && step.scene.mid !== undefined && run.input.bloomDay[i] <= step.scene.mid ? 'read' : '')} />
    <StackLane title="Search range for the day" items={step.scene.lo !== null ? [`${step.scene.lo} … ${step.scene.hi}`] : []}
      note={step.scene.mid !== null && step.scene.mid !== undefined ? `testing day ${step.scene.mid}` : undefined} />
    <StackLane title="Bouquets on the tested day" items={[`${step.scene.bouquets} of ${run.input.m}`]} />
  </>} renderReasoning={({ step }) => <>
    <p>The test "can we make m bouquets by day d" only becomes easier as d grows, so the earliest working day can be found by binary search.</p>
    <p>{step.message}</p>
  </>} />
}
