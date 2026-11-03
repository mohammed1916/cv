import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import Problem3916View from './Problem3916View'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Length 1', description: 'Every single value is a valid start.' },
    { id: 'length', label: 'Length 2', description: 'Two values with unequal neighbours.' },
    { id: 'up', label: 'Rise', description: 'Count prefixes whose last step went up.' },
    { id: 'down', label: 'Fall', description: 'Count prefixes whose last step went down.' },
    { id: 'done', label: 'Total', description: 'Sum all prefix counts of length n.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (array length), l and r (value range); r - l at most 5',
  url: 'https://leetcode.com/problems/number-of-zigzag-arrays-iii/',
  complexity: 'O(n * m^2) time with direct sums, or O(n * m) with running prefix sums, and O(m) space for m = r - l + 1 values. Results are taken modulo 1000000007. The visualization caps n at 8 and m at 6.',
  examples: [
    { label: 'Three values', input: '{"n":3,"l":1,"r":3}' },
    { label: 'Four long', input: '{"n":4,"l":1,"r":4}' },
  ],
}

export default function Problem3916Visualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <Problem3916View run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A zigzag array alternates up and down steps, so the next step must reverse the last one; the two count rows encode exactly that.</p>
  </>} />
}
