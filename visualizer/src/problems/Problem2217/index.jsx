import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MirrorBuildView from './MirrorBuildView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2217',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  examples: [
    { label: 'Odd lengths with an overflow', input: '{"queries":[1,7,28,90,900,901],"intLength":5}' },
    { label: 'Even length mirrors the half', input: '{"queries":[1,12,47,90,91],"intLength":4}' },
    { label: 'One digit', input: '{"queries":[1,5,9,10],"intLength":1}' },
    { label: 'Six digits', input: '{"queries":[3,30,300],"intLength":6}' },
    { label: 'Smallest query', input: '{"queries":[1],"intLength":1}' },
    { label: 'Largest values: six digits', input: '{"queries":[1000,999,500,1,250,777],"intLength":6}' },
    { label: 'Long run: six queries', input: '{"queries":[12,345,678,901,234,567],"intLength":6}' },
  ],
  inputLabel: 'Object with queries and intLength (JSON)',
  url: 'https://leetcode.com/problems/find-palindrome-with-fixed-length/',
  complexity: 'O(q * h) time for q queries and h = ceil(intLength / 2) digits per answer. The visualization caps the length at 6 and queries at 1000.',
}

export default function Problem2217Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <MirrorBuildView intLength={run.input.intLength} h={run.frames[0].h} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
