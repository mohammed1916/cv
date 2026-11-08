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
    { label: 'Branch from unit zero', input: '[[0,2,3],[2,1,4],[0,3,2]]' },
    { label: 'Example 2', input: '[[0,1,3],[0,2,2],[2,3,4],[2,4,5]]' },
    { label: 'One conversion', input: '[[0,1,2]]' },
    { label: 'Equal factors from unit 0', input: '[[0,1,3],[0,2,3]]' },
    { label: 'Largest factor chain', input: '[[0,1,10],[1,2,10],[2,3,10]]' },
    { label: 'Long run: 15 conversions', input: '[[0,1,10],[1,2,2],[0,3,2],[0,4,3],[4,5,8],[3,6,8],[4,7,1],[0,8,8],[4,9,3],[0,10,1],[3,11,10],[1,12,6],[8,13,1],[7,14,9],[2,15,8]]' },
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
