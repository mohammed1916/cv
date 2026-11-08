import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no combination.' },
    { id: 'count', label: 'Count bit', description: 'Count the candidates that have this bit set.' },
    { id: 'record', label: 'New best', description: 'This bit gives a larger combination.' },
    { id: 'done', label: 'Complete', description: 'Report the largest count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with candidates: 1 to 30 positive integers, e.g. {"candidates":[16,17,71]}',
  url: 'https://leetcode.com/problems/largest-combination-with-bitwise-and-greater-than-zero/',
  complexity: 'O(20 * n) time and O(1) extra space. The visualization caps the input at 30 candidates.',
  examples: [
    { label: 'Own: multiples of three', input: '{"candidates":[3,6,9,12,15,18,21]}' },
    { label: 'Own: four distinct candidates', input: '{"candidates":[5,11,22,44]}' },
    { label: 'Single candidate', input: '{"candidates":[1]}' },
    { label: 'Equal candidates', input: '{"candidates":[7,7,7]}' },
    { label: 'Thirty large candidates', input: '{"candidates":[1000000,999999,524288,1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,3,5,6,9,10,12,15,1000]}' },
    { label: 'Long run: 30 candidates', input: '{"candidates":[520678,495580,517215,102056,31000,504897,537326,54012,666236,38919,989722,533479,961799,568368,965445,677566,321732,614133,260077,178037,421728,82170,159081,539546,888509,222425,741692,360343,927453,446157]}' },
  ],
}

export default function LargestCombinationAnd() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { candidates } = run.input
    const roleOf = index => (step.bit >= 0 && (candidates[index] >> step.bit) & 1 ? 'has bit' : '')
    return <>
      <IndexedSequence label={`Candidates, bit ${step.bit < 0 ? '-' : step.bit}`} length={candidates.length}
        valueAt={i => candidates[i].toString(2)} active={-1} roleAt={roleOf} />
      <output aria-label="Best combination">{`Best so far: ${step.best} candidates${step.bestBit >= 0 ? ` (bit ${step.bestBit})` : ''}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A combination's AND is nonzero when every member shares at least one set bit. Choosing all numbers that have one bit set guarantees this.</p>
    <p>So the answer is the largest count of candidates sharing one bit position.</p>
  </>} />
}
