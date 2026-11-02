import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Unit 0 is worth 1 of itself.' },
    { id: 'visit', label: 'Visit', description: 'Dequeue a unit and read its arrows.' },
    { id: 'relax', label: 'Convert', description: 'Multiply the unit answer by an arrow factor.' },
    { id: 'done', label: 'Result', description: 'Every unit has its answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of [source, target, factor] conversions (1 to 15 rows)',
  url: 'https://leetcode.com/problems/unit-conversion-i/',
  complexity: 'O(n) time and O(n) space for n units. The visualization caps the input at 15 conversions.',
  examples: [
    { label: 'Example 1', input: '[[0,1,2],[1,2,3]]' },
    { label: 'Example 2', input: '[[0,1,2],[0,2,3],[1,3,4],[1,4,5],[2,5,2],[0,6,3],[6,7,4]]' },
  ],
}

export default function UnitConversionI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="answer" length={step.result.length} valueAt={i => step.result[i]} active={step.unit ?? -1}
      roleAt={i => (step.edge && step.edge[1] === i ? 'target' : step.queue?.includes(i) ? 'queued' : '')} />
    <output aria-label="Current conversion">{step.edge ? `1 unit of ${step.edge[0]} = ${step.edge[2]} of ${step.edge[1]}` : `unit ${step.unit ?? 'none'}`}</output>
    <p>{`Input has ${run.input.length} conversions.`}</p>
  </>} renderReasoning={() => <>
    <p>The arrows form a tree rooted at unit 0. Walking outward with a queue means each unit's answer is final when it is first reached, because it is its parent's answer times one factor.</p>
    <p>Values are kept modulo 1000000007 at every multiplication, so the numbers stay small.</p>
  </>} />
}
