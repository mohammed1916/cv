import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'scan', label: 'Places', description: 'Read each decimal place from the ones up.' },
    { id: 'done', label: 'Result', description: 'Components from largest to smallest.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'One positive integer',
  url: 'https://leetcode.com/problems/compute-decimal-representation/',
  complexity: 'O(d) time where d is the number of decimal digits, so at most 10 steps here.',
  examples: [
    { label: 'Example', input: '4087' },
    { label: 'Two digits', input: '90' },
  ],
}

export default function ComputeDecimalRepresentation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="components so far" length={step.parts.length} valueAt={i => step.parts[i]} active={-1} roleAt={() => ''} />
    <output aria-label="Current place">{step.place === null ? `n = ${run.input.n}, components ${step.parts.join(', ')}` : `place ${step.place}: digit ${step.digit}${step.part === null ? ' (skipped)' : `, component ${step.part}`}`}</output>
  </>} renderReasoning={() => <>
    <p>Write n in base ten. Each nonzero digit already carries its place value, so digit times that place is one component.</p>
    <p>Reading from the ones place upward and then reversing gives the descending order the answer needs.</p>
  </>} />
}
